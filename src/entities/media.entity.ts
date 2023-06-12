import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
@Schema({
  timestamps: true,
})
export class Media {
  @Prop({ required: true })
  filepath: string;

  @Prop({ default: '' })
  public_id: string; // Cloudinary public id

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true, ref: 'User', type: MongooseSchema.Types.ObjectId })
  user: Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
