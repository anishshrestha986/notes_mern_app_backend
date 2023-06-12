import { IsOptional, IsString } from 'class-validator';

export class PaginateQueryDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  page?: number;
}
export class GetQueryDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
