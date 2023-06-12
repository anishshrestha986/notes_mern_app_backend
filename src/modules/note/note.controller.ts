import {
  Res,
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Delete,
  Patch,
  Param,
  HttpStatus,
  Req,
  Query,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { NoteService } from './note.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AdminCreateNoteDto } from './dto/createNote.dto';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { IRequest } from '@interfaces';
import { DEFAULT_PAGE, DEFAULT_SORT, LIMIT_PER_PAGE } from 'src/constants';
import { NotFoundException } from '@nestjs/common';
import { UpdateNoteDto } from './dto/updateNote.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '@dto/getQuery.dto';
import { UserService } from '@modules/user/user.service';

@ApiTags('Note')
@Controller('note')
export class NoteController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private noteService: NoteService,
    private userService: UserService,
  ) {}

  @Get('/')
  async getAllNotes(@Query() query: GetQueryDto) {
    const filter = {
      name: undefined,
    };
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
    };

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    } else delete filter.name;

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }

    const notes = await this.noteService.getAllNote(filter, options);
    return notes;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async createNote(
    @Req() req: IRequest,
    @Body() createNoteDto: AdminCreateNoteDto,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    const user = await this.userService.getUserById(req.user.id);
    if (!user) throw new BadRequestException('User not found');
    const author = user._id;
    session.startTransaction();
    try {
      const newNote: any = await this.noteService.createNote(
        { ...createNoteDto, author },
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send(newNote);
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getUserNotes(@Req() req: IRequest, @Query() query: GetQueryDto) {
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
    };
    const filter = { name: undefined };
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    } else delete filter.name;

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }

    const notes = await this.noteService.getUserNotes(
      req.user.id,
      filter,
      options,
    );
    return notes;
  }

  @Get('/:id')
  async getNoteById(@Param('id') id: string, @Res() res: Response) {
    const note: any = await this.noteService.getNoteById(id);
    if (!note) throw new NotFoundException('Note not found');
    return res.status(HttpStatus.OK).send(note);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Res() res: Response,
    @Req() req: IRequest,
  ) {
    const note = await this.noteService.getNoteById(id);
    if (!note) throw new NotFoundException('Note not found');
    if (note.author.toHexString() !== req.user.id)
      throw new UnauthorizedException('You can not update this note');
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const updatednote = await this.noteService.updateNote(
        id,
        { ...updateNoteDto },
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send(updatednote);
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deletedNote(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: IRequest,
  ) {
    const note = await this.noteService.getNoteById(id);
    if (!note) throw new NotFoundException('Note not found');
    if (note.author.toHexString() !== req.user.id)
      throw new UnauthorizedException('You can not delete this note');
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.noteService.deleteNote(id, session);
      await session.commitTransaction();
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }
}
