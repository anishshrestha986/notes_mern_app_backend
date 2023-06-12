import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './createNote.dto';

export class UpdateNoteDto extends OmitType(PartialType(CreateNoteDto), [
  'author',
] as const) {}
