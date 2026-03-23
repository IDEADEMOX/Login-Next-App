import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { BcryptUtil } from "@/utils/bcrypt.util";
import { encrypt } from "@/utils/jwt.util";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email 和密码不能为空", code: 400 },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "用户不存在", code: 404 },
      { status: 404 },
    );
  }

  const isPasswordValid = await BcryptUtil.verify(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json({ error: "密码错误", code: 401 }, { status: 401 });
  }

  // 生成 accessToken
  const accessToken = await encrypt({ userId: user.id }, "15m");

  // 生成 refreshToken
  const refreshToken = await encrypt({ userId: user.id }, "7d");

  // 设置 refreshToken cookie
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // 存储 accessToken 和 refreshToken 到数据库
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(
    {
      message: "登录成功",
      data: { ...user, accessToken, refreshToken },
      code: 200,
    },
    { status: 200 },
  );
}
