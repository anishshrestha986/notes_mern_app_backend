import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PopulateOptions,
} from 'mongoose';
import { NoteRepository } from '@repositories/note.reposistory';
import { INoteDocument } from '@interfaces';
import { CreateNoteDto } from './dto/createNote.dto';
import { UpdateNoteDto } from './dto/updateNote.dto';
@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async createNote(createNoteDto: CreateNoteDto, session: ClientSession) {
    const createdNote = await this.noteRepository.createNote(
      createNoteDto,
      session,
    );
    return createdNote;
  }

  async getNoteById(id: string, populate?: PopulateOptions) {
    return await this.noteRepository.getNoteById(id, populate);
  }

  async getAllNote(
    filter: FilterQuery<INoteDocument>,
    options: PaginateOptions,
  ) {
    return await this.noteRepository.getAllNote(filter, options);
  }

  async updateNote(
    id: string,
    updateBody: UpdateNoteDto,
    session: ClientSession,
  ) {
    return await this.noteRepository.updateNote(id, updateBody, session);
  }
  async deleteNote(id: string, session: ClientSession) {
    return await this.noteRepository.deleteNote(id, session);
  }
  async getUserNotes(
    userId: string,
    filter: FilterQuery<INoteDocument>,
    options: PaginateOptions,
  ) {
    return await this.noteRepository.getAllNote(
      { ...filter, issuedBy: userId },
      options,
    );
  }
}
