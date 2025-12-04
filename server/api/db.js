// db.js
const { MongoClient } = require('mongodb');

// MongoDB连接URI（本地或远程）
const uri = 'mongodb://127.0.0.1:27017';
// 数据库名称
const dbName = 'user_db';

// 单例客户端实例
let client;
let dbInstance;

/**
 * 获取MongoDB客户端和数据库实例（单例）
 */
async function getDb() {
  if (dbInstance) {
    // 已连接，直接返回复用
    return dbInstance;
  }

  try {
    // 创建客户端（首次连接）
    client = new MongoClient(uri, {
      // 连接池配置（可选）
      maxPoolSize: 10, // 最大连接数（默认5，可根据并发调整）
      minPoolSize: 2,  // 最小空闲连接数
      waitQueueTimeoutMS: 2000, // 连接等待超时
    });

    // 连接数据库
    await client.connect();
    console.log('MongoDB已成功建立持续连接');

    // 获取数据库实例
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (err) {
    console.error('MongoDB连接失败:', err);
    throw err; // 抛出错误让调用方处理
  }
}


/**
 * 关闭MongoDB连接（应用退出时调用）
 */
async function closeDb() {
  if (client) {
    await client.close();
    dbInstance = null;
    console.log('MongoDB连接已关闭');
  }
}

// 导出方法
module.exports = { getDb , closeDb };