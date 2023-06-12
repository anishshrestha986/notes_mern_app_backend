import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { LocalAuthGuard } from '@classes/local-auth.guard';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { IRequest } from '@interfaces';
import { AuthService } from './auth.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserService } from '@modules/user/user.service';
import { TokenService } from '@modules/token/token.service';
import { SendOTPDto } from '@modules/token/dto/sendOTP.dto';
import { TOKEN_TYPE } from '@enums';
import { VerifyEmailDto } from '@modules/token/dto/verifyEmail.dto';
import { RegisterUserDto } from '@modules/user/dto/createUser.dto';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  @Post('/register')
  async register(@Body() createUserDto: RegisterUserDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user = await this.userService.createUser(createUserDto, session);
      await this.userService.sendVerificationEmail(user, session);
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send({
        message: 'Email verification link has been sent to your email',
      });
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: IRequest, @Body() body: LoginDto) {
    if (!req.user.roles.includes(body.role)) {
      throw new UnauthorizedException({
        message: 'You are unauthorized as your requested role.',
      });
    }
    const validatedUser = await this.authService.validateUser(
      body.email,
      body.password,
    );
    if (!validatedUser) {
      throw new UnauthorizedException({
        message: 'User not verified',
      });
    }
    return this.authService.login(req.user, body.role);
  }

  @ApiExcludeEndpoint()
  @Post('/reset-password')
  async resetPassword(@Request() req: IRequest) {
    // TODO: implement
  }

  @Post('/send-verification-email')
  async sendVerificationEmail(@Body() body: SendOTPDto) {
    const user = await this.userService.getUserByEmail(body.email);

    if (!user) {
      return {
        message:
          'If you have registered with this email, you will receive an email with a verification link.',
      };
    }

    if (user.emailVerified) {
      throw new ConflictException({ message: 'Email already verified' });
    }

    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.userService.sendVerificationEmail(user, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      session.endSession();
    }

    return {
      message:
        'If you have registered with this email, you will receive an email with a verification link.',
    };
  }

  @Post('/verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const session = await this.mongoConnection.startSession();
    const user = await this.userService.getUserByEmail(body.email);

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    const token = await this.tokenService.getUserVerificationToken(
      user.id,
      TOKEN_TYPE.EMAIL_VERIFICATION,
    );

    if (!token || token.token !== body.token) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    session.startTransaction();
    try {
      await this.userService.verifyEmail(user.id, session);
      await this.tokenService.deleteToken(token.id, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }

    return { message: 'Email verified' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getProfile(@Req() req: IRequest) {
    return req.user;
  }
}
