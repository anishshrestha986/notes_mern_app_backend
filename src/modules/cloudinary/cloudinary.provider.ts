import { v2 } from 'cloudinary';
import { CLOUDINARY } from '@constants';
import { ConfigService } from 'src/config/config.service';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return v2.config(configService.getCloudinaryConfig());
  },
};
