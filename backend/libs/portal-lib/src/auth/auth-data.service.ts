import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthData } from './auth-interfaces';

@Injectable()
export class AuthDataService {
  constructor(private iasService: AuthService, private logger: Logger) {}

  public async provideAuthData(
    request: Request,
    response: Response
  ): Promise<AuthData> {
    const authCookie = this.iasService.getAuthCookie(request);
    if (!authCookie) {
      return undefined;
    }

    try {
      return await this.iasService.exchangeTokenForRefreshToken(
        request,
        response,
        authCookie
      );
    } catch (e) {
      this.logger.error(e);
      return undefined;
    }
  }
}
