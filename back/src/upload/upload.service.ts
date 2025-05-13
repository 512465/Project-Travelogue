import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import { Upload } from './entities/upload.entity';

// 配置常量
const CONFIG = {
  UPLOAD_DIR: path.join(process.cwd(), 'uploads'),
  MAX_WIDTH: 1920,
  COMPRESS: {
    webp: { quality: 5, alphaQuality: 5, effort: 0 },
    jpeg: { quality: 20, mozjpeg: true },
  },
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {
    this.initializeUploadDir();
    sharp.cache({ files: 50 }); // 配置Sharp缓存
  }

  private async initializeUploadDir() {
    try {
      await fs.access(CONFIG.UPLOAD_DIR);
    } catch {
      await fs.mkdir(CONFIG.UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<Upload> {
    try {
      this.validateFile(file);
      return await this.processImage(file);
    } catch (error) {
      return this.handleError(error, file);
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<Upload[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  private validateFile(file: Express.Multer.File) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      throw new Error(
        `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }
  }

  private async processImage(file: Express.Multer.File): Promise<Upload> {
    try {
      const [compressedBuffer, hash] = await Promise.all([
        this.compressImage(file.buffer),
        this.generateHash(file.buffer),
      ]);

      return this.saveFile({
        buffer: compressedBuffer,
        originalName: file.originalname,
        ext: '.webp',
      });
    } catch (error) {
      if (error instanceof Error && /Invalid input/i.test(error.message)) {
        this.logger.warn(`非图片文件处理: ${file.originalname}`);
        return this.saveOriginalFile(file);
      }
      throw error;
    }
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: CONFIG.MAX_WIDTH,
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      })
      .rotate()
      .toFormat('webp', CONFIG.COMPRESS.webp) // 新增此行
      .toBuffer();
  }

  private async generateHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private async saveFile(params: {
    buffer: Buffer;
    originalName: string;
    ext: string;
  }): Promise<Upload> {
    const { buffer, originalName, ext } = params;
    const hash = await this.generateHash(buffer);
    const finalExt = ext || path.extname(originalName);
    const key = `${hash}${finalExt}`;
    const filePath = path.join(CONFIG.UPLOAD_DIR, key);

    const [upload] = await Promise.all([
      this.uploadRepository.save({
        hash,
        key,
        url: `/uploads/${key}`,
      }),
      fs.writeFile(filePath, buffer),
    ]);

    return upload;
  }

  private async saveOriginalFile(file: Express.Multer.File): Promise<Upload> {
    return this.saveFile({
      buffer: file.buffer,
      originalName: file.originalname,
      ext: path.extname(file.originalname),
    });
  }

  private async handleError(
    error: Error,
    file: Express.Multer.File,
  ): Promise<Upload> {
    if (error.message.includes('Invalid input')) {
      return this.saveOriginalFile(file);
    }

    try {
      return await this.saveOriginalFile(file);
    } catch (fallbackError) {
      this.logger.error('回退方案失败', fallbackError.stack);
      throw new Error('文件处理失败');
    }
  }

  async getFiles(page = 1, limit = 10) {
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
