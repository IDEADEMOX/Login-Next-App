import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/utils/jwt.util";

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken");

  if (!accessToken) {
    return NextResponse.json(
      { error: "accessToken is required" },
      { status: 400 },
    );
  }

  // 验证 accessToken
  const payload = await decrypt(accessToken.value);

  if (!payload) {
    return NextResponse.json(
      { error: "accessToken is invalid" },
      { status: 400 },
    );
  }

  // 更新 refreshToken 到 null
  await prisma.user.update({
    where: {
      id: Number(payload?.userId),
    },
    data: {
      refreshToken: "",
      refreshTokenExpires: new Date(),
    },
  });

  // 删除 accessToken cookie
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");

  return NextResponse.json({ message: "退出成功", code: 200 });
}
