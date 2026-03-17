"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import instance from "../utils/axios";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editedUser, setEditedUser] = useState({
    id: 0,
    username: "",
    email: "",
  });
  const router = useRouter();

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await instance.get("/users/list");
      const data = await response.data;
      // 由于axios拦截器已经统一返回data，直接使用response.data
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  // 添加用户
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await instance.post("/users/create", newUser);
      const data = await response.data;
      if (![200, 201].includes(response.status)) {
        throw new Error(data.error || "用户添加失败");
      }
      setSuccess("用户添加成功");
      setNewUser({ username: "", email: "", password: "" });
      setIsAdding(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // 编辑用户
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      console.log("发送编辑请求:", editedUser);
      const response = await instance.post(`/users/update`, editedUser);
      console.log("编辑响应:", response);

      setSuccess("用户编辑成功");
      setIsEditing(false);
      setCurrentUser(null);
      setEditedUser({ id: 0, username: "", email: "" });
      fetchUsers();
    } catch (err) {
      console.error("编辑错误:", err);
      setError(err.message);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    if (!confirm("确定要删除这个用户吗？")) return;

    try {
      const response = await instance.post(`/users/delete`, { id: userId });

      setSuccess("用户删除成功");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // 开始编辑
  const startEditing = (user) => {
    setCurrentUser(user);
    setEditedUser({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-zinc-900 dark:text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            用户列表
          </h1>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            添加用户
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* 添加用户表单 */}
        {isAdding && (
          <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg mb-6 p-6">
            <h2 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white mb-4">
              添加新用户
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-zinc-300 hover:bg-zinc-400 text-zinc-800 px-4 py-2 rounded-md dark:bg-zinc-700 dark:text-zinc-200"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 编辑用户表单 */}
        {isEditing && currentUser && (
          <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg mb-6 p-6">
            <h2 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white mb-4">
              编辑用户: {currentUser.name}
            </h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <input type="hidden" value={editedUser.id} />
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={editedUser.username}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentUser(null);
                    setEditedUser({ id: 0, username: "", email: "" });
                  }}
                  className="bg-zinc-300 hover:bg-zinc-400 text-zinc-800 px-4 py-2 rounded-md dark:bg-zinc-700 dark:text-zinc-200"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white">
              所有注册用户
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              这里显示了所有注册的用户信息
            </p>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    用户名
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    邮箱
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                {users?.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => startEditing(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="mt-6 text-center text-zinc-500 dark:text-zinc-400">
            暂无用户
          </div>
        )}
      </div>
    </div>
  );
}
