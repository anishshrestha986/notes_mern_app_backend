import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenRepository } from '@repositories/token.repository';
import { ClientSession } from 'mongoose';
import { TOKEN_TYPE } from '@enums';
import { CreateTokenDto } from './dto/createToken.dto';

@Injectable()
export class TokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async createOTP(createTokenDto: CreateTokenDto, session: ClientSession) {
    const token = await this.tokenRepository.createOTP(createTokenDto, session);
    return token;
  }

  async getUserVerificationToken(userId: string, tokenType: TOKEN_TYPE) {
    const token = await this.tokenRepository.getUserVerificationToken(
      userId,
      tokenType,
    );
    if (!token) {
      throw new UnauthorizedException({ message: 'Invalid Token' });
    }

    if (await token.isExpired()) {
      throw new UnauthorizedException({ message: 'Token is expired' });
    }
    return token;
  }

  async deleteToken(tokenId: string, session: ClientSession) {
    const token = await this.tokenRepository.deleteToken(tokenId, session);
    return token;
  }
}
