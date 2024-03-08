import { Injectable } from '@angular/core';
import { ServiceProviderService } from '../frameConfig/serviceProvider.service';
// import { merge } from 'lodash';
import { HttpErrorResponse } from '@angular/common/http';
import { EntityDefinition, LuigiNode, ServiceProvider } from '../../../../../../../backend/libs/portal-lib/src/luigiNode';

@Injectable({
  providedIn: 'root',
})
export class LuigiNodesService {
  private serviceProviderService: ServiceProviderService;
  // private localCdmService: LocalCdmService;

  constructor(
    serviceProviderService: ServiceProviderService,
    // localCdmService: LocalCdmService
  ) {
    this.serviceProviderService = serviceProviderService;
    // this.localCdmService = localCdmService;
  }

  private static localNodeMatchesServerNode(
    localNode: LuigiNode,
    node: LuigiNode
  ): boolean {
    return (
      localNode.pathSegment === node.pathSegment &&
      localNode.entityType === node.entityType
    );
  }

  getChildrenByEntity(allChildren: LuigiNode[]): Record<string, LuigiNode[]> {
    const childrenByEntity: any = {
      home: [],
    };
    for (const child of allChildren) {
      // default to home to stay backward compatible
      const entityType = child.entityType || 'home';

      if (!childrenByEntity[entityType]) {
        childrenByEntity[entityType] = [];
      }

      childrenByEntity[entityType].push(child);
    }

    return childrenByEntity;
  }

  async retrieveChildrenByEntity(): Promise<Record<string, LuigiNode[]>> {
    const rawNodes = await this.retrieveAndMergeNodes();
    return this.getChildrenByEntity(rawNodes);
  }

  async retrieveAndMergeEntityChildren(
    entityDefinition: EntityDefinition,
    existingChildren: LuigiNode[],
    parentEntityPath: string | undefined,
    additionalContext?: Record<string, string>
  ): Promise<LuigiNode[]> {
    let errorCode = 0;
    const entityType = entityDefinition.dynamicFetchId;
    const configsForEntity = this.serviceProviderService
      .getRawConfigsForEntity(entityType || '', additionalContext)
      .catch((e) => {
        if (e instanceof HttpErrorResponse && e.status === 404) {
          errorCode = 404;
        } else {
          console.warn(
            'Could not retrieve nodes for entity ' + entityType + ', error: ',
            e
          );
        }
        return [];
      });

    const rawEntityNodes = await this.changeNodesWithLocalNodes(
      configsForEntity,
      parentEntityPath ? [parentEntityPath] : []
    );

    if (errorCode > 0) {
      return this.createErrorNodes(
        entityDefinition,
        additionalContext || {},
        errorCode
      );
    }

    const allEntityNodes = [
      ...(existingChildren || []),
      ...(rawEntityNodes || []),
    ];
    return allEntityNodes;
  }

  createErrorNodes(
    entityDefinition: EntityDefinition,
    additionalContext: Record<string, string>,
    errorCode: number
  ): LuigiNode[] {
    const errorNode = {
      pathSegment: ':notfound',
      entityType: 'ERROR_NOT_FOUND',
      hideFromNav: true,
      hideSideNav: true,
      viewUrl: `/error-handling#entity_${errorCode}`,
      context: {
        error: {
          entityDefinition,
          additionalContext,
        },
      },
      isolateView: true,
      loadingIndicator: { enabled: false },
      showBreadcrumbs: false,
      virtualTree: true,
    };
    return [
      {
        ...errorNode,
        ...{ pathSegment: 'error' },
      },
      errorNode,
    ];
  }

  nodePolicyResolver(nodeToCheckPermissionFor: LuigiNode): boolean {
    const mockPermissions = ['projectMember'];
    const permissions = nodeToCheckPermissionFor.requiredPolicies;
    return (
      !permissions ||
      permissions.every((cdmItem) => mockPermissions.includes(cdmItem))
    );
  }

  clearNodeCache(): void {
    this.serviceProviderService.clearCache();
  }

  private async retrieveAndMergeNodes(): Promise<LuigiNode[]> {
    const rawConfigsPromise = this.serviceProviderService
      .getRawConfigsForTenant()
      .catch((e) => {
        console.warn('Could not retrieve tenant nodes, error: ', e);
        throw e;
      });
    return this.changeNodesWithLocalNodes(rawConfigsPromise, [
      'global',
      'home',
    ]);
  }

  private async changeNodesWithLocalNodes(
    rawConfigsPromise: Promise<ServiceProvider[]>,
    currentEntities: string[]
  ): Promise<LuigiNode[]> {
    const serverLuigiNodes = this.extractServerLuigiNodes(
      await rawConfigsPromise
    );

    return this.replaceServerNodesWithLocalOnes(
      serverLuigiNodes,
      currentEntities
    );
  }

  public async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]> {
    // console.info(
    //   `Processing local nodes for the entities ${currentEntities.join(',')}`
    // );
    const localNodes: any = [];//await this.localCdmService.getLocalNodes();

    if (localNodes.length == 0) {
      return serverLuigiNodes;
    }

    const localLuigiNodes = this.extendContextOfLocalNodes(
      localNodes,
      serverLuigiNodes
    );

    console.info(
      `Found '${serverLuigiNodes.length}' server nodes. Found '${
        localLuigiNodes.length
      }' local luigi nodes. The entities of the server node are:${[
        ...new Set(
          serverLuigiNodes.map((n) =>
            this.stripCompoundFromEntity(n.entityType)
          )
        ),
      ].join(',')}
      The entities of local nodes are: ${[
        ...new Set(
          localLuigiNodes.map((n) => this.stripCompoundFromEntity(n.entityType))
        ),
      ].join(',')}`
    );

    const filteredServerNodes = serverLuigiNodes.filter(
      (node) =>
        !localLuigiNodes.some((localNode) =>
          LuigiNodesService.localNodeMatchesServerNode(localNode, node)
        )
    );

    console.info(
      `${filteredServerNodes.length} server nodes have no matching local nodes`
    );

    const nodesToAdd = localLuigiNodes.filter((n) => {
      let entity = this.stripCompoundFromEntity(n.entityType);
      entity = entity || 'home';
      return currentEntities.includes(entity);
    });

    if (!nodesToAdd.length) {
      console.info(
        `Found no local nodes for the entities: ${currentEntities.join(',')}`
      );
      return filteredServerNodes;
    }

    console.info(
      `Added ${
        nodesToAdd.length
      } local nodes to the luigi config for ${currentEntities.join(',')}`
    );
    return filteredServerNodes.concat(nodesToAdd);
  }

  private stripCompoundFromEntity(entity: string | undefined): string | undefined {
    if (!entity) {
      return entity;
    }

    // also strip the first segemnt of the entity, to get the actual entity.
    // then strip ::.* for the root compound views
    return entity.replace(/\..*::.*/, '').replace(/::.*/, '');
  }

  private isRecentServiceProvider(serviceProvider: ServiceProvider): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return !(
      new Date(serviceProvider.creationTimestamp).getTime() <
      yesterday.getTime()
    );
  }

  private extractServerLuigiNodes(
    serviceProviders: ServiceProvider[]
  ): LuigiNode[] {
    let serverLuigiNodes: LuigiNode[] = [];
    serviceProviders.forEach((serviceProvider) => {
      const isRecentServiceProvider =
        this.isRecentServiceProvider(serviceProvider);
      serviceProvider.nodes.forEach((node) => {
        if (isRecentServiceProvider) {
          node.statusBadge = { label: 'New', type: 'informative' };
        }
        node.context = node.context || {};
        node.context.serviceProviderConfig = {
          ...serviceProvider.config,
          ...serviceProvider.installationData,
        };
      });
      serverLuigiNodes = serverLuigiNodes.concat(serviceProvider.nodes);
    });
    return serverLuigiNodes;
  }

  private extendContextOfLocalNodes(
    localLuigiNodes: LuigiNode[],
    serverLuigiNodes: LuigiNode[]
  ): LuigiNode[] {
    localLuigiNodes.forEach((localNode) => {
      const matchingServerNode = serverLuigiNodes.find((serverNode) =>
        LuigiNodesService.localNodeMatchesServerNode(localNode, serverNode)
      );
      // if (matchingServerNode && matchingServerNode.context) {
      //   localNode.context = merge(
      //     {},
      //     matchingServerNode.context,
      //     localNode.context
      //   );
      // }
    });
    return localLuigiNodes;
  }
}
