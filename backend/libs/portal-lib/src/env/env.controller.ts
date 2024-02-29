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

    const authData = await this.authDataService.provideAuthData(
      request,
      response
    );

    const result: ClientEnvironment = {
      oauthServerUrl: authEnv.oauthServerUrl,
      clientId: authEnv.clientId,
      developmentInstance: env.developmentInstance,
    };

    if (authData) {
      result.authData = authData;
    }

    return result;
  }
}
