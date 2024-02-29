import { LuigiNode, LuigiUserSettingsConfig } from '../luigiNode';

export interface LuigiAppConfig {
  urlTemplateParams: Record<string, string>;
  navMode?: string;
  urlTemplateId?: string;
}

interface ViewGroup {
  preloadSuffix?: string;
  requiredIFramePermissions?: Record<string, string>;
}

export interface LuigiNavConfig {
  viewGroup?: ViewGroup;
  nodes?: LuigiNode[];
  userSettings: LuigiUserSettingsConfig;
}
