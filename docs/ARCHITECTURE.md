# Architecture

This document provides the architectural overview of the OpenMFP Portal, following the Architecture and Code Documentation (ACD) standard. For detailed implementation information, see [ACD.md](./ACD.md).

## Table of Contents

1. [Requirements](#requirements)
2. [Product-Specific Qualities](#product-specific-qualities)
3. [Architectural Design Decisions](#architectural-design-decisions)
   - [Technology Decisions](#technology-decisions)
   - [Architecture Decisions](#architecture-decisions)
   - [Usage of Services](#usage-of-services)
   - [Offered APIs](#offered-apis)
   - [APIs Used](#apis-used)
   - [Deployment Process](#deployment-process)
   - [Operations Concept](#operations-concept)

---

## Requirements

### Functional Requirements

**Portal Management Interface**
The portal provides a unified web-based interface for accessing and managing OpenMFP platform resources, services, and integrations.

**Micro-Frontend Orchestration**
The portal dynamically loads and orchestrates multiple micro-frontend applications, allowing modular and independent deployment of features.

**Dynamic Content Configuration**
The portal configuration is driven by Kubernetes Custom Resources (ContentConfiguration CRDs), enabling runtime changes without redeployment.

**Entity-Based Navigation**
The portal supports entity-scoped navigation (accounts, projects, etc.) with context-aware content and permissions.

**External Service Integration**
The portal integrates external services like Gardener Dashboard through iframe embedding and virtual tree navigation.

### Non-Functional Requirements

**Scalability**
The portal must support multiple concurrent users and dynamically scale based on load.

**Performance**
The portal should provide fast initial load times and lazy-load micro-frontends on demand.

**Security**
The portal must implement OAuth2 authentication, token-based API access, and role-based authorization.

**Extensibility**
The portal architecture must support adding new micro-frontends, entity types, and service providers without core changes.

---

## Product-Specific Qualities

### Modularity Through Micro-Frontends

The portal uses the Luigi Framework to compose independent micro-frontend applications. Each micro-frontend can be:
- Developed independently
- Deployed separately
- Owned by different teams
- Written in different frontend frameworks

**Critical for success**: This modularity enables parallel development and prevents monolithic frontend architecture.

### Configuration-as-Code via Kubernetes CRDs

The portal's navigation, content, and micro-frontend configurations are stored as Kubernetes Custom Resources (ContentConfiguration CRDs). This enables:
- Version-controlled configuration
- GitOps-based deployments
- Runtime configuration changes
- Consistent multi-cluster deployments

**Critical for success**: Kubernetes-native configuration aligns with cloud-native operations and enables automated configuration management.

### Stateless Backend Architecture

The backend is stateless and fetches fresh configuration from Kubernetes on each request. This ensures:
- Horizontal scalability
- No session management complexity
- Immediate configuration updates
- Simplified operations

**Critical for success**: Stateless design enables cloud-native deployment patterns and auto-scaling.

---

## Architectural Design Decisions

### Technology Decisions

#### Frontend Stack

**Angular 18 with Standalone Components**
- **Rationale**: Modern Angular architecture reduces boilerplate and improves performance
- **Trade-offs**: Requires Angular-specific knowledge; standalone components break from older Angular patterns
- **Status**: Active

**Luigi Framework for Micro-Frontend Orchestration**
- **Rationale**: Framework-agnostic micro-frontend solution; supports iframe-based isolation
- **Trade-offs**: Adds iframe overhead; cross-origin communication complexity
- **Alternatives Considered**: Single-SPA (more invasive), Module Federation (requires Webpack)
- **Status**: Active

**TypeScript 5.5**
- **Rationale**: Type safety, better developer experience, modern language features
- **Trade-offs**: Build complexity, requires compilation
- **Status**: Active

**RxJS for Reactive Programming**
- **Rationale**: Native Angular integration, powerful async handling
- **Trade-offs**: Steep learning curve, easy to misuse
- **Status**: Active

#### Backend Stack

**NestJS 10 Framework**
- **Rationale**: Structured Node.js framework with TypeScript, dependency injection, and module system
- **Trade-offs**: Framework overhead for simple applications
- **Alternatives Considered**: Express (too minimal), Fastify (less ecosystem)
- **Status**: Active

**Node.js 22+**
- **Rationale**: LTS version with modern features, good performance
- **Trade-offs**: Single-threaded execution model
- **Status**: Active

**Kubernetes Client for Node.js**
- **Rationale**: Official Kubernetes client library, well-maintained
- **Trade-offs**: Verbose API, requires deep Kubernetes knowledge
- **Status**: Active

#### External Libraries

**@openmfp/portal-ui-lib**
- **Purpose**: Core portal UI components, Luigi shell configuration, navigation management
- **Ownership**: OpenMFP organization
- **Status**: Active dependency

**@openmfp/portal-server-lib**
- **Purpose**: Backend portal services, REST API implementation, provider interfaces
- **Ownership**: OpenMFP organization
- **Status**: Active dependency

**@luigi-project/plugin-auth-oauth2**
- **Purpose**: OAuth2 authentication integration for Luigi Framework
- **Ownership**: SAP Luigi Project
- **Status**: Active dependency

### Architecture Decisions

#### Minimal Shell Architecture

**Decision**: The portal itself contains minimal application code. Most functionality is delegated to `@openmfp/portal-ui-lib` (frontend) and `@openmfp/portal-server-lib` (backend).

**Rationale**:
- Reduces duplication across OpenMFP portal instances
- Centralizes common functionality in shared libraries
- Simplifies portal customization and updates
- Enables consistent behavior across deployments

**Consequences**:
- Strong coupling to OpenMFP portal libraries
- Portal cannot function without these dependencies
- Debugging requires understanding library internals

#### Dynamic Configuration Through CRDs

**Decision**: Portal navigation and content configuration is stored in Kubernetes ContentConfiguration CRDs rather than static files.

**Rationale**:
- Kubernetes-native configuration management
- Runtime configuration updates without redeployment
- Version control through Kubernetes GitOps
- Consistent with OpenMFP's Kubernetes-first approach

**Consequences**:
- Portal requires connection to Kubernetes cluster
- Configuration changes require CRD updates
- Debugging requires Kubernetes access

#### Stateless Backend with No Caching

**Decision**: The backend does not cache ContentConfiguration data and fetches from Kubernetes on every request.

**Rationale**:
- Simplifies implementation
- Guarantees fresh configuration data
- Enables horizontal scaling without cache synchronization
- Reduces operational complexity

**Consequences**:
- Higher latency for service provider requests
- Increased load on Kubernetes API
- Future caching may be needed for production scale

**Recommendation**: Consider implementing caching with Kubernetes watch-based invalidation for production deployments.

#### OAuth2 Authentication via Luigi Plugin

**Decision**: Authentication is handled client-side through Luigi's OAuth2 plugin rather than backend session management.

**Rationale**:
- Keeps backend stateless
- Leverages Luigi's built-in auth capabilities
- Supports standard OAuth2 flows
- Micro-frontends inherit authentication

**Consequences**:
- Token management happens in browser
- Backend must validate tokens on every request
- Refresh token logic handled by Luigi plugin

### Usage of Services

#### Internal Services

**ContentConfiguration CRD Operator** (assumed)
- **Purpose**: Manages ContentConfiguration custom resources in Kubernetes
- **Usage**: The portal reads ContentConfiguration CRDs to build navigation
- **Reference**: Core OpenMFP platform component

**CRD Gateway API** (referenced via `CRD_GATEWAY_API_URL`)
- **Purpose**: Provides API access to OpenMFP custom resources
- **Usage**: Portal context provider exposes API URL to micro-frontends
- **Reference**: Core OpenMFP platform component

#### External Services

**Gardener Dashboard** (optional integration)
- **Purpose**: Kubernetes cluster management UI
- **Usage**: Embedded as virtual tree node in portal navigation
- **Integration Method**: Iframe embedding with Luigi communication
- **Configuration**: URL specified in ContentConfiguration CRDs

**Luigi Fiddle Examples** (development only)
- **Purpose**: Demo micro-frontends for testing portal integration
- **Usage**: Development and testing examples
- **URL**: https://fiddle.luigi-project.io

### Offered APIs

The portal backend exposes REST APIs through the `@openmfp/portal-server-lib` module.

#### Service Provider API

**Endpoint**: `GET /rest/service-providers`

**Purpose**: Returns dynamic navigation and content configuration from Kubernetes ContentConfiguration CRDs.

**Authentication**: Bearer token (validated by backend)

**Request Parameters**:
- `entities` (query): List of entity types to filter
- `context` (query): Additional context parameters

**Response**:
```json
{
  "serviceProviders": [
    {
      "contentConfiguration": [
        {
          "name": "example-config",
          "creationTimestamp": "2022-05-17T11:37:17Z",
          "luigiConfigFragment": {
            "data": {
              "nodes": [...]
            }
          }
        }
      ]
    }
  ]
}
```

#### Entity Context API

**Endpoint**: `GET /rest/entity-context?entity=<entityType>`

**Purpose**: Returns entity-specific context values and policies for the authenticated user.

**Authentication**: Bearer token (validated by backend)

**Request Parameters**:
- `entity` (query): Entity type (e.g., "account")
- `context` (query): Additional context parameters

**Response**:
```json
{
  "id": "account-123",
  "policies": [
    "create",
    "delete",
    "get",
    "list",
    "update",
    "watch",
    "gardener_project_create",
    "gardener_project_list",
    "gardener_shoot_create",
    "gardener_shoot_list"
  ]
}
```

#### Portal Context API

**Endpoint**: `GET /rest/portal-context`

**Purpose**: Returns global portal configuration values.

**Authentication**: Bearer token (validated by backend)

**Response**:
```json
{
  "crdGatewayApiUrl": "https://crd-gateway.example.com"
}
```

### APIs Used

#### Kubernetes API

**Service**: Kubernetes API Server

**Purpose**: Read ContentConfiguration CRDs to build portal navigation

**Authentication**: Kubeconfig-based authentication (service account or user credentials)

**API Calls**:
- `GET /apis/core.openmfp.io/v1alpha1/namespaces/openmfp-system/contentconfigurations` - List ContentConfiguration CRDs

**Client Library**: `@kubernetes/client-node`

**Error Handling**: Logs errors to console; returns empty service providers on failure

#### CRD Gateway API

**Service**: CRD Gateway (referenced via environment variable)

**Purpose**: Provide micro-frontends access to OpenMFP custom resources

**Authentication**: Token passed from client

**Usage**: Portal exposes API URL via Portal Context API; micro-frontends make direct API calls

### Deployment Process

#### Development Deployment

**Prerequisites**:
- Node.js 22+
- npm 9+
- Access to Kubernetes cluster with ContentConfiguration CRDs
- Valid kubeconfig

**Steps**:
```bash
# Install dependencies
npm run prepare

# Start development servers
npm start
```

**Architecture**:
- Frontend: Angular CLI dev server on port 4300
- Backend: NestJS debug mode on port 3000
- Proxy: `/rest/**` requests forwarded from frontend to backend
- Hot reload enabled for both frontend and backend

#### Production Deployment

**Container Build**:

Multi-stage Docker build:
1. **Build Stage** (node:22.12):
   - Install dependencies with npm ci
   - Build frontend (Angular production build)
   - Build backend (NestJS compilation)

2. **Runtime Stage** (node:22.12-alpine):
   - Copy built artifacts
   - Expose port 3000
   - Single Node.js process serves both static frontend and API

**Secrets Management**:
- GitHub token required for npm package access (passed as Docker secret)
- Kubeconfig for Kubernetes access (mounted as volume or service account)

**Deployment Target**: Kubernetes cluster

**Configuration**:
- Environment variables via ConfigMap/Secret
- Kubeconfig via mounted service account or Secret
- Port 3000 exposed via Service

**Scaling**: Horizontal scaling supported (stateless architecture)

### Operations Concept

#### Key Performance Indicators (KPIs)

**Availability**:
- Target: 99.9% uptime
- Measurement: HTTP health check endpoint

**Response Time**:
- Target: < 500ms for API requests
- Measurement: Request latency metrics

**Error Rate**:
- Target: < 1% of requests
- Measurement: HTTP error status codes

#### Monitoring

**Logging**:
- Backend: NestJS structured logging to stdout
- Frontend: Browser console logging (errors only in production)
- Log aggregation: Application logs collected by Kubernetes log aggregator

**Health Checks**:
- Kubernetes readiness probe: HTTP GET on health endpoint
- Kubernetes liveness probe: HTTP GET on health endpoint

**Metrics** (future):
- Request count and latency per endpoint
- Kubernetes API call latency
- ContentConfiguration CRD count and size

#### Support and Responsibilities

**Operations Team Responsibilities**:
- Monitor portal health and availability
- Manage Kubernetes cluster access and RBAC
- Rotate service account credentials
- Handle infrastructure issues

**Development Team Responsibilities**:
- Fix application bugs
- Add new features and micro-frontend integrations
- Update dependencies
- Maintain ContentConfiguration CRD schemas

**End User Responsibilities**:
- Report UI issues and bugs
- Provide feedback on usability

#### Troubleshooting

**Frontend Not Loading**:
1. Check backend is running and accessible
2. Verify proxy configuration in development
3. Check browser console for CORS errors

**Backend Cannot Connect to Kubernetes**:
1. Verify kubeconfig is valid and accessible
2. Check service account has correct RBAC permissions
3. Confirm `openmfp-system` namespace exists
4. Test Kubernetes connectivity: `kubectl get contentconfigurations -n openmfp-system`

**No Navigation Items Appearing**:
1. Check ContentConfiguration CRDs exist: `kubectl get contentconfigurations -n openmfp-system`
2. Verify CRDs have `status.configurationResult` populated
3. Validate JSON format in `configurationResult`
4. Check backend logs for CRD fetch errors

**Micro-Frontend Not Loading**:
1. Verify external URL is accessible
2. Check for CORS issues (browser console)
3. Confirm iframe embedding is allowed (X-Frame-Options header)
4. Validate Luigi node configuration in ContentConfiguration CRD

#### Security Considerations

**Authentication**:
- OAuth2 via Luigi plugin
- JWT token validation on backend
- No session storage

**Authorization**:
- Entity context providers define policies
- Policies control UI element visibility
- Backend validates tokens but does not enforce authorization (micro-frontends handle their own authorization)

**Kubernetes Access**:
- Backend uses service account with minimal RBAC permissions
- No direct client-to-Kubernetes communication
- All Kubernetes access proxied through backend

**Best Practices**:
- Never commit `.env` files with secrets
- Use Kubernetes Secrets for production credentials
- Rotate service account tokens regularly
- Implement rate limiting for production APIs
- Use HTTPS in production deployments

---

## Related Documentation

- [ACD.md](./ACD.md) - Detailed Architecture and Code Documentation
- [README.md](../README.md) - Repository overview and getting started guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [Luigi Framework Documentation](https://docs.luigi-project.io)
- [NestJS Documentation](https://docs.nestjs.com)
- [Angular Documentation](https://angular.io/docs)
