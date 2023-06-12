import { Roles } from '@decorators/role.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, FilterQuery } from 'mongoose';
import { ROLE } from '@enums';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { ChangeStatusDto } from './dto/updateUser.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@classes/role.guard';
import { GetQueryDto } from '@dto/getQuery.dto';
import { DEFAULT_PAGE, DEFAULT_SORT, LIMIT_PER_PAGE } from '@constants/index';
import { IUserDocument } from '@interfaces';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private userService: UserService,
  ) {}

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const newUser: any = await this.userService.createUser(
        createUserDto,
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send(newUser);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      session.endSession();
    }
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/user')
  async getAllUsers(@Query() query: GetQueryDto) {
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
    };

    let filter: FilterQuery<IUserDocument>;
    if (q) {
      filter = {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
        ],
      };
    }

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }
    const users = await this.userService.getAllUserByRole(
      ROLE.USER,
      filter,
      options,
    );
    return users;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/admin')
  async getAllAdmins(@Query() query: GetQueryDto) {
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
    };

    let filter: FilterQuery<IUserDocument>;
    if (q) {
      filter = {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
        ],
      };
    }

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }
    const admins = await this.userService.getAllUserByRole(
      ROLE.ADMIN,
      filter,
      options,
    );
    return admins;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/status/:id')
  async changeStatus(
    @Param('id') id: string,
    @Body() updateUserDto: ChangeStatusDto,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const updatedUser = await this.userService.updateUser(
        id,
        { status: updateUserDto.status },
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send(updatedUser);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      session.endSession();
    }
  }
}
