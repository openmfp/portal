import { ContentConfiguration } from '@openmfp/portal-server-lib/dist/config/model/configuration';

export const s1: ContentConfiguration = {
  name: 'overview',
  creationTimestamp: '',
  luigiConfigFragment: [
    {
      data: {
        nodes: [
          {
            entityType: 'global',
            pathSegment: 'home',
            label: 'Overview',
            icon: 'home',
            hideFromNav: true,
            defineEntity: {
              id: 'example',
            },
            children: [
              {
                pathSegment: 'overview',
                label: 'Overview',
                icon: 'home',
                url: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
                context: {
                  title: 'Welcome to OpenMFP Portal',
                  content: ' ',
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

export const s2: ContentConfiguration = {
  name: 'gardener',
  creationTimestamp: '2022-05-17T11:37:17Z',
  luigiConfigFragment: [
    {
      data: {
        nodes: [
          {
            entityType: 'example',
            pathSegment: 'gardener',
            label: 'Gardener Dashboard',
            virtualTree: true,
            url: 'https://d.ing.gardener-op.mfp-dev.shoot.canary.k8s-hana.ondemand.com',
            icon: 'https://d.ing.gardener-op.mfp-dev.shoot.canary.k8s-hana.ondemand.com/static/assets/logo.svg',
          },
        ],
      },
    },
  ],
};

export const s3: ContentConfiguration = {
  name: 'misc',
  creationTimestamp: '',
  luigiConfigFragment: [
    {
      data: {
        nodeDefaults: {
          entityType: 'example',
        },
        nodes: [
          {
            pathSegment: 'empty',
            label: 'Empty Page',
            category: {
              label: 'Fundamental Demo Pages',
              icon: 'dimension',
              collapsible: true,
            },
            loadingIndicator: {
              enabled: false,
            },
            url: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/empty-demo-page.html',
          },
          {
            pathSegment: 'table',
            label: 'Table',
            category: 'Fundamental Demo Pages',
            loadingIndicator: {
              enabled: false,
            },
            url: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/table-demo-page.html',
          },
          {
            pathSegment: 'tree',
            label: 'Tree',
            category: 'Fundamental Demo Pages',
            loadingIndicator: {
              enabled: false,
            },
            url: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/tree-demo-page.html',
          },
        ],
      },
    },
  ],
};
