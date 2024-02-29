import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
@Controller('/rest/logout')
export class LogoutController {
  constructor(
    private authService: AuthService
  ) {}

  @Get()
  async logout(@Req() request: Request, @Res() response: Response) {
    await this.authService.removeAuthCookies(response);

    let redirectURL = '/logout';
    if (request.query.error) {
      const error = request.query.error as string;
      redirectURL += `?error=${error}`;
    }
    return response.redirect(redirectURL);
  }
}
