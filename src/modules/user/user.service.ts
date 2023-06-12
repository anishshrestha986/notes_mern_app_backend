import { Injectable } from '@nestjs/common';
import { ClientSession, FilterQuery, PaginateOptions } from 'mongoose';
import { UserRepository } from '@repositories/user.repository';
import { CreateUserDto, RegisterUserDto } from './dto/createUser.dto';
import { IUserDocument } from '@interfaces';
import { TokenService } from '@modules/token/token.service';
import { createOTP } from '@utils/otp.util';
import { ROLE, TOKEN_TYPE } from '@enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '@events';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,

    private eventEmitter: EventEmitter2,
  ) {}

  async createUser(
    createUserDto: CreateUserDto | RegisterUserDto,
    session: ClientSession,
  ) {
    const user = await this.userRepository.createUser(createUserDto, session);

    this.eventEmitter.emit(events.USER_REGISTERED, {
      name: user.username,
      email: user.email,
    });
    return user;
  }

  async getUserById(id: string) {
    return await this.userRepository.getUserById(id);
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.getUserByEmail(email);
  }

  async sendVerificationEmail(user: IUserDocument, session: ClientSession) {
    const otp = createOTP();
    await this.tokenService.createOTP(
      {
        userId: user.id,
        token: otp,
        tokenType: TOKEN_TYPE.EMAIL_VERIFICATION,
      },
      session,
    );
    Object.assign(user, { emailVerified: false });
    await user.save({ session });
    this.eventEmitter.emit(events.EMAIL_VERIFICATION, {
      name: user.username,
      email: user.email,
      otp,
    });

    return user;
  }

  async verifyEmail(userId: string, session: ClientSession) {
    return await this.userRepository.verifyEmail(userId, session);
  }

  async updateUser(
    id: string,
    updateBody: UpdateUserDto,
    session: ClientSession,
  ) {
    return await this.userRepository.updateUser(id, updateBody, session);
  }

  async getAllUserByRole(
    role: ROLE,
    filter: FilterQuery<IUserDocument>,
    options: PaginateOptions,
  ) {
    return await this.userRepository.getAllUsers(
      { ...filter, roles: role },
      options,
    );
  }
  async getAdminById(id: string) {
    const user = await this.getUserById(id);
    if (user.roles.includes('admin')) return user;
  }
}
