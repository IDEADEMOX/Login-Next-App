import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { BcryptUtil } from "@/utils/bcrypt.util";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email 或 username 已经存在", code: 400 },
        { status: 400 },
      );
    }

    // 密码加密
    const encryptedPassword = await BcryptUtil.encrypt(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: encryptedPassword,
      },
      // 不返回密码给前端
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json(
      { message: "注册成功", data: user, code: 200 },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "服务器错误，注册失败", code: 500 },
      { status: 500 },
    );
  }
}
