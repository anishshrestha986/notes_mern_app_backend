import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  filepath: string;

  @IsString()
  @IsNotEmpty()
  size: number;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsString()
  @IsNotEmpty()
  user: Types.ObjectId;
}
