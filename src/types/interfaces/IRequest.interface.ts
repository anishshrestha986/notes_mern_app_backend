import { Request } from 'express';
import { IUserDocument } from '@interfaces';

interface IRequest extends Request {
  user: IUserDocument;
}

export { IRequest };
