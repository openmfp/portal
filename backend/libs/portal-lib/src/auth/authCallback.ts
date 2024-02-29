import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

export interface AuthCallback {
  callback(idToken: string): Promise<any>;
  setCookies(
    request: Request,
    response: Response,
    idToken: string
  ): Promise<any>;

  clearCookies(response: Response): Promise<any>;
}

@Injectable()
export class NoopAuthCallback implements AuthCallback {
  callback(): Promise<void> {
    return Promise.resolve();
  }

  clearCookies(response: Response): Promise<void> {
    return Promise.resolve();
  }

  setCookies(): Promise<void> {
    return Promise.resolve();
  }
}
