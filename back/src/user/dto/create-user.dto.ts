import { IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(4, 20, { message: '用户名长度在4-20个字符之间' })
  userName: string;

  @IsString()
  @Length(6, 30, { message: '密码长度在6-30个字符之间' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '密码必须包含大小写字母和数字',
  })
  userPassword: string;

  @IsString()
  @Length(6, 30, { message: '密码长度在6-30个字符之间' })
  userPasswordConfirm: string;
}
