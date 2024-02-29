import { LuigiNode } from '../luigiNode';
import { LuigiConfigFragment } from './luigi-config.fragment';
import { HelpCenterData } from './help-center.data';

export interface RawServiceProvider {
  name: string;
  luigiConfigFragment: LuigiConfigFragment[];
  config?: Record<string, string>;
  creationTimestamp?: string;
  installationData?: Record<string, string>;
  extensionClassName?: string;
  isMissingMandatoryData?: boolean;
  helpCenterData?: HelpCenterData;
  documentation?: URL;
}

export interface ServiceProviderResponse {
  serviceProviders: RawServiceProvider[];
}

export interface ServiceProviderService {
  getServiceProviders(
    token: string,
    entities: string[],
    context: Record<string, any>
  ): Promise<ServiceProviderResponse>;
}

export interface URL {
  url: string;
}

export interface StackSearch {
  tags: string[];
}

export interface ServiceProvider {
  nodes: LuigiNode[];
  config: Record<string, string>;
  installationData?: Record<string, string>;
  creationTimestamp: string;
}