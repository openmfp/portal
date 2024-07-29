import { Injectable } from '@angular/core';
import { LuigiNode } from '../../../../../../../backend/libs/portal-lib/src/luigiNode';
import { LuigiCoreService } from '../luigiCore.service';

@Injectable({
  providedIn: 'root',
})
export class IframeCreationService {
  constructor(private luigiCoreService: LuigiCoreService) {}

  private static isIFrameFeaturePolicyAllowed(
    policy: string,
    iframeURL: string | null
  ) {
    // should be connected to a still to be developed permission management logic
    return true;
  }

  private static isIFrameSandboxPermissionAllowed(
    policy: string,
    iframeURL: string | null
  ) {
    // should be connected to a still to be developed permission management logic
    return true;
  }

  iFrameCreationInterceptor() {
    return (iframe: Element, viewGroup: string, navigationNode: LuigiNode, microFrontendType: string | undefined) => {
      this.applyIframePermissions(iframe, navigationNode, viewGroup);
    };
  }

  private applyIframePermissions(
    iframe: Element,
    node: LuigiNode,
    viewGroup: string
  ): void {
    let permissions = node?.requiredIFramePermissions;
    if (!permissions && viewGroup) {
      // get perms for viewgroups
      const viewGroupSettings = this.luigiCoreService.getConfigValue(
        'navigation.viewGroupSettings'
      );
      const viewGroupConfig =
        (viewGroupSettings && viewGroupSettings[viewGroup]) || {};
      permissions = viewGroupConfig.requiredIFramePermissions;
    }
    if (!permissions) {
      return;
    }
    if (permissions.allow) {
      let allow = (iframe.getAttribute('allow') || '').trim();
      if (allow.length > 0 && !allow.endsWith(';')) {
        allow += ';';
      }
      permissions.allow.forEach((policy) => {
        if (
          IframeCreationService.isIFrameFeaturePolicyAllowed(
            policy,
            iframe.getAttribute('src')
          )
        ) {
          // feature policies are separated by semicolon
          allow += ` ${policy};`;
        }
      });
      iframe.setAttribute('allow', allow.trim());
    }
    if (permissions.sandbox) {
      let sandbox = (iframe.getAttribute('sandbox') || '').trim();
      permissions.sandbox.forEach((permission) => {
        if (
          IframeCreationService.isIFrameSandboxPermissionAllowed(
            permission,
            iframe.getAttribute('src')
          )
        ) {
          // sandbox permission are separated by whitespace
          sandbox += ' ' + permission;
        }
      });
      iframe.setAttribute('sandbox', sandbox.trim());
    }
  }
}