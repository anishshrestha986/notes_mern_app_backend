import { IsNotEmpty, IsString } from 'class-validator';
import { TOKEN_TYPE } from 'src/types/enums';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  tokenType: TOKEN_TYPE;
}
