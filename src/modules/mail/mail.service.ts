import { events } from '@events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private mailerService: MailerService) {}

  async sendMail({
    to,
    from,
    subject,
    text,
    html,
    context,
    template,
  }: ISendMailOptions) {
    try {
      await this.mailerService.sendMail({
        to,
        from,
        subject,
        text,
        html,
        context,
        template,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnEvent(events.USER_REGISTERED, { async: true })
  async onUserRegistered({ email, name }) {
    await this.sendMail({
      to: email,
      subject: 'Welcome to Tracker',
      template: './welcome',
      context: {
        name,
        email,
      },
    });
  }

  @OnEvent(events.EMAIL_VERIFICATION)
  async onEmailVerification({ name, email, otp }) {
    await this.sendMail({
      to: email,
      subject: 'Welcome to Tracker - Verify your email',
      template: './verify-email',
      context: {
        name,
        email,
        otp,
      },
    });
  }
}
