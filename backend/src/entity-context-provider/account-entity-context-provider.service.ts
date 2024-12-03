import { Injectable } from '@nestjs/common';
import { EntityContextProvider } from '@openmfp/portal-server-lib';

@Injectable()
export class AccountEntityContextProvider implements EntityContextProvider {
  async getContextValues(
    token: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    return {
      id: context.account,
      policies: [
        'create',
        'delete',
        'get',
        'list',
        'update',
        'watch',
        'gardener_project_create',
        'gardener_project_list',
      ],
    };
  }
}
