import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 });
    }

    // 安全校验
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "文件不能超过5MB" }, { status: 400 });
    }

    // 转 Buffer
    // 清理不安全字符，防止文件名过长或含特殊符号
    const nameWithoutExt = file.name.replace(path.extname(file.name), "");
    const safeName = nameWithoutExt
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, "_") // 只保留中英文、数字、下划线、点、横线
      .trim();
    const extension = path.extname(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${safeName}-${Date.now()}${extension}`;

    // 上传目录（public 目录可直接访问）
    const uploadDir = path.join("D:/fep/upload");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // 写入文件
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 返回可访问地址
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
