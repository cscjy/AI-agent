import { uploadImage } from '@/api/lambda/upload';
import usetootip from '@/component/useTootip';
import {
  ArrowUpOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Input, message as antdMessage } from 'antd';
import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from '../../css/message.module.css';
import { Context } from './context/Context';
const { TextArea } = Input;
// 定义Message组件的Props类型
type MessageProps = {
  setUserText: (value: {
    prompt: string;
    image?: { url: string; filename: string };
  }) => void;
  setConnect: (value: boolean) => void;
  connect: boolean;
};

export default function Message(props: MessageProps) {
  const [value, setValue] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    file: File;
    preview: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const context = useContext(Context);
  const { tootip, setTootip, top } = usetootip();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage({
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearSelectedImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
  };

  useEffect(() => {
    return () => {
      if (selectedImage?.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  const handleSend = async () => {
    if (!value.trim() && !selectedImage) {
      return;
    }
    setSending(true);
    try {
      let uploadedInfo: { url: string; filename: string } | undefined;
      if (selectedImage) {
        const result = await uploadImage(selectedImage.file);
        if (!result.success || !result.url || !result.filename) {
          throw new Error(result.message || '图片上传失败');
        }
        uploadedInfo = { url: result.url, filename: result.filename };
      }
      setTootip(true);
      props.setUserText({
        prompt: value.trim(),
        image: uploadedInfo,
      });
      setValue('');
      clearSelectedImage();
      antdMessage.success('消息发送成功');
    } catch (error: unknown) {
      antdMessage.error((error as Error).message || '发送失败');
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.inputArea}>
          <div className={styles.inputTopRow}>
            <TextArea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="发送消息或输入内容"
              autoSize={{ minRows: 2, maxRows: 4 }}
              id={styles.textArea}
            />
          </div>
          <div className={styles.inputActions}>
            <div className={styles.actionLeft}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadOutlined />
                <span>图片上传</span>
              </button>
              <span className={styles.separator}>|</span>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => props.setConnect(!props.connect)}
              >
                <ThunderboltOutlined />
                <span>{props.connect ? '关闭联网' : '开启联网'}</span>
              </button>
            </div>
            <div className={styles.actionRight}>
              <Button
                type="primary"
                shape="circle"
                loading={sending}
                disabled={sending || (!value.trim() && !selectedImage)}
                icon={<ArrowUpOutlined style={{ fontSize: '18px' }} />}
                className={styles.click}
                onClick={handleSend}
              />
            </div>
          </div>
        </div>
        {selectedImage ? (
          <div className={styles.previewBanner}>
            <img
              src={selectedImage.preview}
              alt={selectedImage.name}
              className={styles.previewImage}
            />
            <div className={styles.previewText}>
              <span className={styles.previewLabel}>图片预览</span>
              <span className={styles.previewName}>{selectedImage.name}</span>
            </div>
            <Button
              type="text"
              icon={<CloseCircleOutlined />}
              onClick={clearSelectedImage}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
