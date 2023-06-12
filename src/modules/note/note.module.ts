import { Note, NoteSchema } from '@entities/note.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteRepository } from '@repositories/note.reposistory';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import * as paginate from 'mongoose-paginate-v2';
import * as soft_delete from 'mongoose-delete';
import toJSON from '@entities/plugins/toJSON.plugin';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Note.name,
        useFactory: () => {
          NoteSchema.plugin(paginate);
          NoteSchema.plugin(soft_delete, {
            overrideMethods: true,
            indexFields: true,
          });
          NoteSchema.plugin(toJSON);
          return NoteSchema;
        },
      },
    ]),
    UserModule,
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository],
  exports: [NoteService, NoteRepository],
})
export class NoteModule {}
