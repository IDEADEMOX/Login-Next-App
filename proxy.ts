import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/utils/jwt.util";
import { prisma } from "./lib/prisma";

// 定义不需要鉴权的路径
const EXCLUDED_PATHS = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/register",
];

/**
 * 创建登录重定向响应
 * @param request 当前请求
 * @param path 需要重定向回的路径
 * @returns NextResponse
 */
const createLoginRedirect = (request: NextRequest): NextResponse => {
  const loginUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(loginUrl);
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 检查是否是排除的路径
  const isExcluded = EXCLUDED_PATHS.some((excludedPath) =>
    path.startsWith(excludedPath),
  );

  if (isExcluded || !path.startsWith("/api")) {
    return NextResponse.next();
  }

  // 从cookie中获取accessToken
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // 如果没有token，重定向到登录页面
    return createLoginRedirect(request);
  }

  try {
    // 验证token
    const payload = await decrypt(accessToken);

    if (!payload) {
      // token无效，重定向到登录页面
      return NextResponse.json(
        { error: "token 无效", code: 401 },
        { status: 401 },
      );
    } else {
      // 检查用户是否存在
      const userId = payload.userId;
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        // 用户不存在，重定向到登录页面
        return createLoginRedirect(request);
      }
    }

    // token有效，继续处理请求
    return NextResponse.next();
  } catch (error) {
    // 验证过程中出错，重定向到登录页面
    return createLoginRedirect(request);
  }
}

// 配置中间件的匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
