import { IsValidObjectId } from '@decorators/valid-id.decorator';
import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DeltaStatic } from 'src/types/interfaces';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: DeltaStatic | string;

  @IsString()
  @IsValidObjectId()
  @IsNotEmpty()
  author: string;
}
export class AdminCreateNoteDto extends OmitType(CreateNoteDto, ['author']) {}
