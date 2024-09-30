import { PortalContextProvider } from '@openmfp/portal-server-lib';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

@Injectable()
export class OpenmfpPortalProvider implements PortalContextProvider {
  constructor() {}

  getContextValues(): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      crdGatewayApiUrl: process.env.CRD_GATEWAY_API_URL,
    };
    return Promise.resolve(context);
  }
}
