import * as dotenv from 'dotenv';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class ConfigService {
  private readonly envConfig: Record<string, string>;
  constructor() {
    const result = dotenv.config();

    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public getPortConfig() {
    return this.get('PORT');
  }

  public getMongoConfig() {
    return {
      uri:
        this.get('MONGO_PROTOCOL') +
        this.get('MONGO_USER') +
        ':' +
        this.get('MONGO_PASSWORD') +
        '@' +
        this.get('MONGO_HOST') +
        '/' +
        this.get('MONGO_DATABASE') +
        '?retryWrites=true&w=majority',
    };
  }

  public getJwtConfig() {
    return {
      secret: this.get('JWT_SECRET'),
      expiresIn: this.get('JWT_EXPIRATION_TIME'),
    };
  }

  public getMailConfig() {
    return {
      transport: {
        host: this.get('MAIL_HOST'),
        port: +this.get('MAIL_PORT'),
        auth: {
          user: this.get('MAIL_USER'),
          pass: this.get('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${this.get('MAIL_FROM')}>`,
      },
    } as SMTPTransport.Options;
  }
  public getCloudinaryConfig() {
    return {
      cloud_name: this.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.get('CLOUDINARY_API_KEY'),
      api_secret: this.get('CLOUDINARY_API_SECRET'),
    };
  }
  public getHttpConfig() {
    return {
      http_timeout: this.get('HTTP_TIMEOUT'),
      http_max_redirects: this.get('HTTP_MAX_REDIRECTS'),
    };
  }
}
