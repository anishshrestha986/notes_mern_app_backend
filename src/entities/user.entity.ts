import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLE, USER_STATUS } from 'src/types/enums';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, private: true })
  password: string;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({
    required: true,
    type: [{ type: String, enum: ROLE }],
  })
  roles: string[];

  @Prop({ required: true, default: USER_STATUS.ACTIVE, enum: USER_STATUS })
  status: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Purchase' }] })
  purchases: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
