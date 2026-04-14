const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { updata,getdata,deleteAllData,deleteData}  = require('./api/useServer')
const { ChatOpenAI }  = require("@langchain/openai");
const { TavilySearch  } = require("@langchain/tavily") ;
const { HumanMessage, SystemMessage } = require("@langchain/core/messages") ;

const DOUBAO_TEXT_API_KEY = process.env.DOUBAO_TEXT_API_KEY;
const DOUBAO_IMAGE_API_KEY = process.env.DOUBAO_IMAGE_API_KEY;
const DOU_BAO_BASE_URL = process.env.DOU_BAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const DOU_BAO_TEXT_MODEL = process.env.DOU_BAO_TEXT_MODEL || 'doubao-seed-2-0-code-preview-260215';
const DOU_BAO_IMAGE_MODEL = process.env.DOU_BAO_IMAGE_MODEL || 'doubao-seedream-5-0-260128';

if (!DOUBAO_TEXT_API_KEY) {
  console.error('错误：缺少环境变量 DOUBAO_TEXT_API_KEY');
  process.exit(1);
}
if (!DOUBAO_IMAGE_API_KEY) {
  console.error('错误：缺少环境变量 DOUBAO_IMAGE_API_KEY');
  process.exit(1);
}


const llm = new ChatOpenAI({
  model: DOU_BAO_TEXT_MODEL,
  modelProvider: "doubao",
  apiKey: DOUBAO_TEXT_API_KEY,
  // 添加系统提示
  systemMessage: "你是一个专业的助手，回答问题时要简洁明了，并且使用中文。",
  configuration: {
    baseURL: DOU_BAO_BASE_URL,
  },
  streaming:true
});

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_API_KEY) {
  console.error('错误：缺少环境变量 TAVILY_API_KEY');
  process.exit(1);
}

// Tavily搜索工具初始化
const tavily = new TavilySearch({
  tavilyApiKey: TAVILY_API_KEY,
  maxResults: 3,
  searchDepth: "advanced",
  includeRawContent: false, 
});



const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片上传'));
    }
  },
});

const buildImagePrompt = (userPrompt = '', referenceUrl = '') => {
  const trimmed = userPrompt?.trim();
  if (referenceUrl && trimmed) {
    return `${trimmed}\n请按照上述描述，并结合上传图片进行改写。`;
  }
  if (referenceUrl) {
    return '请参考上传的图片，对其风格进行优化和润色。';
  }
  return trimmed || '请生成一张富有创意的高清图像。';
};

const streamImageAnalysis = async ({ prompt, referenceUrl, res }) => {
  if (res.writableEnded) return;
  const finalPrompt = buildImagePrompt(prompt, referenceUrl);
  res.write(`data: ${JSON.stringify({ type: 'status', content: '图片已上传，正在生成图像...' })} \n\n`);
  try {
    const requestPayload = {
      model: DOU_BAO_IMAGE_MODEL,
      prompt: finalPrompt,
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: '2K',
      stream: false,
      watermark: true,
    };
    if (referenceUrl) {
      requestPayload.image = referenceUrl;
    }
    const response = await fetch(`${DOU_BAO_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DOUBAO_IMAGE_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || '图片模型请求失败');
    }

    const payload = await response.json();
    const imageUrl = payload?.data?.[0]?.url;
    if (imageUrl) {
      res.write(`data: ${JSON.stringify({ type: 'content', content: `![AI生成图片](${imageUrl})` })} \n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: '图片模型未返回可用链接' })} \n\n`);
    }
  } catch (error) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', content: `图片模型调用失败：${error.message || error}` })} \n\n`);
    }
  }
};

// 1. 配置请求体解析中间件（必须写在路由之前）
app.use(express.json()); // 解析JSON格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析表单格式的请求体
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// 处理全局CORS
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:8081').split(',').map(s => s.trim())
);

app.use((req,res,next) => {
  const requestOrigin = req.headers.origin;
  const allowedList = Array.from(allowedOrigins);
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else if (allowedList.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedList.length > 0) {
    res.setHeader('Access-Control-Allow-Origin', allowedList[0]);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
//1.保存数据
app.post('/api/data',async (req, res) => {
        console.log('开始保存',req.body)
        const data = await updata(req.body);
        console.log(data);
        res.send({ code: 200, msg: '保存成功' });
      }
);

// 上传图片接口
app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).send({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).send({ success: false, message: '未获取到图片' });
    }
    const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    res.send({
      success: true,
      message: '图片上传成功',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
});



// server.js 中新增 GET 路由处理 SSE
app.get('/api/stream', async (req, res) => {
  console.log('连接成功');
  //获取用户数据库数据，结合上下文使用
  const dbData = await getdata();
  const userContext = Array.isArray(dbData.data)
    ? dbData.data.map(item => ({ role: 'user', content: item.userData }))
    : [];
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
  }
  res.setHeader('Vary', 'Origin');
  res.flushHeaders();

  const useInternet = req.query.useInternet === 'true';
  const userPrompt = typeof req.query.prompt === 'string' ? req.query.prompt : '';
  const referenceImageUrl = typeof req.query.imageUrl === 'string' ? req.query.imageUrl : '';

  try {
    if (referenceImageUrl) {
      await streamImageAnalysis({ prompt: userPrompt, referenceUrl: referenceImageUrl, res });
    }

    if (userPrompt && userPrompt.trim()) {
      console.log('useInternet', useInternet, req.query.useInternet, req.query);
      if (useInternet) {
        console.log('进入联网模式');
        const results = await tavily.invoke({ query: userPrompt });
        const context = results.results?.map(r => r.content) || '';
        const stream = await llm.stream([
          new SystemMessage(`基于: ${context}`),
          new HumanMessage(userPrompt),
        ]);
        for await (const chunk of stream) {
          if (res.writableEnded) break;
          res.write(`data: ${JSON.stringify({
            type: 'content',
            content: chunk.content || '',
          })} \n\n`);
        }
      } else {
        const stream = await llm.stream([
          {
            role: 'system',
            content:
              '你是一个专业的技术顾问，回答要简洁、准确、专业。同时判断问题是否要结合用户的历史问题记录，完成对用户的回答，需要则结合用户历史问题回答，不需要则自己回答问题',
          },
          ...userContext,
          {
            role: 'user',
            content: userPrompt,
          },
        ]);
        for await (const chunk of stream) {
          if (res.writableEnded) break;
          res.write(`data: ${JSON.stringify({
            type: 'content',
            content: chunk.content || '',
          })} \n\n`);
        }
      }
    } else if (!referenceImageUrl) {
      res.write(`data: ${JSON.stringify({ type: 'error', content: '请输入问题或上传图片。' })} \n\n`);
    }
  } catch (error) {
    console.error('处理错误:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      content: useInternet ? '联网搜索过程中发生错误，请稍后重试' : '模型调用出错，请稍后重试',
    })} \n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'complete', message: '生成完成' })} \n\n`);
  res.end();
});
app.get('/api/getData',async (req, res) => {
  const result = await getdata();
  res.send(result)
})


app.delete('/api/deleteData',async (req, res) => {
  const result = await deleteAllData();
  res.send(result)
})


app.delete('/api/delete',async (req, res) => {
   try {
    // 从路径参数中获取id（注意转成数字类型，匹配数据库字段类型）
    const id = Number(req.params.id);
    console.log(id)
    if(!id){
      return
    }
    // 将id传入数据库删除函数
    const result = await deleteData(id);
    res.send({ success: true, data: result });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
})

app.listen(PORT, () => {
   console.log(`HTTP 服务器启动于 ${PORT} 端口`);
});
