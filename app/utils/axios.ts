import axios from "axios";

// Create axios instance
const instance = axios.create({
  baseURL: "http://localhost:3001", // Base URL for API requests
  timeout: 10000, // Request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error) => {
    // Handle error responses
    const { response } = error;

    localStorage.removeItem("user");

    // Handle 401 Unauthorized - token expired or invalid
    if (response?.status === 401) {
      // Use window.location instead of useRouter since this is a utility file
      fetch("http://localhost:3001/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (![200, 201].includes(res.code)) {
            // 刷新失败，跳转到登录页
            window.location.href = "/auth/login";
          } else {
            // 刷新成功，更新 localStorage 中的 token
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        });
    }

    // Handle 400 Bad Request - validation errors or other client errors
    if (response?.status === 400) {
      // 刷新失败，跳转到登录页
      window.location.href = "/auth/login";
      // Return the error message from the server
      return Promise.reject(
        response.data?.message || "请求失败，请检查输入信息",
      );
    }

    // Handle 500 Internal Server Error
    if (response?.status === 500) {
      return Promise.reject("服务器内部错误，请稍后重试");
    }

    // Handle network errors
    if (!response) {
      return Promise.reject("网络错误，请检查网络连接");
    }

    // Handle other errors
    return Promise.reject(response.data?.message || "请求失败，请稍后重试");
  },
);

export default instance;
