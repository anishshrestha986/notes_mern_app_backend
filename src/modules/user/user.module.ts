import toJSON from '@entities/plugins/toJSON.plugin';
import validSlugGenerator from '@entities/plugins/validSlugGenerator';
import { TokenModule } from '@modules/token/token.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as paginate from 'mongoose-paginate-v2';
import { User, UserSchema } from '../../entities/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          UserSchema.pre('save', async function () {
            if (this.isModified('password')) {
              this.password = await bcrypt.hash(this.password, 8);
            }
          });

          UserSchema.static(
            'isEmailTaken',
            async function (email: string): Promise<boolean> {
              const user = await this.findOne({ email });
              return !!user;
            },
          );

          UserSchema.method(
            'comparePassword',
            async function (password: string): Promise<boolean> {
              return await bcrypt.compare(password, this.password);
            },
          );

          UserSchema.plugin(paginate);
          UserSchema.plugin(toJSON);
          UserSchema.plugin(validSlugGenerator);

          return UserSchema;
        },
      },
    ]),
    TokenModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
