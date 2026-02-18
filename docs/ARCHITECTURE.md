# Architecture

## Overview

The OpenMFP Portal is a web-based management interface for the OpenMFP platform. It provides a unified interface for accessing and managing various OpenMFP resources, services, and integrations through a micro-frontend architecture powered by Luigi Framework.

### Purpose

The portal serves as the central entry point for users to:
- Access and manage OpenMFP resources
- Navigate between different micro-frontends and services
- Interact with Kubernetes custom resources through a user-friendly interface
- Integrate with external services like Gardener Dashboard

### Technology Stack

**Frontend:**
- Angular 18 with standalone components
- Luigi Framework for micro-frontend orchestration
- @openmfp/portal-ui-lib for UI components
- TypeScript 5.5

**Backend:**
- NestJS 10 framework
- @openmfp/portal-server-lib for portal services
- Kubernetes client-node for CRD interaction
- Node.js 22+

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        UI[Angular Frontend<br/>Luigi Shell]
    end

    subgraph "Portal Backend"
        API[NestJS API Server<br/>Port 3000]
        SPService[Service Provider Service]
        EntityContext[Entity Context Provider]
        PortalContext[Portal Context Provider]
    end

    subgraph "Kubernetes Cluster"
        CRD[ContentConfiguration CRDs<br/>openmfp-system namespace]
        K8sAPI[Kubernetes API]
    end

    subgraph "External Services"
        Gardener[Gardener Dashboard]
        MicroFE[Micro-frontends]
    end

    UI -->|HTTP Requests /rest/**| API
    API --> SPService
    API --> EntityContext
    API --> PortalContext
    SPService -->|List ContentConfigurations| K8sAPI
    K8sAPI --> CRD
    UI -->|Embed iframes| MicroFE
    UI -->|Embed virtualTree| Gardener

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style CRD fill:#e8f5e9
    style Gardener fill:#f3e5f5
```

## Component Architecture

### Frontend Architecture

```mermaid
graph LR
    subgraph "Frontend Application"
        Main[main.ts<br/>Bootstrap]
        Portal[PortalComponent<br/>from portal-ui-lib]
        Luigi[Luigi Framework<br/>Micro-frontend Shell]
        Config[Portal Configuration]
    end

    subgraph "External Libraries"
        PUIL[@openmfp/portal-ui-lib]
        LuigiCore[@luigi-project/core]
        OAuth[@luigi-project/plugin-auth-oauth2]
    end

    Main -->|bootstrapApplication| Portal
    Main -->|providePortal| Config
    Portal --> Luigi
    Portal --> PUIL
    Luigi --> LuigiCore
    Luigi --> OAuth

    style Main fill:#e3f2fd
    style Portal fill:#f3e5f5
    style Luigi fill:#fff3e0
```

The frontend is minimal by design, delegating most functionality to the `@openmfp/portal-ui-lib` library. This library provides:
- The main `PortalComponent` that serves as the Luigi shell
- Navigation configuration
- Micro-frontend integration
- Authentication handling

### Backend Architecture

```mermaid
graph TB
    subgraph "NestJS Application"
        Main[main.ts<br/>Bootstrap]
        AppModule[AppModule]
        PortalModule[PortalModule<br/>from portal-server-lib]

        subgraph "Custom Providers"
            SPService[KubernetesServiceProvidersService]
            EntityProvider[AccountEntityContextProvider]
            ContextProvider[OpenmfpPortalProvider]
        end
    end

    subgraph "Kubernetes Integration"
        K8sClient[Kubernetes Client<br/>@kubernetes/client-node]
        CustomAPI[CustomObjectsApi]
    end

    subgraph "Portal Server Library"
        PSL[@openmfp/portal-server-lib]
        Interfaces[ServiceProviderService<br/>EntityContextProvider<br/>PortalContextProvider]
    end

    Main --> AppModule
    AppModule -->|imports| PortalModule
    AppModule -->|configures| SPService
    AppModule -->|configures| EntityProvider
    AppModule -->|configures| ContextProvider

    SPService -->|implements| Interfaces
    EntityProvider -->|implements| Interfaces
    ContextProvider -->|implements| Interfaces

    SPService --> K8sClient
    K8sClient --> CustomAPI

    PortalModule --> PSL

    style Main fill:#e8f5e9
    style AppModule fill:#fff3e0
    style SPService fill:#e1f5ff
    style K8sClient fill:#f3e5f5
```

## Key Workflows

### Service Provider Discovery Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant Backend as NestJS API
    participant K8s as Kubernetes API
    participant CRD as ContentConfiguration CRDs

    Client->>Backend: GET /rest/service-providers
    Backend->>K8s: listNamespacedCustomObject()
    Note over K8s: API Group: core.openmfp.io<br/>Version: v1alpha1<br/>Namespace: openmfp-system<br/>Resource: contentconfigurations
    K8s->>CRD: Query CRDs
    CRD-->>K8s: Return items[]
    K8s-->>Backend: Response with items
    Backend->>Backend: Filter items with status.configurationResult
    Backend->>Backend: Parse JSON configurations
    Backend-->>Client: Return serviceProviders array
    Client->>Client: Render navigation and micro-frontends
```

### Entity Context Resolution Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant Backend as NestJS API
    participant EntityProvider as AccountEntityContextProvider

    Client->>Backend: GET /rest/entity-context?entity=account
    Backend->>EntityProvider: getContextValues(token, context)
    EntityProvider->>EntityProvider: Extract account from context
    EntityProvider->>EntityProvider: Define policies array
    Note over EntityProvider: Policies: create, delete, get,<br/>list, update, watch,<br/>gardener_project_create, etc.
    EntityProvider-->>Backend: Return context values
    Backend-->>Client: Return { id, policies }
    Client->>Client: Apply policies to UI elements
```

### Content Configuration Loading

```mermaid
sequenceDiagram
    participant Portal as Luigi Portal Shell
    participant Backend as Backend API
    participant K8s as Kubernetes

    Portal->>Backend: Initialize - Request service providers
    Backend->>K8s: Fetch ContentConfiguration CRDs
    K8s-->>Backend: Return CRD items
    Backend->>Backend: Extract luigiConfigFragment from each CRD
    Note over Backend: Each CRD contains:<br/>- name<br/>- creationTimestamp<br/>- luigiConfigFragment.data.nodes[]
    Backend-->>Portal: Return content configurations
    Portal->>Portal: Merge Luigi config fragments
    Portal->>Portal: Build navigation tree
    Portal->>Portal: Register micro-frontend nodes
    Note over Portal: Nodes include:<br/>- pathSegment<br/>- label<br/>- icon<br/>- viewUrl or url<br/>- entityType<br/>- context
```

## Dependencies and Integrations

### Frontend Dependencies

**Core Framework:**
- **@angular/core (^18.0.0)**: Primary application framework
- **@angular/router (^18.0.0)**: Routing capabilities
- **rxjs (~7.8.0)**: Reactive programming library

**Portal Libraries:**
- **@openmfp/portal-ui-lib (^0.82.0)**: OpenMFP portal UI components and Luigi shell
- **@luigi-project/core (^2.18.1)**: Micro-frontend framework for navigation and composition
- **@luigi-project/plugin-auth-oauth2 (^2.18.1)**: OAuth2 authentication plugin

**Utilities:**
- **jwt-decode (^4.0.0)**: JWT token parsing
- **jmespath (0.16.0)**: JSON query language
- **lodash (4.17.21)**: JavaScript utility library

### Backend Dependencies

**Core Framework:**
- **@nestjs/core (^10.4.6)**: NestJS application framework
- **@nestjs/common (^10.4.6)**: Common NestJS utilities
- **@nestjs/platform-express (^10.4.6)**: Express platform adapter

**Portal Libraries:**
- **@openmfp/portal-server-lib (^0.93.0)**: OpenMFP portal server components and services

**Kubernetes Integration:**
- **@kubernetes/client-node (^0.22.0)**: Official Kubernetes client for Node.js
  - Used to interact with Kubernetes API
  - Reads ContentConfiguration custom resources
  - Loads kubeconfig from default locations

**HTTP and Utilities:**
- **@nestjs/axios (^3.0.1)**: HTTP client module
- **axios (^1.6.3)**: Promise-based HTTP client
- **cookie-parser (1.4.7)**: Cookie parsing middleware
- **dotenv (^16.4.5)**: Environment variable management

### External Service Integrations

**Gardener Dashboard:**
- Integrated as a virtual tree node in Luigi navigation
- Accessed via iframe embedding
- URL configured in ContentConfiguration CRDs
- Example: `https://d.ing.gardener-op.mfp-dev.shoot.canary.k8s-hana.ondemand.com`

**Luigi Fiddle Examples:**
- Demo micro-frontends for testing
- Hosted at `https://fiddle.luigi-project.io`
- Include table, tree, and empty page examples

### Kubernetes Custom Resources

**ContentConfiguration CRD:**
- **API Group**: `core.openmfp.io`
- **Version**: `v1alpha1`
- **Namespace**: `openmfp-system`
- **Purpose**: Dynamic configuration of portal content and navigation

**CRD Structure:**
```yaml
apiVersion: core.openmfp.io/v1alpha1
kind: ContentConfiguration
metadata:
  name: example-config
  namespace: openmfp-system
spec:
  # Specification details
status:
  configurationResult: |
    {
      "name": "example",
      "creationTimestamp": "2022-05-17T11:37:17Z",
      "luigiConfigFragment": {
        "data": {
          "nodes": [...]
        }
      }
    }
```

### Configuration Flow

```mermaid
graph LR
    subgraph "Configuration Sources"
        ENV[Environment Variables<br/>.env file]
        K8sCRD[Kubernetes CRDs<br/>ContentConfiguration]
    end

    subgraph "Backend Configuration"
        PortalOpts[PortalModuleOptions]
        ContextProv[OpenmfpPortalProvider]
    end

    subgraph "Frontend Configuration"
        PortalFEOpts[PortalOptions]
        LuigiConfig[Luigi Configuration]
    end

    ENV -->|CRD_GATEWAY_API_URL| ContextProv
    ContextProv --> PortalOpts
    K8sCRD -->|Dynamic content| PortalOpts

    PortalOpts -->|API response| PortalFEOpts
    PortalFEOpts --> LuigiConfig

    style ENV fill:#fff3e0
    style K8sCRD fill:#e8f5e9
    style PortalOpts fill:#e3f2fd
    style LuigiConfig fill:#f3e5f5
```

## Deployment Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Development Machine"
        FE[Angular Dev Server<br/>Port 4300]
        BE[NestJS Dev Server<br/>Port 3000]
        Proxy[Proxy Config<br/>/rest/** → :3000]
    end

    subgraph "Kubernetes Cluster"
        K8s[Kubernetes API<br/>via kubeconfig]
        NS[openmfp-system namespace]
    end

    FE -->|Proxied requests| Proxy
    Proxy --> BE
    BE --> K8s
    K8s --> NS

    style FE fill:#e3f2fd
    style BE fill:#fff3e0
    style K8s fill:#e8f5e9
```

**Development Setup:**
- Frontend runs on port 4300 with hot reload
- Backend runs on port 3000 with debug mode
- Proxy configuration forwards `/rest/**` from frontend to backend
- Backend connects to Kubernetes using default kubeconfig

### Production Deployment

```mermaid
graph TB
    subgraph "Docker Container"
        Node[Node.js Runtime<br/>Port 3000]
        Static[Serve Static<br/>Frontend Assets]
        API[NestJS API<br/>Backend Services]
    end

    subgraph "Kubernetes Cluster"
        Service[Portal Service]
        Pod[Portal Pod]
        CRD[ContentConfiguration CRDs]
    end

    Client[Client Browser] -->|HTTP| Service
    Service --> Pod
    Pod --> Node
    Node --> Static
    Node --> API
    API --> CRD

    style Client fill:#e1f5ff
    style Node fill:#fff3e0
    style Pod fill:#e8f5e9
```

**Production Deployment:**
- Multi-stage Docker build
- Frontend built to static assets in `frontend/dist`
- Backend built to JavaScript in `backend/dist`
- Single Node.js process serves both static frontend and API
- Alpine-based runtime image for minimal size
- Exposed on port 3000

### Docker Build Process

```mermaid
graph LR
    subgraph "Build Stage"
        Source[Source Code]
        NPM[npm install]
        Build[npm run build]
    end

    subgraph "Runtime Stage"
        Alpine[node:22.12-alpine]
        BackendDist[backend/dist]
        FrontendDist[frontend/dist]
    end

    Source --> NPM
    NPM --> Build
    Build --> BackendDist
    Build --> FrontendDist

    BackendDist --> Alpine
    FrontendDist --> Alpine

    style Build fill:#fff3e0
    style Alpine fill:#e8f5e9
```

## Security Considerations

### Authentication

- OAuth2 authentication via Luigi plugin (`@luigi-project/plugin-auth-oauth2`)
- JWT token handling via `jwt-decode`
- Tokens passed to backend for service provider requests
- Entity context resolution based on authenticated user

### Authorization

The `AccountEntityContextProvider` defines policies for authenticated users:
- **Resource operations**: create, delete, get, list, update, watch
- **Gardener operations**: gardener_project_create, gardener_project_list, gardener_shoot_create, gardener_shoot_list

### Kubernetes Access

- Backend uses Kubernetes client with kubeconfig authentication
- Reads ContentConfiguration CRDs from `openmfp-system` namespace
- Service account or user credentials loaded from default kubeconfig location
- No direct client-to-Kubernetes communication (all proxied through backend)

## Extensibility

### Adding New Content

New portal content can be added dynamically by creating ContentConfiguration CRDs in Kubernetes:

```yaml
apiVersion: core.openmfp.io/v1alpha1
kind: ContentConfiguration
metadata:
  name: my-new-content
  namespace: openmfp-system
status:
  configurationResult: |
    {
      "name": "my-new-content",
      "luigiConfigFragment": {
        "data": {
          "nodes": [
            {
              "pathSegment": "my-feature",
              "label": "My Feature",
              "icon": "add",
              "url": "https://my-micro-frontend.example.com",
              "entityType": "account"
            }
          ]
        }
      }
    }
```

### Custom Entity Context Providers

Additional entity types can be supported by implementing the `EntityContextProvider` interface and registering in `AppModule`:

```typescript
export class CustomEntityContextProvider implements EntityContextProvider {
  async getContextValues(
    token: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    // Custom logic
    return {
      id: context.entityId,
      customData: {}
    };
  }
}
```

### Service Provider Customization

The `KubernetesServiceProvidersService` can be replaced or extended to fetch configurations from different sources (databases, external APIs, etc.) by implementing the `ServiceProviderService` interface.

## Performance Considerations

### Micro-frontend Loading

- Luigi Framework handles lazy loading of micro-frontends
- Only active routes load their corresponding micro-frontends
- Virtual trees (like Gardener) load external applications in isolated iframes

### Backend Caching

- ContentConfiguration CRDs are fetched on each request
- Consider implementing caching for production deployments
- Watch Kubernetes events for cache invalidation

### Build Optimization

- Production builds use Angular's optimization
- Tree-shaking removes unused code
- Multi-stage Docker build separates build and runtime dependencies
- Alpine Linux runtime image minimizes container size

## Monitoring and Observability

### Logging

- Backend uses NestJS built-in logging
- Errors logged to console with stack traces
- Frontend errors logged to browser console

### Health Checks

- Backend exposes health endpoints via NestJS
- Kubernetes readiness/liveness probes can be configured
- Frontend availability depends on backend serving static assets

## Related Repositories

- **@openmfp/portal-ui-lib**: Core portal UI components and Luigi configuration
- **@openmfp/portal-server-lib**: Backend portal services and interfaces
- **luigi-project/luigi**: Micro-frontend framework
- **kubernetes/client-node**: Official Kubernetes client for Node.js
