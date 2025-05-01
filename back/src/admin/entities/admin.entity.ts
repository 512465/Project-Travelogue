import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'admin_id' })
  adminId: number; // 管理员ID，主键，自增

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_time',
    nullable: false,
  })
  createdTime: Date; // 创建时间，非空

  @Column({
    type: 'varchar',
    length: 30,
    name: 'admin_name',
  })
  adminName: string; // 管理员名称，非空且唯一

  @Column({
    type: 'varchar',
    length: 30,
    name: 'admin_password',
  })
  adminPassword: string; // 管理员密码，非空

  @Column({
    type: 'int',
    name: 'admin_auth',
    nullable: false,
    default: 0, // 默认为0（审核人员）, 1（管理员）
  })
  adminAuth: number;
}
