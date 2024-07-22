import {
  Controller,
  Post,
  Req,
  Inject,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthCallback } from './authCallback';
import { AUTH_CALLBACK_INJECTION_TOKEN } from '../injectionTokens';
import { AuthService, AuthResponse } from './auth.service';

@Controller('/rest/auth')
export class AuthController {
  constructor(
    @Inject(AUTH_CALLBACK_INJECTION_TOKEN) private authCallback: AuthCallback,
    private authService: AuthService,
    private logger: Logger
  ) {}

  @Post('')
  async auth(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    const code = request.query.code;
    if (!code) {
      throw new HttpException(
        "no 'code' was provided in the query",
        HttpStatus.BAD_REQUEST
      );
    }

    let authResponse: AuthResponse;
    try {
      const authResponse: AuthResponse = await this.authService.exchangeTokenForCode(
        request,
        response,
        code.toString()
      );

      await this.authCallback.callback(authResponse.id_token);
    } catch (e: any) {
      console.error(`error while calling authCallback: ${e}`);
      return Promise.reject(e);
    }
    return this.filterIasResponseForFrontend(authResponse);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    const dxpAuthCookie = this.authService.getAuthCookie(request);
    if (!dxpAuthCookie) {
      throw new HttpException(
        'the user is not logged in',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const authResponse: AuthResponse =
        await this.authService.exchangeTokenForRefreshToken(
          request,
          response,
          dxpAuthCookie
        );
      await this.authCallback.callback(authResponse.id_token);
      this.logger.debug('refreshing auth successful');
      return this.filterIasResponseForFrontend(authResponse);
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.logger.error(`error while refreshing token, logging out: ${e}`);
      // logout to trigger a fresh login flow
      await this.authService.removeAuthCookies(response);
      throw e;
    }
  }

  private filterIasResponseForFrontend(iasResponse: AuthResponse): AuthResponse {
    delete iasResponse.refresh_token;
    return iasResponse;
  }
}
