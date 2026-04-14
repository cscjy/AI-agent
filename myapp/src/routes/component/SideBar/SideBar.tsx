import dbCRUD from '@/api/lambda/indexedDB';
import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import './SideBard.css';
import axios from 'axios';
import { Context } from '../context/Context';

const SideBar = () => {
  const [extended, setExtended] = useState(true);
  const [listMessage, setListMessage] = useState<
    Array<{
      id: number;
      role: 'user' | 'ai' | string;
      message: string;
    }>
  >([]);
  const context = useContext(Context);
  // biome-ignore lint/correctness/useExhaustiveDependencies: context is intentionally used as dependency
  useEffect(() => {
    async function getDB() {
      const data = await dbCRUD.getAll();
      const list: Array<{ id: number; role: string; message: string }> = [];
      for (const item of data) {
        list.push({
          id: item?.id,
          role: 'user',
          message: item.userData,
        });
      }
      setListMessage(list);
    }
    getDB();
  }, [context]);

  // 核心：删除指定id的项（生成新数组，不修改原数组）并且删除数据库的对应的用户和机器人回答的
  // 并且删除后端的数据
  const deleteUserMessage = async (targetId: number) => {
    // 过滤掉id等于targetId的项，得到新数组
    const newList = listMessage.filter(item => item.id !== targetId);
    setListMessage(newList);
    dbCRUD.delete(targetId);
    context?.setDataChange(!context?.dataChange);
    await axios.post(`http://localhost:3000/api/delete?id=${targetId}`);
    // 更新state
  };
  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu"
          src={assets.menu_icon}
          alt="菜单"
          onClick={() => setExtended(!extended)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setExtended(!extended);
          }}
        />
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {listMessage.map(item => (
              <div key={item.id} className="recent-entry">
                <img src={assets.message_icon} alt="" />
                <p>{item.message.slice(0, 18)}...</p>
                <img
                  src={assets.trash}
                  onClick={() => {
                    deleteUserMessage(item.id);
                  }}
                  alt="删除"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ')
                      deleteUserMessage(item.id);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
