import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigiCore.service';
import { AuthConfigService } from './auth.config.service';
import { EnvConfigService } from '../env-config.service';
import { ClientEnvironment } from '../../env/client-environment';
import { AuthService } from '../auth.service';
import { LuigiNode, PortalConfig } from '../../../../../../../backend/libs/portal-lib/src/luigiNode';
import { LuigiNodesService } from '../luigiNodes/luigi-nodes.service';
import { ConfigService } from '../portalConfig/config.service';
import { NodeSortingService } from './nodeSorting.service';


@Injectable({
  providedIn: 'root',
})
export class LuigiconfigService {

  constructor(
    private authService: AuthService,
    private luigiCoreService: LuigiCoreService,
    private authConfigService: AuthConfigService,
    private envConfigService: EnvConfigService,
    private luigiNodesService: LuigiNodesService,
    private configService: ConfigService,
    private nodeSortingService: NodeSortingService
  ) {

  }


  public async setLuigiConfiguration() {
    const envConfig: ClientEnvironment = await this.envConfigService.getEnvConfig();

    const config = {
      auth: this.authConfigService.getAuthConfig(envConfig.oauthServerUrl, envConfig.clientId),
      routing: this.getRoutingConfig() as any,
      settings: {
        header: {
          title: 'OpenMFP Portal',
          logo: 'about:blank',
          favicon: 'about:blank',
        },
        experimental: {
          btpToolLayout: true
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        featureToggles: { 
          queryStringParam: 'ft',
        },
      },
      lifecycleHooks: this.getLifecycleHooksConfig(envConfig),
    };
    
    config.routing.pageNotFoundHandler = () => {
      // NO OP, needs to be disabled for initial config
    };
    // routing needs to be disabled for initial config
    config.routing.skipRoutingForUrlPatterns = [/.*/];
    // modal handling needs to be disabled for initial config
    config.routing.showModalPathInUrl = false;
    config.routing.modalPathParam = 'modalPathParamDisabled'; // workaround, this line can be removed after luigi checks showModalPathInUrl initially (https://github.com/SAP/luigi/issues/2291)

    this.luigiCoreService.setConfig(config);

    this.luigiCoreService
      .auth()
      .store.setAuthData(this.authService.getAuthData());
      
  }


  private async getNavigationConfig(
    childrenByEntity: Record<string, LuigiNode[]>,
    envConfig: ClientEnvironment
  ) {
    const allNodes = Object.values(childrenByEntity).reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
    const viewGroupSettings = this.buildViewGroups(allNodes);
    const username = this.authService.getUsername();
    const portalConfig = await this.configService.getPortalConfig();
    const luigiNodes = await this.nodesFn(
      childrenByEntity,
      portalConfig,
      envConfig
    );
    const featureToggles = portalConfig.featureToggles;
    for (const featureToggleName of Object.keys(featureToggles)) {
      if (featureToggles[featureToggleName]) {
        this.luigiCoreService.setFeatureToggle(featureToggleName);
      }
    }

    const lcs = this.luigiCoreService;

    // const i18n = this.i18nService;
    return {
      nodes: luigiNodes,
      globalContext: {
        token: this.authService.getToken()
      },
      viewGroupSettings,
      //profile: this.getProfile(username),
      addNavHrefs: true,
      contextSwitcher: undefined,
      // nodeAccessibilityResolver: this.luigiNodesService.nodePolicyResolver,
      validWebcomponentUrls: envConfig.validWebcomponentUrls,
      //intentMapping: this.intentNavigationService.buildIntentMappings(allNodes),
      nodeChangeHook: function (prevNode: LuigiNode, nextNode: LuigiNode) {
        if(nextNode.initialRoute && nextNode.virtualTree && !(nextNode as any)._virtualTree) {
          lcs.navigation().navigate(nextNode.initialRoute);
        }
      //   // TODO: refactoring needed, see https://github.tools.sap/dxp/jukebox/issues/845
      //   this.helpContext = nextNode.helpContext;

      //   const entityTitle = nextNode.ignoreInDocumentTitle
      //     ? undefined
      //     : nextNode.label;

      //   const appTitle = this.getStaticSettingsConfig().header.title;
      //   const interpunct = '·';

      //   let rootNode = nextNode;
      //   while (rootNode.parent) {
      //     rootNode = rootNode.parent;
      //   }

      //   let title: string;
      //   if (rootNode.pathSegment === 'search') {
      //     const searchTitle = i18n.getTranslation('SEARCH_LABEL_IN_DOC_TITLE');
      //     const query = this.luigiCoreService.routing().getSearchParams().q;
      //     title = query ? `${searchTitle}: ${query} ${interpunct} ` : '';
      //     title += `${searchTitle} (${entityTitle}) | ${appTitle}`;
      //   } else {
      //     title = rootNode.label + ' | ' + appTitle;
      //   }

      //   this.luigiCoreService.ux().setDocumentTitle(title);
      }.bind(this),
    };
  }

  private buildViewGroups(nodes: LuigiNode[]) {
    const viewGroups: any = {};
    nodes.forEach((node) => {
      if (node.viewGroup && node._dxpPreloadUrl) {
        viewGroups[node.viewGroup] = {
          preloadUrl: node._dxpPreloadUrl,
          requiredIFramePermissions:
            node._requiredIFramePermissionsForViewGroup,
        };
      }
    });

    return viewGroups;
  }
  
  async nodesFn(
    childrenByEntity: Record<string, LuigiNode[]>,
    portalConfig: PortalConfig,
    envConfig?: ClientEnvironment
  ) {
    let globalNodes = [
      ...(childrenByEntity['global'] || []),
      ...(childrenByEntity['global.bottom'] || []),
      // this.createNotificationIndicatorNode(),
      // this.createHelpCenterNode(),
      ...(childrenByEntity['global.topnav'] || []),
    ];

    // globalNodes.forEach((node) => {
    //   if (!node.hideFromNav && node.entityType !== 'global.topnav') {
    //     node.globalNav = node.entityType === 'global.bottom' ? 'bottom' : true;
    //   }
    // });

    globalNodes.forEach((node) => {
      this.applyEntityChildrenRecursively(
        node,
        childrenByEntity,
        '',
        envConfig,
        portalConfig
      );
    });

    // removed due to temporary switch to other feedback service
    //this.addQualtricsFeedback(globalNodes, envConfig);

    // const creationDropdownNodes = await this.createCreationDropdown();

    // if (creationDropdownNodes) {
    //   globalNodes = globalNodes.concat(creationDropdownNodes);
    // }

    // globalNodes.sort(this.nodeSortingService.nodeComparison);

    

    globalNodes.push({
      pathSegment: 'error',
      label: 'Content not found',
      hideFromNav: true,
      children: [
        {
          pathSegment: ':id',
          hideSideNav: true,
          viewUrl: '/error-handling#:id',
          context: { id: ':id' },
          loadingIndicator: { enabled: false },
          showBreadcrumbs: false,
        },
      ],
    });

    return globalNodes;
  }

  applyEntityChildrenRecursively(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    parentEntityPath: string | undefined,
    envConfig: ClientEnvironment | undefined,
    portalConfig: PortalConfig
  ) {
    if (Array.isArray(node.children)) {
      this.nodeSortingService.markEntityRootChildren(node.children);
      node._portalDirectChildren = node.children;
    }
    const directChildren = node._portalDirectChildren || [];
    let newEntityPath = parentEntityPath;
    if (node.defineEntity) {
      if (parentEntityPath && parentEntityPath.length > 0) {
        newEntityPath = parentEntityPath + '.' + node.defineEntity.id;
      } else {
        newEntityPath = node.defineEntity.id;
      }

      node.children = (ctx: any) => {
        const ecp = this.entityChildrenProvider(
          node,
          ctx,
          childrenByEntity,
          envConfig,
          portalConfig,
          directChildren,
          newEntityPath
        );
        return ecp;
      };

      if (node.compound) {
        if (!node.compound._staticChildren) {
          node.compound._staticChildren = node.compound.children || [];
        }
        const additionalChildren =
          childrenByEntity[newEntityPath + '::compound'] || [];
        let children = [
          ...node.compound._staticChildren,
          ...additionalChildren,
        ].sort(this.nodeSortingService.nodeComparison);

        Object.defineProperty(node.compound, 'children', {
          set: (newValue) => (children = newValue),
          get: () =>
            children.filter((child) =>
              this.visibleForContext(node.context, child)
            ),
        });
      }
    } else {
      directChildren.forEach((child) => {
        this.applyEntityChildrenRecursively(
          child,
          childrenByEntity,
          newEntityPath,
          envConfig,
          portalConfig
        );
      });
      node.children = (ctx: any) =>
        directChildren
          .filter((child) => this.visibleForContext(ctx, child));
          // .map((child) =>
          //   this.nodeAccessHandlingService.nodeAccessHandling(
          //     ctx,
          //     child,
          //     portalConfig,
          //     envConfig
          //   )
          // );
    }

    if (node.virtualTree) {
      node.children = undefined;
    }
  }

  private visibleForContext(ctx: any, node: LuigiNode): boolean {
    // visibleForEntityContext is deprecated
    // if (!isMatch(ctx.entityContext, node.visibleForEntityContext)) {
    //   return false;
    // }

    // return matchesJMESPath(ctx, node.visibleForContext);
    return true;
  }

  entityChildrenProvider(
    entityNode: LuigiNode,
    ctx: any,
    childrenByEntity: Record<string, LuigiNode[]>,
    envConfig: ClientEnvironment | undefined,
    portalConfig: PortalConfig,
    directChildren?: LuigiNode[],
    entityPath?: string
  ) {
    const createChildrenList = (
      children: LuigiNode[],
      staticChildren?: LuigiNode[]
    ) => {
      const entityRootChildren = staticChildren ? [] : children;
      let mergedChildrenByEntity = childrenByEntity;
      if (staticChildren) {
        const entityChildrenByEntity: Record<string, LuigiNode[]> = {};

        children?.forEach((child) => {
          if (
            child.entityType === entityPath ||
            child.entityType === 'ERROR_NOT_FOUND' ||
            staticChildren.includes(child)
          ) {
            entityRootChildren.push(child);
          } else if (child.entityType) {
            if (!entityChildrenByEntity[child.entityType]) {
              entityChildrenByEntity[child.entityType] = [];
            }
            entityChildrenByEntity[child.entityType].push(child);
          } else {
            console.warn('Ignored entity child, no entity type defined', child);
          }
        });
        mergedChildrenByEntity = { ...childrenByEntity };
        Object.keys(entityChildrenByEntity).forEach((key) => {
          const existingNodes = mergedChildrenByEntity[key];
          mergedChildrenByEntity[key] = existingNodes
            ? [...existingNodes, ...entityChildrenByEntity[key]]
            : entityChildrenByEntity[key];
        });
      }

      entityRootChildren.forEach((child) => {
        this.applyEntityChildrenRecursively(
          child,
          mergedChildrenByEntity,
          entityPath,
          envConfig,
          portalConfig
        );
      });
      return this.buildChildrenForEntity(
        entityNode,
        entityRootChildren,
        ctx,
        portalConfig,
        envConfig
      );
    };

    return new Promise<LuigiNode[]>(async (resolve, reject) => {
      const entityTypeId = entityPath || entityNode?.defineEntity?.id;
      const entityIdContextKey = entityNode?.defineEntity?.contextKey;
      if (!entityTypeId) {
        console.warn('No entity node!'); //TODO: check if needed or assured before
        resolve(createChildrenList(directChildren || []));
      } else {
        const entityId = entityIdContextKey ? ctx[entityIdContextKey] : undefined;
        const staticChildren = [
          ...(directChildren || []),
          ...(childrenByEntity[entityTypeId] || []),
        ];

        if (entityId && entityNode?.defineEntity?.dynamicFetchId) {
          const fetchContext = await this.computeFetchContext(entityNode, ctx);
          const dynamicFetchId = entityNode.defineEntity.dynamicFetchId;
          this.luigiNodesService
            .retrieveAndMergeEntityChildren(
              entityNode.defineEntity,
              staticChildren,
              entityPath,
              fetchContext.get(dynamicFetchId)
            )
            .then((children) => {
              resolve(createChildrenList(children, staticChildren));
            })
            .catch((error) => {
              resolve(createChildrenList(staticChildren));
            });
        } else {
          const childrenList = await createChildrenList(staticChildren);
          // console.info(`children list ${childrenList.length}`);
          resolve(
            this.luigiNodesService.replaceServerNodesWithLocalOnes(
              childrenList,
              entityPath ? [entityPath] : []
            )
          );
        }
      }
    });
  }


  async computeFetchContext(
    entityNode: LuigiNode,
    ctx: any
  ): Promise<Map<string, Record<string, string>>> {
    const contextForEntityConfig: Map<
      string,
      Record<string, string>
    > = new Map();

    function addToAll(key: string, value: string) {
      contextForEntityConfig.forEach((record) => {
        record[key] = value;
      });
    }

    let node = entityNode as any;
    while (node) {
      if (node.defineEntity?.contextKey && node.defineEntity?.dynamicFetchId) {
        contextForEntityConfig.set(node.defineEntity.dynamicFetchId, {});
        addToAll(
          node.defineEntity.dynamicFetchId,
          ctx[node.defineEntity.contextKey]
        );
      }
      node = node.parent;
    }

    addToAll('tenant', ctx.tenantid);
    addToAll('user', ctx.userid);

    return contextForEntityConfig;
  }

  async buildChildrenForEntity(
    entityNode: LuigiNode,
    children: LuigiNode[],
    ctx: any,
    portalConfig: PortalConfig,
    envConfig: ClientEnvironment | undefined
  ): Promise<LuigiNode[]> {
    if (entityNode.defineEntity?.useBack) {
      if (
        ((globalThis as any).Luigi as any)?.featureToggles()
          .getActiveFeatureToggleList()
          ?.includes('navheader-up') &&
        entityNode.navHeader
      ) {
        entityNode.navHeader.showUpLink = true;
      }
    }

    if (!children) {
      return [];
    }

    const entityContext = {};

    const fetchContext = await this.computeFetchContext(entityNode, ctx);
    await Promise.all(
      Array.from(fetchContext.entries()).map(
        async ([dynamicFetchId, context]) => {
          try {
            (entityContext as any)[dynamicFetchId] = (
              await this.configService.getEntityConfig(dynamicFetchId, context)
            ).entityContext;
          } catch (error) {
            console.error(
              entityNode.defineEntity?.id,
              'does not exist',
              context
            );
          }
        }
      )
    );

    children.forEach((child) => {
      child.context = child.context || {};
      child.context.entityContext = entityContext;
      // child.onNodeActivation = this.retrieveHelpContext();
    });
    return this.nodeSortingService.sortNodes(
      children
        .filter((child) => this.visibleForContext(child.context, child))
        // .map((child) =>
        //   this.nodeAccessHandlingService.nodeAccessHandling(
        //     child.context,
        //     child,
        //     portalConfig,
        //     envConfig
        //   )
        // )
    );
  }

  private getLifecycleHooksConfig(envConfig: ClientEnvironment) {
    return {
      luigiAfterInit: async () => {
        // this.i18nService.afterInit();

        let childrenByEntity: Record<string, LuigiNode[]> = {};

        try {
          childrenByEntity =
            await this.luigiNodesService.retrieveChildrenByEntity();
        } catch (e) {
          console.error(`Error retrieving Luigi navigation nodes ${e}`);
          // this.openErrorDialog();
        }

        const config = this.luigiCoreService.getConfig();
        config.navigation = await this.getNavigationConfig(
          childrenByEntity,
          envConfig
        );
        
        config.lifecycleHooks = {};
        config.routing = this.getRoutingConfig();
        this.luigiCoreService.ux().hideAppLoadingIndicator();
        // childrenByEntity['global']?.forEach((node) => {
        //   if (node.pathSegment === 'search') {
        //     config.globalSearch = this.getGlobalSearchConfig();
        //   }
        // });
        const logo = this.luigiCoreService.isFeatureToggleActive('mfp-logo') ? 
          'assets/mfp_mark.svg' : 'assets/ora-mark.svg';
        config.settings.header.logo = logo;
        config.settings.header.favicon = logo;
        this.luigiCoreService.setConfig(config);
      },
    };
  }

  private getRoutingConfig() {  
    return {
      useHashRouting: false,
      showModalPathInUrl: true,
      modalPathParam: 'modal',
      pageNotFoundHandler: (notFoundPath: any, isAnyPathMatched: any) => {
        return {
          redirectTo: 'error/404',
          keepURL: true,
        };
      },
    };
  }
}
