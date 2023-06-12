import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { DeltaStatic } from 'src/types/interfaces';
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Note {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true, type: Object })
  content: DeltaStatic | string;

  @Prop({ required: true, ref: 'User', type: MongooseSchema.Types.ObjectId })
  author: Types.ObjectId;
}
export const NoteSchema = SchemaFactory.createForClass(Note);
