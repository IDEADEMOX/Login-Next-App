// 生成随机密钥
import crypto from "crypto";
const key = crypto.randomBytes(64).toString("hex");
console.log("你的密钥：", key);
