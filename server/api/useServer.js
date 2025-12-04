// userService.js
const { getDb } = require('./db');

// 集合名称
const COLLECTION_NAME = 'user_data';

async function updata(data) {
  try {
        const db = await getDb()
        const collection = db.collection(COLLECTION_NAME);
        await collection.insertOne(data);
        return {
          success: 200,
          message: '数据插入成功'
        };
  } catch (error) {
        return {
          success: 404,
          error: error.message,
          message: '数据插入失败'
        };
  }
}

async function getdata() {
        try {
                  const db = await getDb()
                  const collection = db.collection(COLLECTION_NAME);
                  const dataList = await collection.find().toArray()
                  return {
                    success:200,
                    data:dataList,
                    message:'数据放回成功'
                  }
        } catch (error) {
                    return {
                    success: 404,
                    error: error.message,
                    message: '数据返回失败'
                  };
        }

}
/**
 * 删除集合中的所有数据（清空集合）
 * @returns {Promise<Object>} 删除结果
 */
async function deleteAllData() {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.deleteMany({});
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `成功清空集合，共删除 ${result.deletedCount} 条数据`
    };
  } catch (error) {
    console.error(`清空集合失败 [${collectionName}]:`, error);
    return {
      success: false,
      error: error.message,
      message: '清空集合失败'
    };
  }
}

module.exports = {
  updata,
  getdata,
  deleteAllData
}