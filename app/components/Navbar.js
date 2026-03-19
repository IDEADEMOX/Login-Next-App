"use client";
import Link from "next/link";
import { removeStorage, getStorage, setStorage } from "../utils/index";
import axios from "../utils/axios";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // 防止闪烁
  const router = useRouter();
  const pathname = usePathname();

  // 监听路径变化
  useEffect(() => {
    // 加载用户信息的函数
    const loadUser = async () => {
      try {
        if (typeof window === "undefined") return;

        const userStr = getStorage("user");
        if (!userStr) {
          // 只在需要保护的页面才跳转（避免登录页也跳）
          router.push("/auth/login");
          setUserInfo(null);
          return;
        }

        const userData = JSON.parse(userStr);
        setUserInfo(userData);

        // 可选：刷新最新 profile
        if (userData?.id) {
          const res = await axios.post(`/users/profile`, { id: userData.id });
          if (res?.data?.data) {
            setStorage("user", JSON.stringify(res.data.data));
            setUserInfo(res.data.data);
          }
        }
      } catch (error) {
        console.error("加载用户信息失败:", error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await axios.post(`/auth/logout`);
    } catch (e) {
      console.error(e);
    }
    removeStorage("user");
    setUserInfo(null);
    router.push("/auth/login");
  };

  if (loading) {
    return <nav className="...">加载中...</nav>; // 或骨架屏
  }

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b ...">
      <div className="max-w-7xl mx-auto px-4 ...">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold ...">
              管理系统
            </Link>
            {userInfo && (
              <div className="ml-14">
                <Link
                  href="/fileUpload"
                  className="px-3 py-2 text-sm font-medium ..."
                >
                  文件上传
                </Link>
                <Link
                  href="/userList"
                  className="px-3 py-2 text-sm font-medium ..."
                >
                  用户管理
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {userInfo ? (
              <>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  欢迎, {userInfo.username}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-red-600 ..."
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium text-blue-600 ..."
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
