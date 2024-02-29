import { PortalContextProvider } from './portalContextProvider';

export class EmptyPortalContextProvider implements PortalContextProvider {
  getContextValues(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
