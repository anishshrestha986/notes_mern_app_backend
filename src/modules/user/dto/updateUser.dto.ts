import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { USER_STATUS } from 'src/types/enums';

import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ChangeStatusDto {
  @IsEnum(USER_STATUS)
  status: USER_STATUS;
}
