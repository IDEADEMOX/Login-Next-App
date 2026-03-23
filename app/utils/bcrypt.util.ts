import * as bcrypt from "bcrypt";

export class BcryptUtil {
  /**
   * 密码加密
   * @param password 明文密码
   * @param saltOrRounds 加密强度
   * @returns 加密后的密码
   */
  static async encrypt(
    password: string,
    saltOrRounds: number = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, saltOrRounds);
  }

  /**
   * 密码验证
   * @param password 明文密码
   * @param hash 加密后的密码
   * @returns 是否验证通过
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
