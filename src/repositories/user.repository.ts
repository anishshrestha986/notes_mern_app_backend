import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PaginateResult,
} from 'mongoose';
import { IUserDocument, IUserModel } from '@interfaces';
import { User } from '@entities/user.entity';
import {
  CreateUserDto,
  RegisterUserDto,
} from '../modules/user/dto/createUser.dto';
import { UpdateUserDto } from '@modules/user/dto/updateUser.dto';

export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: IUserModel) {}

  async createUser(
    createUserDto: CreateUserDto | RegisterUserDto,
    session: ClientSession,
  ) {
    if (await this.userModel.isEmailTaken(createUserDto.email))
      throw new ConflictException('Email already exists');

    let user = new this.userModel(createUserDto);

    try {
      user = await user.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    return user;
  }

  async verifyEmail(userId: string, session: ClientSession) {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { emailVerified: true } },
        session,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUser(
    id: string,
    updateParams: UpdateUserDto,
    session: ClientSession,
  ) {
    const user = await this.getUserById(id);

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateParams);
    await user.save({ session });
    return user;
  }

  async getAllUsers(
    filter: FilterQuery<IUserDocument>,
    options: PaginateOptions,
  ) {
    const projects: PaginateResult<IUserDocument> =
      await this.userModel.paginate(filter, options);
    return projects;
  }
}
