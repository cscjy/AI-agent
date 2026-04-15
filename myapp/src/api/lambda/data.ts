import tootip from '@/component/useTootip';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import dbCRUD from './indexedDB';

type Message = {
  prompt: string;
  data: string;
};

let eventSource: EventSource | null = null;
let abortController: AbortController | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const clearSseResources = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  abortController?.abort();
  abortController = null;
};

export const get = async (
  message: Record<string, unknown>,
  setHtml: (value: string | ((prev: string) => string)) => void,
  context: {
    dataChange: boolean;
    setDataChange: (value: boolean) => void;
  } | null,
) => {
  // 清理上一次连接的资源
  clearSseResources();

  const params = new URLSearchParams({
    prompt: message.prompt || '',
    useInternet: String(message.useInternet),
  });
  if (message?.image?.url) {
    params.append('imageUrl', message.image.url);
  }

  abortController = new AbortController();
  eventSource = new EventSource(
    `${API_BASE_URL}/api/stream?${params.toString()}`,
  );

  console.log('开始连接');

  // 60秒超时：如果60秒内没有收到任何消息，提示用户连接超时
  timeoutId = setTimeout(() => {
    console.error('SSE 连接超时');
    setHtml('连接超时，请检查网络或稍后重试。');
    clearSseResources();
  }, 60000);

  let aiMessage = '';

  eventSource.onopen = () => {
    console.log('SSE 连接已建立');
  };

  eventSource.onmessage = async event => {
    // 收到消息时重置超时计时器
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'content':
          console.log('连接成功:', data.content);
          aiMessage += data.content;
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
          clearSseResources();
          const store = {
            userData:
              message.prompt +
              (message?.image?.url ? `\n图片链接：${message.image.url}` : ''),
            aiData: aiMessage,
            time: Date.now().toString(),
          };
          // 本地存储交流数据
          await dbCRUD.add(store);
          context?.setDataChange(!context.dataChange);
          await axios.post(`${API_BASE_URL}/api/data`, store, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        }
      }
    } catch (error) {
      console.error('解析消息失败:', error, '原始数据:', event.data);
    }
  };

  eventSource.onerror = error => {
    console.error('SSE 连接错误:', error);
    setHtml('网络连接失败，请检查网络后重试。');
    clearSseResources();
  };
};
