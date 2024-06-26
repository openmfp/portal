import { Controller, Get, Req, Res } from '@nestjs/common';
import { EnvService } from './env.service';
import { Request, Response } from 'express';
import { AuthDataService } from '../auth/auth-data.service';
import {ClientEnvironment} from "./clientEnvironment";

@Controller('/rest/envconfig')
export class EnvController {
  constructor(
    private envService: EnvService,
    private authDataService: AuthDataService
  ) {}

  @Get()
  async getEnv(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<ClientEnvironment> {
    const env = this.envService.getEnv();
    const authEnv = this.envService.getCurrentAuthEnv(request);

    if (authEnv.oauthServerUrl === 'none') {
      const result: ClientEnvironment = {
        oauthServerUrl: authEnv.oauthServerUrl,
        tokenUrl: authEnv.tokenUrl,
        clientId: authEnv.clientId,
        developmentInstance: env.developmentInstance,
        validWebcomponentUrls: env.validWebcomponentUrls,
      };

      result.authData = {
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTcwOTgwNDU0MSwiZXhwIjoxNzA5ODA4MTQxLCJsYXN0X25hbWUiOiJEb2UiLCJmaXJzdF9uYW1lIjoiSm9obiJ9.S0YvifYOKg9GuHpJm8OWr8udhTVj5TObVkn0M-j8Yz4',
        expires_in: new Date().getTime() + 200000 + '',
      };
      return result;
    }

    const authData = await this.authDataService.provideAuthData(
      request,
      response,
    );

    const result: ClientEnvironment = {
      oauthServerUrl: authEnv.oauthServerUrl,
      tokenUrl: authEnv.tokenUrl,
      clientId: authEnv.clientId,
      developmentInstance: env.developmentInstance,
      validWebcomponentUrls: env.validWebcomponentUrls,
    };

    if (authData) {
      result.authData = authData;
    }

    return result;
  }
}
