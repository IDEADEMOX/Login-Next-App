import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const users = await prisma.user.findMany();
  return NextResponse.json({ message: "查询成功", data: users, status: 200 });
}
