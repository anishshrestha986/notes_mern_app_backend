import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { TOKEN_TYPE } from '@enums';

@Schema({
  timestamps: true,
})
export class Token {
  @Prop({ required: true, ref: 'User', type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: TOKEN_TYPE })
  tokenType: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
