import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { INoteDocument, INoteModel } from '@interfaces';
import { Note } from '@entities/note.entity';
import { CreateNoteDto } from '../modules/note/dto/createNote.dto';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PaginateResult,
  PopulateOptions,
} from 'mongoose';
import { UpdateNoteDto } from '@modules/note/dto/updateNote.dto';

export class NoteRepository {
  constructor(
    @InjectModel(Note.name)
    private readonly NoteModel: INoteModel,
  ) {}

  async createNote(createNoteDto: CreateNoteDto, session: ClientSession) {
    const note: INoteDocument = new this.NoteModel(createNoteDto);
    return await note.save({ session });
  }

  async getNoteById(noteId: string, populate?: PopulateOptions) {
    const note: INoteDocument = await this.NoteModel.findById(noteId).populate(
      populate,
    );
    return note;
  }

  async getAllNote(
    filter: FilterQuery<INoteDocument>,
    options: PaginateOptions,
  ) {
    const notes: PaginateResult<INoteDocument> = await this.NoteModel.paginate(
      filter,
      options,
    );
    return notes;
  }

  async updateNote(
    noteId: string,
    updateParams: UpdateNoteDto,
    session: ClientSession,
  ) {
    const note: INoteDocument = await this.getNoteById(noteId);
    if (!note) throw new NotFoundException('Note not found');

    Object.assign(note, updateParams);
    await note.save({ session });
    return note;
  }

  async deleteNote(noteId: string, session: ClientSession) {
    const note: INoteDocument = await this.getNoteById(noteId);
    if (!note) throw new NotFoundException('Note not found');
    try {
      await note.delete({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
