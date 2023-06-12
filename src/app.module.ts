import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { NoteModule } from './modules/note/note.module';

import { TokenModule } from '@modules/token/token.module';
import { MediaModule } from '@modules/media/media.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from '@modules/mail/mail.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.getMongoConfig(),
    }),
    NoteModule,
    ConfigModule,
    AuthModule,
    MailModule,
    MediaModule,
    UserModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
