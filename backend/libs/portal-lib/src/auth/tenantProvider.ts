import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { Request } from 'express';

export interface TenantProvider {
  provideTenant: (request: Request) => Promise<string>;
}

@Injectable()
export class LocalTenantProvider implements TenantProvider {
  private readonly _tenantId: string;

  constructor(envService: EnvService) {
    this._tenantId = envService.getEnv().tenantId;
  }

  provideTenant(): Promise<string> {
    return Promise.resolve(this._tenantId);
  }
}
