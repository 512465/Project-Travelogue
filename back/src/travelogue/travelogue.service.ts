import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTravelogueDto } from './dto/create-travelogue.dto';
import { UpdateTravelogueDto } from './dto/update-travelogue.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelogueEntity } from './entities/travelogue.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class TravelogueService {
  constructor(
    @InjectRepository(TravelogueEntity)
    private readonly travelogueRepository: Repository<TravelogueEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async create(
    createTravelogueDto: CreateTravelogueDto,
    userId: number,
    userName: string,
  ) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const travelogue = this.travelogueRepository.create({
      ...createTravelogueDto,
      travelogueAuthor: userName,
      userAvatar: user.userAvatar,
      userId, // 关联用户ID
    });
    const saveTravelogue = await this.travelogueRepository.save(travelogue);
    return saveTravelogue;
  }

  async findAll(
    id: number,
    query: {
      page?: number;
      limit?: number;
      travelogueStatus?: number;
    },
  ) {
    const user = await this.userRepository.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const { page = 1, limit = 10, travelogueStatus } = query;
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.travelogueRepository.createQueryBuilder('travelogue');

    queryBuilder.where('travelogue.userId = :userId', { userId: id });

    // 根据状态查询
    if (travelogueStatus) {
      queryBuilder.andWhere('travelogue.travelogueStatus = :travelogueStatus', {
        travelogueStatus,
      });
    }

    // 执行查询并获取结果
    const [items, total] = await queryBuilder
      .orderBy('travelogue.createTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findAllList(query: {
    page?: number;
    limit?: number;
    travelogueStatus?: number;
    keyword?: string;
  }) {
    const { page = 1, limit = 10, travelogueStatus, keyword } = query;
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.travelogueRepository.createQueryBuilder('travelogue');

    // 根据状态查询
    if (travelogueStatus) {
      queryBuilder.andWhere('travelogue.travelogueStatus = :travelogueStatus', {
        travelogueStatus,
      });
    }

    // 根据关键字查询标题或作者
    if (keyword) {
      queryBuilder.andWhere(
        '(travelogue.travelogueTitle LIKE :keyword OR travelogue.travelogueAuthor LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 执行查询并获取结果
    const [items, total] = await queryBuilder
      .orderBy('travelogue.createTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    return travelogue;
  }

  async update(
    id: number,
    updateTravelogueDto: UpdateTravelogueDto,
    userId: number,
  ) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }

    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否有权限更新
    if (travelogue.userId !== userId) {
      throw new ForbiddenException('你没有权限更新此游记');
    }

    // 更新游记信息
    const updatedTravelogue = await this.travelogueRepository.save({
      ...travelogue,
      ...updateTravelogueDto,
    });

    return updatedTravelogue;
  }

  async remove(id: number, userId: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    // 检查用户是否有权限删除
    if (travelogue.userId !== userId) {
      throw new ForbiddenException('你没有权限删除此游记');
    }
    const result = await this.travelogueRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('删除失败');
    }
    return result;
  }
}
