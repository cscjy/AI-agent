import React from 'react';
import styles from '../../css/userText.module.css';

type MessageItem = {
  message: string;
};

type Props = {
  item: MessageItem;
};

const UserText = ({ item }: Props) => {
  const content = item.message?.split('\n') ?? [];

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        {content.map((line, index) =>
          line.startsWith('图片链接：') ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: line content may not be unique, index is needed for stability
            <img
              key={`${index}-${line}`}
              src={line.replace('图片链接：', '')}
              className={styles.userImage}
              alt="用户上传图片"
            />
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: line content may not be unique, index is needed for stability
            <span key={`${line}-${index}`}>{line}</span>
          ),
        )}
      </div>
    </div>
  );
};

export default UserText;
