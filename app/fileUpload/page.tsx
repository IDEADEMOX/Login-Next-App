"use client";
import React, { useState } from "react";
import FileUpload from "@/components/FileUpload";
import axios from "@/utils/axios";

const FileUploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 这里使用 axios 发送文件到后端
      // 请根据实际后端接口修改 URL
      const response = await axios.post("/upload/uploadFile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (![200, 201].includes(response.status)) {
        throw new Error("上传失败");
      }

      const data = response.data;
      setUploadedFile(data.filePath);
    } catch (err) {
      setError("上传失败，请重试");
      console.error("上传错误:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">文件上传</h1>

        <FileUpload onUpload={handleFileUpload} loading={loading} />

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-700">上传成功！</h3>
            <p className="mt-2 text-sm text-gray-600">
              文件路径: {uploadedFile}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadPage;
