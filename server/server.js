const express = require('express');
const { updata,getdata,deleteAllData}  = require('./api/useServer')
const { ChatOpenAI }  = require("@langchain/openai");
const { TavilySearch } = require("@langchain/tavily") ;
const { createAgent } = require("langchain") ;


const llm = new ChatOpenAI({
  model: "doubao-1-5-thinking-pro-250415",
  modelProvider: "doubao",
  apiKey: "c6c67de4-c688-4f77-b4a6-af40c59ebe95",
  // 添加系统提示
  systemMessage: "你是一个专业的助手，回答问题时要简洁明了，并且使用中文。",
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  },
  streaming:true
});
// Tavily搜索工具初始化
const tavilyTool = new TavilySearch({
  tavilyApiKey:"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",
  maxResults: 3,
});





const app = express();

// 1. 配置请求体解析中间件（必须写在路由之前）
app.use(express.json()); // 解析JSON格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析表单格式的请求体



// 处理OPTIONS预检请求
app.use('/api/data', (req, res,next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // 处理OPTIONS预检请求
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



// server.js 中新增 GET 路由处理 SSE
app.get('/api/stream', async (req, res) => {
  console.log('连接成功')
  //获取用户数据库数据，结合上下文使用
  const dbData = await getdata()
  const userContext = dbData.map(item => {
          return { 
            role: "user", 
            content: item.userData 
          }})
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.flushHeaders();

  const useInternet = req.query.useInternet === 'true';
  const userPrompt = req.query.prompt || '';
  
  try {
    console.log("useInternet",useInternet,req.query.useInternet,req.query)
    // 如果启用联网功能，先进行Tavily搜索
    if (false) {
       // 给大模型构建思考
        console.log('进入联网模式')
        const agent = createAgent({
          llm:llm,
          tools: [tavilyTool],
        });
        const stream = await agent.stream({
          messages: [{ role: "user", content:userPrompt }],
        });
        for await (const chunk of stream) {
          if (res.writableEnded) break;
          res.write(`data: ${JSON.stringify({ 
            type: 'content', 
            content: chunk.content || ''
          })} \n\n`);
        }
    }else{
        //不使用联网搜索
        const stream = await llm.stream([  // 系统提示：定义模型的行为和角色
          { 
            role: "system", 
            content: "你是一个专业的技术顾问，回答要简洁、准确、专业。同时判断问题是否要结合用户的历史问题记录，完成对用户的回答，需要则结合用户历史问题回答，不需要则自己回答问题" 
          },
          // 用户提示：具体的问题
          { 
            role: "user", 
            content: userPrompt 
          },...userContext]);
        for await (const chunk of stream) {
          if (res.writableEnded) break;
          res.write(`data: ${JSON.stringify({ 
            type: 'content', 
            content: chunk.content || ''
          })} \n\n`);
        }
    }
  } catch (error) {
    console.error('处理错误:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      content: useInternet ? '联网搜索过程中发生错误，请稍后重试' : '模型调用出错，请稍后重试' 
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

app.listen(3000, () => {
   console.log('HTTP 服务器启动于 3000 端口');
});
