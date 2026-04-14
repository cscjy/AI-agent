import dbCRUD from '@/api/lambda/indexedDB';
import { Link } from '@modern-js/runtime/router';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { get } from '../api/lambda/data';
import styles from '../css/page.module.css';
import AiText from './component/AiText';
import Message from './component/Message';
import SideBar from './component/SideBar/SideBar';
import UserText from './component/UserText';
import { Context } from './component/context/Context';

type PendingMessage = {
  prompt: string;
  image?: {
    url: string;
    filename: string;
  };
};
/**
 * 路由的根组件
 */
const Index = () => {
  const [html, setHtml] = useState<string>('');
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(
    null,
  );
  const [listMessage, setListMessage] = useState<
    Array<{
      id: string;
      role: 'user' | 'ai' | string;
      message: string;
    }>
  >([]);
  // 记录当前正在接收的AI消息ID（关键：用于关联流式数据）
  const [currentAiId, setCurrentAiId] = useState<string | null>(null);
  const [connect, setConnect] = useState(false);
  const messRef = useRef(null);
  const context = useContext(Context);
  //初始化listMessage的历史数据
  // biome-ignore lint/correctness/useExhaustiveDependencies: context is intentionally used as dependency
  useEffect(() => {
    async function getDB() {
      const data = await dbCRUD.getAll();
      const list = [];
      for (const item of data) {
        list.push({
          id: item.time + 1,
          role: 'user',
          message: item.userData,
        });
        list.push({
          id: item.time,
          role: 'ai',
          message: item.aiData,
        });
      }
      setListMessage(list);
      scrollToBottom();
    }
    getDB();
  }, [context]);
  useEffect(() => {
    if (!pendingMessage) return;
    const trimmedPrompt = pendingMessage.prompt?.trim() || '';
    if (!trimmedPrompt && !pendingMessage.image) {
      return;
    }

    async function sendDatatoAI() {
      const userId = Date.now().toString();
      const aiId = (Date.now() + 1).toString();
      setCurrentAiId(aiId);
      const parts: string[] = [];
      if (trimmedPrompt) {
        parts.push(trimmedPrompt);
      }
      if (pendingMessage?.image?.url) {
        parts.push(`图片链接：${pendingMessage.image.url}`);
      }
      const userDisplay = parts.join('\n');
      setListMessage(prev => [
        ...prev,
        { id: userId, role: 'user', message: userDisplay },
        { id: aiId, role: 'ai', message: '' },
      ]);
      setHtml('');
      await get(
        {
          prompt: trimmedPrompt,
          useInternet: connect,
          role: 'user',
          image: pendingMessage?.image,
        },
        setHtml,
        context || null,
      );
    }
    sendDatatoAI();
  }, [pendingMessage, connect, context]);

  // 关键：监听html变化，同步更新对应AI消息的内容
  useEffect(() => {
    if (!currentAiId || !html) return;
    setListMessage(prev =>
      prev.map(item =>
        // 找到当前AI消息并更新内容
        item.id === currentAiId ? { ...item, message: html } : item,
      ),
    );
    scrollToBottom();
  }, [html, currentAiId]);

  // 2. 核心：滚动到底部方法（封装为可复用函数）
  const scrollToBottom = () => {
    console.log('ref', messRef.current);
    if (!messRef.current) return; // 判空：避免ref未挂载时报错
    const container = messRef.current as HTMLDivElement;
    // 你的核心逻辑（保留），补充异常处理
    try {
      // 平滑滚动（behavior: smooth 开启动画）
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth', // 核心：平滑动画（替代auto）
      });
    } catch (e) {
      console.warn('滚动失败：', e);
      // 降级方案：直接设置scrollTop（兼容部分特殊容器）
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  };
  return (
    <div className={styles.container}>
      <SideBar />
      <div className={styles.textContainer}>
        <div className={styles.message} ref={messRef}>
          {listMessage.map(item =>
            item.role === 'ai' ? (
              <AiText
                key={item.id}
                item={item}
                connect={connect}
                scrollToBottom={scrollToBottom}
              />
            ) : (
              <UserText key={item.id} item={item} />
            ),
          )}
        </div>
        <Message
          setUserText={setPendingMessage}
          setConnect={setConnect}
          connect={connect}
        />
      </div>
    </div>
  );
};

export default Index;
