import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Upload } from './entities/upload.entity';
import { AuthUserGuard } from 'src/auth-user/authUser.guard';

@Controller('upload')
@UseGuards(AuthUserGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Upload> {
    return this.uploadService.uploadFile(file);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Upload[]> {
    return Promise.all(
      files.map((file) => this.uploadService.uploadFile(file)),
    );
  }

  @Get()
  async getFiles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.uploadService.getFiles(page, limit);
  }
}
