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
        'owner',
        'member',
        'iamAdmin',
        'iamMember',
        'waasAdmin',
        'metadataAdmin',
        'sentryViewer',
        'argocdViewer',
        'gardenerViewer',
        'githubAdmin',
        'accountAdmin',
        'extensionAdmin',
        'vaultMaintainer',
        'projectAdmin',
        'waasAdmin',
        'iamMember',
        'metadataAdmin',
        'sentryViewer',
        'argocdViewer',
        'gardenerViewer',
        'githubMember',
        'projectMember',
      ],
    };
  }
}
