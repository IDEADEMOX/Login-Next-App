import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { BcryptUtil } from "@/utils/bcrypt.util";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "用户名、邮箱和密码不能为空" },
      { status: 400 },
    );
  }

  // 对密码进行哈希处理
  const hashedPassword = await BcryptUtil.encrypt(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ message: "创建成功", data: user, status: 200 });
}
