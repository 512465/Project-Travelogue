export class CreateAuthAdminDto {
  adminId: number; // 管理员ID，主键，自增
  adminName: string; // 管理员名称，非空且唯一
  adminPassword: string; // 管理员密码，非空
}
