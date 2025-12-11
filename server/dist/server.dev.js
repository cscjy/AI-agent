"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var express = require('express');

var _require = require('./api/useServer'),
    updata = _require.updata,
    getdata = _require.getdata,
    deleteAllData = _require.deleteAllData,
    deleteData = _require.deleteData;

var _require2 = require("@langchain/openai"),
    ChatOpenAI = _require2.ChatOpenAI;

var _require3 = require("@langchain/tavily"),
    TavilySearch = _require3.TavilySearch;

var _require4 = require("@langchain/core/prompts"),
    ChatPromptTemplate = _require4.ChatPromptTemplate,
    MessagesPlaceholder = _require4.MessagesPlaceholder;

var _require5 = require("@langchain/core/agents"),
    AgentExecutor = _require5.AgentExecutor,
    createOpenAIFunctionsAgent = _require5.createOpenAIFunctionsAgent;

var llm = new ChatOpenAI({
  model: "doubao-1-5-thinking-pro-250415",
  modelProvider: "doubao",
  apiKey: "c6c67de4-c688-4f77-b4a6-af40c59ebe95",
  // 添加系统提示
  systemMessage: "你是一个专业的助手，回答问题时要简洁明了，并且使用中文。",
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3"
  },
  streaming: true
}); // Tavily搜索工具初始化

var tavilyTool = new TavilySearch({
  tavilyApiKey: "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",
  maxResults: 3,
  searchDepth: "advanced",
  includeRawContent: false
});
var tools = [tavilyTool];
var app = express(); // 1. 配置请求体解析中间件（必须写在路由之前）

app.use(express.json()); // 解析JSON格式的请求体

app.use(express.urlencoded({
  extended: true
})); // 解析表单格式的请求体
// 处理OPTIONS预检请求

app.use('/api/data', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 处理OPTIONS预检请求

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}); //1.保存数据

app.post('/api/data', function _callee(req, res) {
  var data;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('开始保存', req.body);
          _context.next = 3;
          return regeneratorRuntime.awrap(updata(req.body));

        case 3:
          data = _context.sent;
          console.log(data);
          res.send({
            code: 200,
            msg: '保存成功'
          });

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}); // server.js 中新增 GET 路由处理 SSE

app.get('/api/stream', function _callee2(req, res) {
  var dbData, userContext, useInternet, userPrompt, agent, agentExecutor, stream, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk, _stream, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, _chunk;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('连接成功'); //获取用户数据库数据，结合上下文使用

          _context2.next = 3;
          return regeneratorRuntime.awrap(getdata());

        case 3:
          dbData = _context2.sent;
          console.log(dbData);
          userContext = dbData.data.map(function (item) {
            return {
              role: "user",
              content: item.userData
            };
          }); // 设置 SSE 响应头

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
          res.flushHeaders();
          useInternet = req.query.useInternet === 'true';
          userPrompt = req.query.prompt || '';
          _context2.prev = 14;
          console.log("useInternet", useInternet, req.query.useInternet, req.query); // 如果启用联网功能，先进行Tavily搜索

          if (!useInternet) {
            _context2.next = 62;
            break;
          }

          // 给大模型构建思考
          console.log('进入联网模式');
          _context2.next = 20;
          return regeneratorRuntime.awrap(createOpenAIFunctionsAgent({
            llm: llm,
            tools: tools,
            prompt: prompt
          }));

        case 20:
          agent = _context2.sent;
          agentExecutor = new AgentExecutor({
            agent: agent,
            tools: tools,
            verbose: true,
            // 开启日志，可查看工具调用全过程
            handleParsingErrors: true // 自动处理工具调用解析错误（最新特性）

          });
          _context2.next = 24;
          return regeneratorRuntime.awrap(agentExecutor.invoke({
            input: userPrompt
          }));

        case 24:
          stream = _context2.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _context2.prev = 27;
          _iterator = _asyncIterator(stream);

        case 29:
          _context2.next = 31;
          return regeneratorRuntime.awrap(_iterator.next());

        case 31:
          _step = _context2.sent;
          _iteratorNormalCompletion = _step.done;
          _context2.next = 35;
          return regeneratorRuntime.awrap(_step.value);

        case 35:
          _value = _context2.sent;

          if (_iteratorNormalCompletion) {
            _context2.next = 44;
            break;
          }

          chunk = _value;

          if (!res.writableEnded) {
            _context2.next = 40;
            break;
          }

          return _context2.abrupt("break", 44);

        case 40:
          res.write("data: ".concat(JSON.stringify({
            type: 'content',
            content: chunk.content || ''
          }), " \n\n"));

        case 41:
          _iteratorNormalCompletion = true;
          _context2.next = 29;
          break;

        case 44:
          _context2.next = 50;
          break;

        case 46:
          _context2.prev = 46;
          _context2.t0 = _context2["catch"](27);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 50:
          _context2.prev = 50;
          _context2.prev = 51;

          if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
            _context2.next = 55;
            break;
          }

          _context2.next = 55;
          return regeneratorRuntime.awrap(_iterator["return"]());

        case 55:
          _context2.prev = 55;

          if (!_didIteratorError) {
            _context2.next = 58;
            break;
          }

          throw _iteratorError;

        case 58:
          return _context2.finish(55);

        case 59:
          return _context2.finish(50);

        case 60:
          _context2.next = 100;
          break;

        case 62:
          _context2.next = 64;
          return regeneratorRuntime.awrap(llm.stream([// 系统提示：定义模型的行为和角色
          {
            role: "system",
            content: "你是一个专业的技术顾问，回答要简洁、准确、专业。同时判断问题是否要结合用户的历史问题记录，完成对用户的回答，需要则结合用户历史问题回答，不需要则自己回答问题"
          }].concat(_toConsumableArray(userContext), [{
            role: "user",
            content: userPrompt
          }])));

        case 64:
          _stream = _context2.sent;
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _context2.prev = 67;
          _iterator2 = _asyncIterator(_stream);

        case 69:
          _context2.next = 71;
          return regeneratorRuntime.awrap(_iterator2.next());

        case 71:
          _step2 = _context2.sent;
          _iteratorNormalCompletion2 = _step2.done;
          _context2.next = 75;
          return regeneratorRuntime.awrap(_step2.value);

        case 75:
          _value2 = _context2.sent;

          if (_iteratorNormalCompletion2) {
            _context2.next = 84;
            break;
          }

          _chunk = _value2;

          if (!res.writableEnded) {
            _context2.next = 80;
            break;
          }

          return _context2.abrupt("break", 84);

        case 80:
          res.write("data: ".concat(JSON.stringify({
            type: 'content',
            content: _chunk.content || ''
          }), " \n\n"));

        case 81:
          _iteratorNormalCompletion2 = true;
          _context2.next = 69;
          break;

        case 84:
          _context2.next = 90;
          break;

        case 86:
          _context2.prev = 86;
          _context2.t1 = _context2["catch"](67);
          _didIteratorError2 = true;
          _iteratorError2 = _context2.t1;

        case 90:
          _context2.prev = 90;
          _context2.prev = 91;

          if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
            _context2.next = 95;
            break;
          }

          _context2.next = 95;
          return regeneratorRuntime.awrap(_iterator2["return"]());

        case 95:
          _context2.prev = 95;

          if (!_didIteratorError2) {
            _context2.next = 98;
            break;
          }

          throw _iteratorError2;

        case 98:
          return _context2.finish(95);

        case 99:
          return _context2.finish(90);

        case 100:
          _context2.next = 106;
          break;

        case 102:
          _context2.prev = 102;
          _context2.t2 = _context2["catch"](14);
          console.error('处理错误:', _context2.t2);
          res.write("data: ".concat(JSON.stringify({
            type: 'error',
            content: useInternet ? '联网搜索过程中发生错误，请稍后重试' : '模型调用出错，请稍后重试'
          }), " \n\n"));

        case 106:
          res.write("data: ".concat(JSON.stringify({
            type: 'complete',
            message: '生成完成'
          }), " \n\n"));
          res.end();

        case 108:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[14, 102], [27, 46, 50, 60], [51,, 55, 59], [67, 86, 90, 100], [91,, 95, 99]]);
});
app.get('/api/getData', function _callee3(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(getdata());

        case 2:
          result = _context3.sent;
          res.send(result);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app["delete"]('/api/deleteData', function _callee4(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(deleteAllData());

        case 2:
          result = _context4.sent;
          res.send(result);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app["delete"]('/api/delete', function _callee5(req, res) {
  var id, result;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          // 从路径参数中获取id（注意转成数字类型，匹配数据库字段类型）
          id = Number(req.params.id); // 将id传入数据库删除函数

          _context5.next = 4;
          return regeneratorRuntime.awrap(deleteData(id));

        case 4:
          result = _context5.sent;
          res.send({
            success: true,
            data: result
          });
          _context5.next = 11;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          res.status(500).send({
            success: false,
            error: _context5.t0.message
          });

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
app.listen(3000, function () {
  console.log('HTTP 服务器启动于 3000 端口');
});