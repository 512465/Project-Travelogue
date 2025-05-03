import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity('travelogue')
export class TravelogueEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'travelogue_id' })
  travelogueId: number; // 游记ID

  // 用户ID
  @Column({
    type: 'int',
    name: 'travelogue_user_id',
  })
  userId: number;

  // 游记标题
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'travelogue_title',
  })
  travelogueTitle: string;

  // 游记内容
  @Column({
    type: 'text',
    nullable: false,
    name: 'travelogue_content',
  })
  travelogueContent: string;

  // 创建日期
  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
    nullable: false,
  })
  createTime: Date;

  // 更新日期
  @UpdateDateColumn({
    type: 'datetime',
    name: 'update_time',
    nullable: false,
  })
  updateTime: Date;

  // 游记状态
  @Column({
    type: 'int',
    default: 0, // 0: 待审核，1: 通过，-1: 未通过
    name: 'travelogue_status',
  })
  travelogueStatus: number;

  // 游记封面
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'travelogue_cover',
  })
  travelogueCover: string;

  // 游记作者
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'travelogue_author',
    default: '',
  })
  travelogueAuthor: string;

  // 关联用户实体，一个用户可以有多篇游记
  @ManyToOne(() => UserEntity, (user) => user.travelogues, { nullable: false })
  @JoinColumn({ name: 'travelogue_user_id' }) // 外键列名
  user: UserEntity;
}
