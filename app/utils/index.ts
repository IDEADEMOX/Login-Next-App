import CryptoJS from "crypto-js";

export const getStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const setStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

export const removeStorage = (key: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};

// 防重放相关常量
export const SIGNATURE_KEY = "signature";

// 生成防重放签名
export const generateSignature = (method: string, url: string, data?: any) => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  // 构建签名内容，包含请求方法、URL、时间戳、随机数和请求数据
  const signatureContent = buildSignatureContent(
    method,
    url,
    timestamp,
    nonce,
    data,
  );
  const signature = CryptoJS.HmacSHA256(
    signatureContent,
    SIGNATURE_KEY,
  ).toString();

  return {
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
    "X-Method": method,
    "X-Url": url,
  };
};

// 生成更安全的随机数
export const generateNonce = (length: number = 16): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 构建签名内容
export const buildSignatureContent = (
  method: string,
  url: string,
  timestamp: number,
  nonce: string,
  data?: any,
): string => {
  const parts = [method.toUpperCase(), url, timestamp.toString(), nonce];

  // 如果有请求数据，也加入签名
  if (data) {
    const dataStr = typeof data === "string" ? data : JSON.stringify(data);
    parts.push(dataStr);
  }

  return parts.join("|");
};
