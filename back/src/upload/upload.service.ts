import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadDir: string;

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');

    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<Upload> {
    try {
      // 使用 Sharp 进行图片压缩
      const compressedImage = sharp(file.buffer);

      // 设置压缩参数
      const compressedBuffer = await compressedImage
        .metadata()
        .then((metadata) => {
          // 限制最大宽度为 1920px（保持比例）
          const maxWidth = 1920;
          const shouldResize = metadata.width > maxWidth;

          return compressedImage
            .resize(shouldResize ? maxWidth : null) // 仅当需要时才缩放
            .jpeg({
              quality: 40, // 降低JPEG质量
              mozjpeg: true, // 启用更优压缩算法
            })
            .png({
              quality: 60, // 降低PNG质量
              compressionLevel: 5, // 使用较低的压缩级别
            })
            .webp({ quality: 45 }) // 降低WebP质量
            .toBuffer();
        });

      // 生成文件 hash（基于压缩后的内容）
      const hash = crypto
        .createHash('sha256')
        .update(compressedBuffer)
        .digest('hex');

      // 统一转换为 WebP 格式（可选）
      const ext = '.webp'; // 或保留原格式 path.extname(file.originalname)
      const key = `${hash}${ext}`;
      const filePath = path.join(this.uploadDir, key);

      // 保存压缩后的文件
      await fs.promises.writeFile(filePath, compressedBuffer);

      // 创建上传记录
      const upload = new Upload();
      upload.hash = hash;
      upload.key = key;
      upload.url = `/uploads/${key}`;

      return await this.uploadRepository.save(upload);
    } catch (error) {
      // 判断是否为 Sharp 图像处理错误（通过 error.message 判断）
      if (error instanceof Error && /Invalid input/.test(error.message)) {
        throw new Error('无效的图片文件');
      }
      try {
        // 生成文件hash
        const hash = crypto
          .createHash('sha256')
          .update(file.buffer)
          .digest('hex');

        // 生成文件名（使用原始文件扩展名）
        const ext = path.extname(file.originalname);
        const key = `${hash}${ext}`;
        const filePath = path.join(this.uploadDir, key);

        // 保存文件
        await fs.promises.writeFile(filePath, file.buffer);

        // 创建上传记录
        const upload = new Upload();
        upload.hash = hash;
        upload.key = key;
        upload.url = `/uploads/${key}`;

        // 保存到数据库
        return await this.uploadRepository.save(upload);
      } catch (error) {
        console.error('Upload error:', error);
        throw new Error('File upload failed: ' + error.message);
      }
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<Upload[]> {
    try {
      return await Promise.all(
        files.map(async (file) => {
          // 复用单个文件上传逻辑
          const hash = crypto
            .createHash('sha256')
            .update(file.buffer)
            .digest('hex');

          const ext = path.extname(file.originalname);
          const key = `${hash}${ext}`;
          const filePath = path.join(this.uploadDir, key);

          await fs.promises.writeFile(filePath, file.buffer);

          const upload = new Upload();
          upload.hash = hash;
          upload.key = key;
          upload.url = `/uploads/${key}`;

          return this.uploadRepository.save(upload);
        }),
      );
    } catch (error) {
      console.error('Batch upload error:', error);
      throw new Error(`批量上传失败: ${error.message}`);
    }
  }

  async getFiles(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.uploadRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
