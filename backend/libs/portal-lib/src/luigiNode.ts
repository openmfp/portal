export interface LuigiNodeCategory {
  label: string;
  collapsible?: boolean;
  dxpOrder?: number;
  id?: string;
}
export interface LuigiNodeIFramePermissions {
  allow?: string[];
  sandbox?: string[];
}
export interface LuigiUserSettingsConfig {
  groups: Record<string, LuigiUserSettingsGroup>;
}
export interface EntityDefinition {
  id: string;
  dynamicFetchId?: string;
  contextKey?: string;
  useBack?: boolean;
  label?: string;
  pluralLabel?: string;
  notFoundConfig?: {
    entityListNavigationContext: string;
    sapIllusSVG: string;
  };
}
export interface LuigiUserSettingsGroup {
  label?: string;
  sublabel?: string;
  title?: string;
  icon?: string;
  viewUrl?: string;
  settings?: Record<string, LuigiUserSetting>;
}
export interface LuigiUserSetting {
  type: string;
  label?: string;
  style?: string;
  options?: string[];
  isEditable?: boolean;
}
export interface LuigiIntent {
  baseEntityId?: string;
  relativePath?: string;
  semanticObject: string;
  action: string;
  pathSegment?: string;
}
export interface IntentSpecification {
  type: string;
  inboundId: string;
  resolvedIntent?: LuigiIntent;
}
export interface CrossNavigationInbounds {
  [name: string]: LuigiIntent;
}
export interface LuigiClientPermissions {
  urlParameters?: Record<string, LuigiUrlParameterPermissions>;
}
export interface LuigiBadgeCounter {
  label: string;
  count: () => Promise<number | string> | number | string;
}
export interface LuigiStatusBadge {
  label: string;
  type: string;
}
export interface LuigiUrlParameterPermissions {
  write?: boolean;
  read?: boolean;
}

export interface LuigiNode {
  label?: string;
  pathSegment?: string;
  viewUrl?: string;
  children?:
    | LuigiNode[]
    | {
        (context?: any): Promise<LuigiNode[]>;
      }
    | {
        (context?: any): LuigiNode[];
      };
  context?: Record<string, any>;
  viewGroup?: string;
  _dxpPreloadUrl?: string;
  _requiredIFramePermissionsForViewGroup?: LuigiNodeIFramePermissions;
  _dxpUserSettingsConfig?: LuigiUserSettingsConfig;
  _intentMappings?: LuigiIntent[];
  _entityRelativePaths?: Record<string, any>;
  _portalDirectChildren?: LuigiNode[];
  _entityRootChild?: boolean;
  navSlot?: string;
  defineSlot?: string;
  externalLink?: string;
  hideFromNav?: boolean;
  globalNav?: boolean | string;
  icon?: string;
  testId?: string;
  useHashRouting?: boolean;
  isolateView?: boolean;
  virtualTree?: boolean;
  hideSideNav?: boolean;
  tabNav?: boolean;
  loadingIndicator?: {
    enabled: boolean;
  };
  keepSelectedForChildren?: boolean;
  link?: string;
  category?: LuigiNodeCategory | string;
  dxpOrder?: number;
  entityType?: string;
  requiredIFramePermissions?: LuigiNodeIFramePermissions;
  userSettingsGroup?: string;
  navigationContext?: string;
  visibleForFeatureToggles?: string[];
  visibleForEntityContext?: Record<string, any>;
  visibleForContext?: string;
  visibleForPlugin?: boolean;
  requiredPolicies?: string[];
  webcomponent?: boolean;
  onNodeActivation?: (node: LuigiNode) => boolean;
  openNodeInModal?: any;
  defineEntity?: EntityDefinition;
  compound?: any;
  layoutConfig?: any;
  navHeader?: any;
  titleResolver?: any;
  showBreadcrumbs?: boolean;
  ignoreInDocumentTitle?: boolean;
  clientPermissions?: LuigiClientPermissions;
  target?: IntentSpecification;
  badgeCounter?: LuigiBadgeCounter;
  decodeViewUrl?: boolean;
  statusBadge?: LuigiStatusBadge;
  url?: string;
  urlSuffix?: string;
  configurationMissing?: string;
  configurationHint?: string;
  configurationLink?: string;
  isMissingMandatoryData?: boolean;
  helpContext?: HelpContext;
}

export interface ServiceProvider {
  nodes: LuigiNode[];
  config: Record<string, string>;
  installationData?: Record<string, string>;
  creationTimestamp: string;
}
export interface PortalConfig {
  providers: ServiceProvider[];
  tenantId: string;
  portalContext: Record<string, any>;
  featureToggles: Record<string, boolean>;
}
export interface EntityConfig {
  providers: ServiceProvider[];
  entityContext: Record<string, any>;
}
export interface HelpContext {
  stackSearch?: StackSearch;
  issueTracker?: URL;
  feedbackTracker?: URL;
  documentation?: URL;
}
export interface URL {
  url: string;
}
export interface StackSearch {
  tags: string[];
}
