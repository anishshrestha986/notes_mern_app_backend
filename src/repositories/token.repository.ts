import { InjectModel } from '@nestjs/mongoose';
import { ClientSession } from 'mongoose';
import { ITokenModel, ITokenDocument } from '@interfaces';
import { Token } from '@entities/token.entity';
import { CreateTokenDto } from '../modules/token/dto/createToken.dto';
import { TOKEN_TYPE } from 'src/types/enums';

export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: ITokenModel,
  ) {}

  async createOTP(createTokenDto: CreateTokenDto, session: ClientSession) {
    await this.tokenModel.deleteMany({
      userId: createTokenDto.userId,
      tokenType: createTokenDto.tokenType,
    });
    const token = new this.tokenModel(createTokenDto);

    return token.save({ session });
  }

  async getUserVerificationToken(userId: string, tokenType: TOKEN_TYPE) {
    const token: ITokenDocument = await this.tokenModel.findOne({
      userId,
      tokenType,
    });
    return token;
  }

  async deleteToken(tokenId: string, session: ClientSession) {
    const token: ITokenDocument = await this.tokenModel.findByIdAndRemove(
      tokenId,
      { session },
    );
    return token;
  }
}
