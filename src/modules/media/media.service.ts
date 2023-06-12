import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/createMedia.dto';
import { MediaRepository } from '@repositories/media.repository';
import { FilterQuery, PaginateOptions } from 'mongoose';
import { IMediaDocument } from 'src/types/interfaces/entities/media.interface';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository, private cloudinary: CloudinaryService) {}

  async uploadImageToCloudinary(file: Express.Multer.File) {
    return await this.cloudinary
      .uploadImage(file)
      .then((result: UploadApiResponse) => ({ ...result, mimetype: file.mimetype }))
      .catch((err: UploadApiErrorResponse) => {
        throw new BadRequestException(err);
      });
  }

  async uploadBulkImagesToCloudinary(files: Express.Multer.File[]) {
    return await Promise.allSettled(files.map((file) => this.uploadImageToCloudinary(file)));
  }

  async createBulk(medias: CreateMediaDto[]) {
    return this.mediaRepository.createBulk(medias);
  }

  async getMediaById(id: string) {
    return await this.mediaRepository.getMediaById(id);
  }

  async verifyUserMedia(userId: string, medias: string[]) {
    (await this.mediaRepository.getMediaOfUser(userId, medias)).length === medias.length;
  }

  async getUserMedias(userId: string, filter: FilterQuery<IMediaDocument>, options: PaginateOptions) {
    return await this.mediaRepository.getAllMedias({ ...filter, user: userId }, options);
  }
}
