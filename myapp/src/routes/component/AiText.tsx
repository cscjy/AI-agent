import { Button } from 'antd';
// MarkdownViewer.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // 核心Markdown解析库
import remarkGfm from 'remark-gfm'; // 支持表格、删除线等GFM语法
import styles from '../../css/message.module.css';

type AiTextProps = {
  item: { message: string };
  connect: boolean;
  scrollToBottom: () => void;
};

export default function AiText(props: AiTextProps) {
  useEffect(() => {
    props.scrollToBottom();
  }, [props]);
  return (
    <div style={{ paddingLeft: '50px', paddingRight: '50px' }}>
      {props.item.message ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // 启用GFM扩展语法
          components={{
            img: ({ node, ...imgProps }) => (
              <img
                {...imgProps}
                className={styles.generatedImage}
                alt="生成图片"
              />
            ),
          }}
        >
          {props.item.message}
        </ReactMarkdown>
      ) : (
        <Button type="primary" loading>
          {props.connect ? '正在使用网络搜索。。。' : '正在搜索。。。'}
        </Button>
      )}
    </div>
  );
}
