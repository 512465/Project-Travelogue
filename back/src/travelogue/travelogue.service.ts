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
import { AdminEntity } from 'src/admin/entities/admin.entity';

@Injectable()
export class TravelogueService {
  constructor(
    @InjectRepository(TravelogueEntity)
    private readonly travelogueRepository: Repository<TravelogueEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
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
    if (query.page && query.limit) {
      const { page = 1, limit = 10, travelogueStatus, keyword } = query;
      const skip = (page - 1) * limit;
      const queryBuilder =
        this.travelogueRepository.createQueryBuilder('travelogue');

      // 根据状态查询
      if (travelogueStatus) {
        queryBuilder.andWhere(
          'travelogue.travelogueStatus = :travelogueStatus',
          {
            travelogueStatus,
          },
        );
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
    } else {
      const { travelogueStatus, keyword } = query;
      const queryBuilder =
        this.travelogueRepository.createQueryBuilder('travelogue');

      // 根据状态查询
      if (travelogueStatus) {
        queryBuilder.andWhere(
          'travelogue.travelogueStatus = :travelogueStatus',
          {
            travelogueStatus,
          },
        );
      }

      // 根据关键字查询标题或作者
      if (keyword) {
        queryBuilder.andWhere(
          '(travelogue.travelogueTitle LIKE :keyword OR travelogue.travelogueAuthor LIKE :keyword)',
          { keyword: `%${keyword}%` },
        );
      }

      const [items, total] = await queryBuilder
        .orderBy('travelogue.createTime', 'DESC')
        .getManyAndCount();

      return { items, total };
    }
  }

  async like(id: number, userId: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    // console.log(user);
    user.userLikes = user.userLikes || [];
    // 检查用户是否已经点赞过
    if (user.userLikes.includes(id)) {
      const res = user.userLikes.filter((item) => item !== id); // 过滤掉已经点赞的游记ID
      user.userLikes = res; // 更新用户的点赞列表
      travelogue.travelogueLikes -= 1; // 减少点赞数
      await this.userRepository.save(user); // 保存更新后的用户
      await this.travelogueRepository.save(travelogue); // 保存更新后的游记
      return travelogue;
    } else {
      user.userLikes.push(id);
      await this.userRepository.save(user); // 保存更新后的用户
      console.log(user);
      travelogue.travelogueLikes += 1; // 增加点赞数
      await this.travelogueRepository.save(travelogue); // 保存更新后的游记
      return travelogue;
    }
  }

  async userCollects(id: number, userId: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.userCollects = user.userCollects || [];
    // 检查用户是否已经收藏过
    if (user.userCollects.includes(id)) {
      const res = user.userCollects.filter((item) => item !== id); // 过滤掉已经收藏的游记ID
      user.userCollects = res; // 更新用户的收藏列表
      travelogue.travelogueCollects -= 1; // 减少收藏数
      await this.userRepository.save(user); // 保存更新后的用户
      await this.travelogueRepository.save(travelogue); // 保存更新后的游记
      return travelogue;
    } else {
      user.userCollects.push(id);
      await this.userRepository.save(user); // 保存更新后的用户
      travelogue.travelogueCollects += 1; // 增加收藏数
      await this.travelogueRepository.save(travelogue); // 保存更新后的游记
      return travelogue;
    }
  }

  async travelogueViews(id: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    travelogue.travelogueViews += 1; // 增加浏览数
    await this.travelogueRepository.save(travelogue); // 保存更新后的游记
    return travelogue;
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

  async userLikes(userId: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const userLikes = user.userLikes || []; // 获取用户的点赞列表
    const items = [];
    for (const travelogueId of userLikes) {
      const travelogue = await this.travelogueRepository.findOne({
        where: { travelogueId },
      });
      if (travelogue) {
        items.push(travelogue); // 将游记对象添加到结果数组中
      }
    }
    return items;
  }

  async userCollectsList(userId: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const userCollects = user.userCollects || []; // 获取用户的收藏列表
    const items = [];
    for (const travelogueId of userCollects) {
      const travelogue = await this.travelogueRepository.findOne({
        where: { travelogueId },
      });
      if (travelogue) {
        items.push(travelogue); // 将游记对象添加到结果数组中
      }
    }
    return items;
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

  async updateAdmin(
    id: number,
    updateTravelogueDto: UpdateTravelogueDto,
    adminId: number,
  ) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }

    const admin = await this.adminRepository.findOne({
      where: { adminId: adminId },
    });
    if (!admin) {
      throw new NotFoundException('用户不存在');
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

  async removeAdmin(id: number, adminId: number) {
    const travelogue = await this.travelogueRepository.findOne({
      where: { travelogueId: id },
    });
    if (!travelogue) {
      throw new NotFoundException('游记不存在');
    }
    const admin = await this.adminRepository.findOne({
      where: { adminId: adminId },
    });

    // 检查用户是否有权限删除
    if (admin.adminAuth !== 1) {
      throw new ForbiddenException('你没有权限删除此游记');
    }

    if (!admin) {
      throw new NotFoundException('用户不存在');
    }
    const result = await this.travelogueRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('删除失败');
    }
    return result;
  }
}
