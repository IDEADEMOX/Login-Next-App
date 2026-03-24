import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/utils/jwt.util";
import { prisma } from "../../../../lib/prisma";
import { redis } from "../../../../lib/redis";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken");
  if (!refreshToken) {
    // 删除旧的 refreshToken 从 Redis
    await redis.del(refreshToken.value);
    return NextResponse.json(
      { error: "refreshToken is required", code: 400 },
      { status: 400 },
    );
  }

  // 验证 refreshToken
  const payload = await decrypt(refreshToken.value);

  if (!payload) {
    // 删除旧的 refreshToken 从 Redis
    await redis.del(refreshToken.value);
    return NextResponse.json(
      { error: "refreshToken is invalid", code: 400 },
      { status: 400 },
    );
  }

  const redisRefreshToken = await redis.get(refreshToken.value);

  if (redisRefreshToken !== refreshToken.value) {
    // 删除旧的 refreshToken 从 Redis
    await redis.del(refreshToken.value);
    return NextResponse.json(
      { error: "refreshToken is invalid", code: 400 },
      { status: 400 },
    );
  }

  if (!redisRefreshToken) {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(payload?.userId),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在", code: 404 },
        { status: 404 },
      );
    }
  }

  // 生成新的 accessToken
  const newAccessToken = await encrypt({ userId: payload?.userId }, "15m");

  // 生成新的 refreshToken
  const newRefreshToken = await encrypt({ userId: payload?.userId }, "7d");

  // 更新 refreshToken 到 null
  await prisma.user.update({
    where: {
      id: Number(payload?.userId),
    },
    data: {
      refreshToken: newRefreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 删除旧的 refreshToken 从 Redis
  await redis.del(refreshToken.value);

  // 存储新的 refreshToken 到 Redis
  await redis.set(newRefreshToken, newRefreshToken);

  const cookieStore = await cookies();
  // 更新 accessToken 到 cookie
  cookieStore.set("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  // 更新 refreshToken 到 cookie
  cookieStore.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return NextResponse.json({ message: "刷新成功", code: 200 }, { status: 200 });
}
