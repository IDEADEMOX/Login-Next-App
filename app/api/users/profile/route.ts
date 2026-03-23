import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "用户不存在", code: 404 },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "查询成功", data: user, code: 200 });
}
