/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ClientEnvironment,
  EntityDefinition,
  FrameConfig,
  LuigiNode,
  ServiceProvider,
} from '@jukebox/common';
import { mock } from 'jest-mock-extended';
import { AuthService } from '../auth.service';
import { ServiceProviderService } from '../frameConfig/serviceProvider.service';
import { EnvConfigService } from '../env-config.service';
import { LuigiconfigService } from './luigiconfig.service';
import { LuigiCoreService } from '../luigiCore.service';
import { LuigiNodesService } from '../luigiNodes/luigi-nodes.service';
import { LuigiUserSettingsService } from '../luigiNodes/luigi-usersettings.service';
import { GithubAuthService } from './github-auth.service';
import { ConfigService } from '../frameConfig/config.service';
import { I18nService } from '../i18n.service';
import { DevModeSettingsService } from '../luigiNodes/devMode/dev-mode-settings-service';
import { MockModule, MockProvider } from 'ng-mocks';
import { AlertHandlerService } from '../alert-handler.service';
import { ApolloModule } from 'apollo-angular';
import { Subject } from 'rxjs';
import { DxpCustomMessageListeners } from './custom-message-listeners/dxp-custom-message-listeners';

describe('LuigiconfigService', () => {
  let service: LuigiconfigService;
  let luigiNodesService: LuigiNodesService;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
  let envConfigService: EnvConfigService;
  let authService: AuthService;
  let serviceProviderService: ServiceProviderService;
  let i18nService: I18nService;
  let changedSubject: Subject<void>;
  const entityName = 'myentity';

  let setConfigSpy: jest.SpyInstance;
  const homeChildren: LuigiNode[] = [
    {
      label: 'home1',
      pathSegment: '',
      viewUrl: '',
    },
  ];
  const projectChildren: LuigiNode[] = [
    {
      label: 'project1',
      pathSegment: '',
      viewUrl: '',
    },
  ];

  beforeEach(() => {
    changedSubject = new Subject<void>();
    TestBed.configureTestingModule({
      providers: [
        LuigiconfigService,
        LuigiNodesService,
        LuigiUserSettingsService,
        DevModeSettingsService,
        MockProvider(DxpCustomMessageListeners, {
          changed: changedSubject,
        }),
        EnvConfigService,
        MockProvider(AlertHandlerService),
      ],
      imports: [
        RouterTestingModule.withRoutes([], {}),
        HttpClientTestingModule,
        MockModule(ApolloModule),
      ],
    }).compileComponents();
  });
  beforeEach(() => {
    service = TestBed.inject(LuigiconfigService);
    luigiNodesService = TestBed.inject(LuigiNodesService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    envConfigService = TestBed.inject(EnvConfigService);
    authService = TestBed.inject(AuthService);
    serviceProviderService = TestBed.inject(ServiceProviderService);
    configService = TestBed.inject(ConfigService);
    i18nService = TestBed.inject(I18nService);

    const githubAuthService = TestBed.inject(GithubAuthService);
    const serviceProviders: ServiceProvider[] = [
      { nodes: [], config: {}, creationTimestamp: '' },
    ];
    luigiCoreService.isFeatureToggleActive = jest.fn().mockReturnValue(true);

    jest
      .spyOn(serviceProviderService, 'getRawConfigsForTenant')
      .mockResolvedValue(serviceProviders);

    const entityConfig = { providers: [], entityContext: {} };
    jest
      .spyOn(configService, 'getEntityConfig')
      .mockResolvedValue(entityConfig);

    jest
      .spyOn(githubAuthService, 'executeGithubAuthFlowIfRequired')
      .mockReturnValue(Promise.resolve());
    setConfigSpy = jest.spyOn(luigiCoreService, 'setConfig');
    setConfigSpy.mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  /** Test disabled since qualtrics feedback temporarily disabled */
  // it('should create a feedback node', async () => {
  //   const clientEnvironment: ClientEnvironment = mock<ClientEnvironment>();
  //   clientEnvironment.qualtricsSiteInterceptUrl =
  //     'http://mockUrl.com?Q_ZID=mock';
  //   clientEnvironment.qualtricsId = 'mockId';
  //   jest
  //     .spyOn(envConfigService, 'getEnvConfig')
  //     .mockResolvedValue(clientEnvironment);
  //   jest
  //     .spyOn(luigiNodesService, 'retrieveChildrenByEntity')
  //     .mockResolvedValue({
  //       home: [mock<LuigiNode>()],
  //       project: [mock<LuigiNode>()],
  //     });

  //   const nodes = service.nodesFn(
  //     await luigiNodesService.retrieveChildrenByEntity(),
  //     clientEnvironment,
  //   );
  //   expect(nodes.length).toBe(1);
  //   expect(nodes[0].pathSegment).toBe('feedback');
  //   expect(nodes[0].viewUrl).toBe('none');
  //   expect(nodes[0].icon).toBe('feedback');
  // });

  describe('Tests which need service setup', () => {
    const luigiCoreConfig = {
      navigation: { viewGroupSettings: {} },
    };

    beforeEach(async () => {
      jest
        .spyOn(luigiNodesService, 'retrieveChildrenByEntity')
        .mockResolvedValue({
          home: [
            {
              label: 'foo',
              viewGroup: 'abc',
              _dxpPreloadUrl: 'preload',
              _requiredIFramePermissionsForViewGroup: {
                allow: ['allow'],
              },
            },
          ],
          project: [],
        });

      const envConfig = mock<ClientEnvironment>();
      const frameConfig = mock<FrameConfig>({
        frameContext: {
          extensionManagerMissingMandatoryDataUrl:
            '/missing-mandatory-data/:extClassName',
        },
      });
      jest
        .spyOn(authService, 'getGithubAuthDataForDomain')
        .mockReturnValue({ access_token: 'token' });
      jest.spyOn(envConfigService, 'getEnvConfig').mockResolvedValue(envConfig);
      jest
        .spyOn(configService, 'getFrameConfig')
        .mockResolvedValue(frameConfig);
      jest.spyOn(i18nService, 'afterInit').mockImplementation(() => {});

      jest
        .spyOn(luigiCoreService, 'getConfig')
        .mockReturnValue(luigiCoreConfig);
      jest
        .spyOn(luigiCoreService, 'setFeatureToggle')
        .mockImplementation(() => {});
      jest.spyOn(luigiCoreService, 'ux').mockReturnValue({
        hideAppLoadingIndicator: () => {},
      });
      jest.spyOn(luigiCoreService, 'auth').mockReturnValue({
        store: {
          setAuthData: () => {},
        },
      });

      // Act
      await service.setLuigiConfiguration();
      const setConfigArguments = setConfigSpy.mock.calls[0][0];
      await setConfigArguments.lifecycleHooks.luigiAfterInit();
    });

    it('should create the view groups correctly', async () => {
      // Assert
      expect(luigiCoreConfig.navigation.viewGroupSettings).toEqual({
        abc: {
          preloadUrl: 'preload',
          requiredIFramePermissions: {
            allow: ['allow'],
          },
        },
      });
    });
  });

  it('should return a promise resolving entity nodes', async () => {
    // Arrange
    const retrieveAndMergeEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
      .mockResolvedValue([]);

    const tenantid = 'myTenant';
    const myentityId = 'someid';
    const userid = 'user';
    const entityNode: LuigiNode = {
      defineEntity: {
        id: entityName,
        dynamicFetchId: entityName,
        contextKey: 'myentityId',
      },
    };

    const childrenByEntity = {
      home: homeChildren,
      myentity: projectChildren,
    };

    // Act
    await service.entityChildrenProvider(
      entityNode,
      { myentityId, tenantid, userid },
      childrenByEntity,
      undefined,
      undefined,
      undefined,
      entityName
    );

    // Assert
    expect(retrieveAndMergeEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'myentityId',
        dynamicFetchId: entityName,
        id: entityName,
      },
      childrenByEntity.myentity,
      entityName,
      { tenant: tenantid, myentity: myentityId, user: userid }
    );
  });

  it('should add parent entity ids to fetch context', async () => {
    // Arrange
    const retrieveAndMergeEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
      .mockResolvedValue([]);

    const tenantid = 'myTenant';
    const userid = 'user';

    const entityNode: LuigiNode = {
      defineEntity: {
        id: 'mysubentity',
        dynamicFetchId: 'mysubentity',
        contextKey: 'mysubentityId',
      },
    };
    (entityNode as any).parent = {
      defineEntity: {
        id: 'myparententity',
        dynamicFetchId: 'myparententity',
        contextKey: 'myparententityId',
      },
      parent: {
        defineEntity: {
          id: 'mygrandparententity',
          dynamicFetchId: 'mygrandparententity',
          contextKey: 'mygrandparententityId',
        },
      },
    };

    // Act
    await service.entityChildrenProvider(
      entityNode,
      {
        mysubentityId: 'someid',
        myparententityId: 'parentid',
        mygrandparententityId: 'opa',
        tenantid,
        userid,
      },
      {},
      undefined,
      undefined,
      undefined,
      entityName
    );

    // Assert
    expect(retrieveAndMergeEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'mysubentityId',
        dynamicFetchId: 'mysubentity',
        id: 'mysubentity',
      },
      [],
      entityName,
      {
        myparententity: 'parentid',
        mygrandparententity: 'opa',
        mysubentity: 'someid',
        user: userid,
        tenant: tenantid,
      }
    );
  });

  describe('entity children', () => {
    beforeEach(() => {
      jest
        .spyOn(luigiNodesService, 'replaceServerNodesWithLocalOnes')
        .mockImplementation((nodes: LuigiNode[], entities: string[]) => {
          return Promise.resolve(nodes);
        });
    });

    it('should apply entity children recursively', async () => {
      // Arrange
      const subsubchildren: Record<string, LuigiNode[]> = {
        someId: [
          {
            pathSegment: 'subsub',
            entityType: 'myentity.subentity.subsub',
          },
        ],
        someOtherId: [
          {
            pathSegment: 'othersubsub',
            entityType: 'myentity.subentity.subsub',
          },
        ],
      };

      jest
        .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
        .mockImplementation(
          (
            _entityDefinition: EntityDefinition,
            _existingChildren: LuigiNode[],
            parentEntityPath: string,
            additionalContext: Record<string, string>
          ) => {
            return Promise.resolve(
              subsubchildren[additionalContext.subsub] || []
            );
          }
        );

      const childrenByEntity = {
        home: homeChildren,
        myentity: projectChildren,
        'myentity.subentity': [
          {
            pathSegment: 'subentityextension',
            defineEntity: {
              id: 'subsub',
              dynamicFetchId: 'subsub',
              contextKey: 'id',
            },
          },
        ],
      };

      const rootNode: LuigiNode = {
        pathSegment: 'random',
        children: [
          {
            pathSegment: 'random',
            defineEntity: {
              id: entityName,
            },
            children: [
              {
                pathSegment: 'directChild1',
                children: [
                  {
                    pathSegment: 'subentity',
                    defineEntity: {
                      id: 'subentity',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // Act
      service.applyEntityChildrenRecursively(
        rootNode,
        childrenByEntity,
        '',
        undefined,
        undefined
      );

      // Assert
      expect(Array.isArray(rootNode.children)).toBeFalsy();
      // @ts-ignore
      expect(Array.isArray(rootNode.children({}).children)).toBeFalsy();
      // @ts-ignore
      const entityChildren = await rootNode.children({})[0].children({});
      expect(entityChildren.length).toBe(projectChildren.length + 1);
      expect(entityChildren[0].pathSegment).toEqual('directChild1');
      const subEntityChildren = await entityChildren[0]
        .children({})[0]
        .children({});
      expect(subEntityChildren[0].pathSegment).toEqual('subentityextension');
      const subsubChildren = await subEntityChildren[0].children({
        id: 'someId',
      });
      expect(subsubChildren[0].pathSegment).toEqual('subsub');
      const subsubChildren2 = await subEntityChildren[0].children({
        id: 'someOtherId',
      });
      expect(subsubChildren2[0].pathSegment).toEqual('othersubsub');
      const subsubChildren3 = await subEntityChildren[0].children({
        id: 'idwithoutchildren',
      });
      expect(subsubChildren3.length).toEqual(0);
    });

    it('should filter children based on entity context', async () => {
      const rootNode: LuigiNode = {
        pathSegment: 'random',
        defineEntity: {
          id: entityName,
          contextKey: entityName,
          dynamicFetchId: entityName,
        },
        children: [
          {
            pathSegment: 'directChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
            children: [
              {
                pathSegment: 'grandChild1',
                visibleForEntityContext: {
                  myentity: {
                    foo: 'bar2',
                  },
                },
              },
            ],
          },
          {
            pathSegment: 'directChild2',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar2',
              },
            },
          },
        ],
      };

      const childrenByEntity = {
        myentity: [
          {
            pathSegment: 'entityChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
          },
        ],
      };

      jest.spyOn(configService, 'getEntityConfig').mockResolvedValue({
        providers: [],
        entityContext: { foo: 'bar1' },
      });

      service.applyEntityChildrenRecursively(
        rootNode,
        childrenByEntity,
        '',
        undefined,
        undefined
      );

      // @ts-ignore
      const rootChildren = await rootNode.children({});
      expect(rootChildren).toMatchObject([
        { pathSegment: 'directChild1' },
        { pathSegment: 'entityChild1' },
      ]);
      expect(await rootChildren[0].children({})).toEqual([]);
    });

    it('should filter children based on context', async () => {
      const rootNode: LuigiNode = {
        pathSegment: 'random',
        defineEntity: {
          id: entityName,
          contextKey: entityName,
          dynamicFetchId: entityName,
        },
        children: [
          {
            pathSegment: 'directChild1',
            visibleForContext: 'entityContext.myentity.foo == `bar1`',
            children: [
              {
                pathSegment: 'grandChild1',
                visibleForContext: 'entityContext.myentity.foo == `bar2`',
              },
            ],
          },
          {
            pathSegment: 'directChild2',
            visibleForContext: 'entityContext.myentity.foo == `bar2`',
          },
        ],
      };

      const childrenByEntity = {
        myentity: [
          {
            pathSegment: 'entityChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
          },
        ],
      };

      jest.spyOn(configService, 'getEntityConfig').mockResolvedValue({
        providers: [],
        entityContext: { foo: 'bar1' },
      });

      service.applyEntityChildrenRecursively(
        rootNode,
        childrenByEntity,
        '',
        undefined,
        undefined
      );

      // @ts-ignore
      const rootChildren = await rootNode.children({});
      expect(rootChildren).toMatchObject([
        { pathSegment: 'directChild1' },
        { pathSegment: 'entityChild1' },
      ]);
      expect(await rootChildren[0].children({})).toEqual([]);
    });
  });
  it('should update github token on  messageListeners change', fakeAsync(() => {
    envConfigService.getEnvConfig = jest.fn();
    luigiCoreService.configChanged = jest.fn();
    luigiCoreService.getConfig = jest.fn().mockReturnValue({
      navigation: {
        nodes: [],
      },
    });
    authService.getGithubAuthDataForDomain = jest.fn();

    changedSubject.next();
    tick();

    expect(envConfigService.getEnvConfig).toHaveBeenCalled();
    expect(luigiCoreService.configChanged).toHaveBeenCalled();
    expect(luigiCoreService.getConfig).toHaveBeenCalled();
    expect(authService.getGithubAuthDataForDomain).toHaveBeenCalledWith(
      'github.tools.sap'
    );
    expect(authService.getGithubAuthDataForDomain).toHaveBeenCalledWith(
      'ro.github.com'
    );
    expect(authService.getGithubAuthDataForDomain).toHaveBeenCalledWith(
      'github.com'
    );
    expect(authService.getGithubAuthDataForDomain).toHaveBeenCalledWith(
      'github.wdf.sap.corp'
    );
  }));
});
