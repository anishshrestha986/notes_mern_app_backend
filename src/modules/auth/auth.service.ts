import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserDocument } from '@interfaces';
import { ROLE, USER_STATUS } from 'src/types/enums';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(user: IUserDocument, role: ROLE) {
    const payload = { sub: user.id, role };

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...user.toJSON(), role },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<IUserDocument | null> {
    const user = await this.userService.getUserByEmail(email);
    if (
      user &&
      (await user.comparePassword(password)) &&
      user.status === USER_STATUS.ACTIVE
    ) {
      if (user.emailVerified) {
        return user;
      }
    }
    return null;
  }
}
