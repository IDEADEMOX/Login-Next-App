import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const { id, ...options } = await req.json();

  console.log(id, options);

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // 检查用户名或邮箱是否已存在
  if (options.username || options.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(options.username ? [{ username: options.username }] : []),
          ...(options.email ? [{ email: options.email }] : []),
        ],
        NOT: {
          id: Number(id),
        },
      },
    });

    if (existingUser) {
      if (existingUser.username === options.username) {
        return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
      }
      if (existingUser.email === options.email) {
        return NextResponse.json({ error: "邮箱已存在" }, { status: 400 });
      }
    }
  }

  const user = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: options,
  });

  return NextResponse.json({ message: "更新成功", data: user, code: 200 });
}
