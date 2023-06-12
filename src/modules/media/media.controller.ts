import {
  Controller,
  Post,
  UseInterceptors,
  Res,
  HttpStatus,
  Param,
  Get,
  UploadedFiles,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaService } from './media.service';
import * as path from 'path';
import { Response } from 'express';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { IRequest } from '@interfaces';
import { NotFoundException } from '@nestjs/common';
import { DEFAULT_SORT, DEFAULT_PAGE, LIMIT_PER_PAGE } from '@constants';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaUploadDto } from './dto/mediaUpload.dto';
import { PaginateQueryDto } from '@dto/getQuery.dto';

@ApiTags('Media')
@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MediaUploadDto, description: 'Media upload' })
  @UseGuards(JwtAuthGuard)
  @Post('/')
  @UseInterceptors(FilesInterceptor('files[]', 5))
  async uploadFileToClodinary(
    @Req() req: IRequest,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }

    const uploadedFiles = await this.mediaService.uploadBulkImagesToCloudinary(
      files,
    );

    const fileData = await this.mediaService.createBulk(
      uploadedFiles
        .map((file) => {
          if (file.status === 'fulfilled') {
            const data = file.value;
            return {
              filepath: data.secure_url,
              public_id: data.public_id,
              mimetype: data.mimetype,
              size: data.bytes,
              user: req.user.id,
            };
          }
        })
        .filter((file) => !!file),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      data: fileData,
    });
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MediaUploadDto, description: 'Media upload' })
  @UseGuards(JwtAuthGuard)
  @Post('/local')
  @UseInterceptors(
    FilesInterceptor('files[]', 5, {
      storage: diskStorage({
        destination: './storage',
        filename: (_, file, callBack) => {
          const fileName =
            path.parse(file.originalname).name.replace(/\s/g, '') + Date.now();
          const extension = path.parse(file.originalname).ext;
          callBack(null, `${fileName}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Req() req: IRequest,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }
    const fileData = await this.mediaService.createBulk(
      files.map((file) => {
        return {
          filepath: file.path,
          mimetype: file.mimetype,
          size: file.size,
          user: req.user.id,
        };
      }),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      data: fileData,
    });
  }

  @Get('/:id')
  async getMediaById(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.getMediaById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.public_id) {
      return res.redirect(media.filepath);
    }

    return res.status(HttpStatus.OK).sendFile(media.filepath);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUserMedias(@Req() req: IRequest, @Query() query: PaginateQueryDto) {
    const { limit, page, sort } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
    };

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }

    const filter = {};
    const products = await this.mediaService.getUserMedias(
      req.user.id,
      filter,
      options,
    );
    return products;
  }
}
