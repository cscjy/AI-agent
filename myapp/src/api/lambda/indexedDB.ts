// 1. 定义数据类型
type Todo = {
  id?: number; // 主键（自增）
  userData: string;
  aiData: string;
  time: string;
};
const db = ['TodoDB'];
// 2. 初始化数据库 + CRUD
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('messageDB', 1);

    // 创建/更新数据库
    request.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      // 创建存储仓库（表）
      db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror = e => reject((e.target as IDBOpenDBRequest).error);
  });
};

// 3. CRUD 工具函数
const dbCRUD = {
  // 新增
  add: async (todo: Omit<Todo, 'id'>): Promise<number> => {
    const db = await initDB();
    return new Promise(resolve => {
      const tx = db.transaction('todos', 'readwrite');
      const store = tx.objectStore('todos');
      const req = store.add(todo as Todo);
      console.log(req, '存储成功');
      req.onsuccess = () => resolve(req.result as number);
      tx.oncomplete = () => db.close();
    });
  },

  // 查询所有
  getAll: async (): Promise<Todo[]> => {
    const db = await initDB();
    return new Promise(resolve => {
      const tx = db.transaction('todos', 'readonly');
      const store = tx.objectStore('todos');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as Todo[]);
      tx.oncomplete = () => db.close();
    });
  },

  // 更新
  update: async (todo: Todo): Promise<void> => {
    const db = await initDB();
    return new Promise(resolve => {
      const tx = db.transaction('todos', 'readwrite');
      const store = tx.objectStore('todos');
      store.put(todo);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  },

  // 删除
  delete: async (id: number): Promise<void> => {
    const db = await initDB();
    return new Promise(resolve => {
      const tx = db.transaction('todos', 'readwrite');
      const store = tx.objectStore('todos');
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  },
};

export default dbCRUD;
