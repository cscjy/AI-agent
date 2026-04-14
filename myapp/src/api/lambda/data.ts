import tootip from '@/component/useTootip';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import dbCRUD from './indexedDB';
type Message = {
  prompt: string;
  data: string;
};
let eventSource: EventSource | null = null;
export const get = async (
  message: Record<string, unknown>,
  setHtml: (value: string | ((prev: string) => string)) => void,
  context: {
    dataChange: boolean;
    setDataChange: (value: boolean) => void;
  } | null,
) => {
  // 创建SSE连接
  if (eventSource) {
    eventSource.close(); // 避免重复连接
    eventSource = null;
  }
  const params = new URLSearchParams({
    prompt: message.prompt || '',
    useInternet: String(message.useInternet),
  });
  if (message?.image?.url) {
    params.append('imageUrl', message.image.url);
  }
  eventSource = new EventSource(
    `${API_BASE_URL}/api/stream?${params.toString()}`,
  );
  console.log('开始连接');
  // 监听消息事件（核心）
  let aiMessage = '';
  eventSource.onmessage = async event => {
    try {
      // 解析后端发送的JSON数据
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'content':
          console.log('连接成功:', data.content);
          aiMessage += data.content;
          // 找到对应id的AI消息，追加内容
          setHtml((prve: string) => prve + data.content);
          break;
        case 'status':
          aiMessage += `\n${data.content}\n`;
          setHtml((prev: string) => `${prev}\n${data.content}`);
          break;
        case 'error':
          setHtml(
            (prev: string) => `${prev}\n${data.content || '图片模型处理失败'}`,
          );
          aiMessage += data.content || '';
          break;
        case 'complete': {
          setHtml('');
          eventSource?.close();
          eventSource = null;
          const store = {
            userData:
              message.prompt +
              (message?.image?.url ? `\n图片链接：${message.image.url}` : ''),
            aiData: aiMessage,
            time: Date.now().toString(),
          };
          //本地存储交流数据
          await dbCRUD.add(store);
          context?.setDataChange(!context.dataChange);
          await axios.post(`${API_BASE_URL}/api/data`, store, {
            withCredentials: true, // 需与后端credentials: true对应
            headers: { 'Content-Type': 'application/json' },
          });

          break;
        }
      }
    } catch (error) {
      console.error('解析消息失败:', error, '原始数据:', event.data);
    }
  };
};
