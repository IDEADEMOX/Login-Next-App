import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:3001", // Base URL for API requests
  timeout: 10000, // Request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response.data;
  },
  (error) => {
    // Handle error responses
    const { response } = error;
    console.log(response);

    // Handle 401 Unauthorized - token expired or invalid
    if (response?.status === 401) {
      // Use window.location instead of useRouter since this is a utility file
      window.location.href = "/auth/login";
    }

    // Handle 400 Bad Request - validation errors or other client errors
    if (response?.status === 400) {
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

export default api;
