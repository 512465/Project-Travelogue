import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id' })
  userId: number; // 用户ID

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_time',
    nullable: false,
  })
  createdTime: Date; // 创建时间，非空

  @Column({
    type: 'varchar',
    length: 30,
    name: 'user_name',
  })
  userName: string; // 管理员名称，非空且唯一

  @Column({
    type: 'varchar',
    length: 30,
    name: 'user_password',
  })
  userPassword: string; // 管理员密码，非空

  @Column({ default: 'uploads/1.png' })
  userAvatar: string; // 用户头像，非空
}
