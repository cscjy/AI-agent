/**
 * API 基础配置
 * 开发环境默认使用 localhost:3000
 * 生产环境通过构建时注入的 API_BASE_URL 读取
 */
export const API_BASE_URL =
  process.env.API_BASE_URL || 'http://localhost:3000';
