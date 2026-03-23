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
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({ message: "删除成功", status: 200 });
}
