import { Request } from 'express';

export interface UserPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
