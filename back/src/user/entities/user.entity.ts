import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { TravelogueEntity } from 'src/travelogue/entities/travelogue.entity';

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
  userName: string; // 用户名称，非空且唯一

  @Column({
    type: 'varchar',
    length: 30,
    name: 'user_password',
  })
  userPassword: string; // 用户密码，非空

  @Column({ default: '' })
  userAvatar: string; // 用户头像，非空

  // 用户与游记的关系，一个用户可以有多个游记
  @OneToMany(() => TravelogueEntity, (travelogue) => travelogue.user)
  travelogues: TravelogueEntity[];
}
