import axios from "axios";
import { generateSignature } from ".";

// ==================== 创建 axios 实例 ====================
const instance = axios.create({
  // baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== Token 刷新队列管理 ====================
let isRefreshing = false;
let failedQueue: Array<{
  config: any;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ config, resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (config) {
      config.headers = config.headers || {};
      resolve(instance(config)); // 重新发起请求
    } else {
      reject(new Error("Token refresh failed"));
    }
  });
  failedQueue = [];
};

// ==================== Request Interceptor ====================
instance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        // 防重放，生成签名
        const signatureHeaders = generateSignature(
          config.method || "GET",
          config.url,
          config.data || {},
        );

        // 将签名添加到请求头
        Object.assign(config.headers, signatureHeaders);
      } catch (e) {
        console.error("解析失败", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ==================== Response Interceptor ====================
instance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { response, config } = error;
    if (!config || !response) return Promise.reject(error);

    // ====================== 401 处理 ======================
    if (response.status === 401 && !config._retry) {
      config._retry = true;

      // 所有 401 都进队列
      return new Promise((resolve, reject) => {
        failedQueue.push({ config, resolve, reject });

        // 如果当前没有正在刷新，则开始刷新（只执行一次）
        if (!isRefreshing) {
          isRefreshing = true;
          // 防重放，生成签名
          const signatureHeaders = generateSignature(
            "post",
            "/auth/refresh",
            {},
          );
          fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...signatureHeaders,
            } as any,
          })
            .then((refreshResponse) => refreshResponse.json())
            .then((res) => {
              if (![200, 201].includes(res.code)) {
                throw new Error("刷新 token 失败");
              }

              const newUser = res.data;
              localStorage.setItem("user", JSON.stringify(newUser));

              // 处理队列中所有请求（包括第一个 401 接口）
              processQueue(null);
            })
            .catch((err) => {
              processQueue(err);
              localStorage.removeItem("user");
              window.location.href = "/auth/login";
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
      });
    }

    // ====================== 其他错误处理 ======================
    if (response.status === 400) {
      return Promise.reject(response.data?.message || "请求参数错误");
    }

    if (response.status === 403) {
      window.location.href = "/auth/login";
      return Promise.reject(response.data?.message || "权限不足");
    }

    if (response.status === 500) {
      return Promise.reject("服务器内部错误，请稍后重试");
    }

    if (!response) {
      return Promise.reject("网络错误，请检查网络连接");
    }

    return Promise.reject(response.data?.message || "请求失败，请稍后重试");
  },
);

export default instance;
