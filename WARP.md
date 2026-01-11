# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a microservices-based E-Shop application with:
- **Frontend**: React + TypeScript with Keycloak authentication
- **Backend**: Spring Boot microservices with Spring Cloud Gateway
- **Authentication**: Keycloak OAuth2/OpenID Connect
- **Security**: DevSecOps tooling (SonarQube, OWASP Dependency-Check, Trivy)

## Architecture

### Service Architecture
The application follows a microservices pattern with these components:

1. **Gateway Service** (port 8080)
   - Spring Cloud Gateway for API routing
   - JWT validation and security enforcement
   - Swagger aggregation at `/swagger-ui.html`
   - Routes requests to downstream microservices

2. **Product Service** (port 8081)
   - Manages product catalog
   - PostgreSQL database (port 5433)
   - Standard Spring Boot layered architecture: Controller → Service → Repository → Entity
   - Includes data seeder for initial product data

3. **Order Service** (port 8082)
   - Manages customer orders
   - PostgreSQL database (port 5434)
   - Uses OpenFeign client to communicate with Product Service
   - Standard Spring Boot layered architecture

4. **Frontend** (port 3000)
   - React 18 + TypeScript
   - Feature-based structure: `src/features/{auth,products,orders}`
   - Keycloak integration for authentication
   - Axios with automatic JWT token refresh
   - shadcn/ui components with Tailwind CSS

5. **Keycloak** (port 9090)
   - Identity and access management
   - Realm: `eshop-realm`
   - Test users: admin/admin, user/user

### Service Communication
- **Frontend → Gateway**: HTTP REST calls via Axios with JWT Bearer tokens
- **Gateway → Microservices**: Routes based on path prefixes (`/api/products/**`, `/api/orders/**`)
- **Order Service → Product Service**: OpenFeign client with JWT propagation
- All services validate JWT tokens issued by Keycloak

### Backend Package Structure
Each microservice follows this structure:
```
com.example.<service>/
├── config/          # Security, OpenAPI, Feign configurations
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── entities/        # JPA entities
├── exceptions/      # Custom exceptions and handlers
├── repositories/    # Spring Data JPA repositories
├── services/        # Business logic
├── seeder/          # Database seeders (optional)
└── client/          # Feign clients (order-service only)
```

### Frontend Structure
```
src/
├── components/      # Shared components (Layout, UI components from shadcn/ui)
├── features/        # Feature-based modules (auth, products, orders)
├── hooks/           # Custom React hooks (useAuth, useApi)
├── services/        # API clients (axios instance with interceptors)
├── types/           # TypeScript type definitions
├── config/          # Keycloak and other configurations
├── pages/           # Page components
└── lib/             # Utilities (e.g., cn() for class merging)
```

## Common Commands

### Starting Services

```powershell
# Start infrastructure only (databases + Keycloak)
docker-compose --profile infra up -d

# Start all application services (requires infra to be running)
docker-compose --profile infra --profile app up -d

# Start with security tools (SonarQube)
docker-compose --profile infra --profile app --profile security up -d

# Start everything
docker-compose --profile all up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Backend Development

Each microservice can be run independently with Maven:

```powershell
# Build a service
cd server/product-service
./mvnw.cmd clean package

# Run a service locally (requires infra profile running for databases)
./mvnw.cmd spring-boot:run

# Run tests
./mvnw.cmd test

# Run specific test
./mvnw.cmd test -Dtest=ProductServiceTest
```

### Frontend Development

```powershell
cd frontend

# Install dependencies
npm install

# Start development server (requires gateway and Keycloak running)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Security Scanning

```powershell
# Run all security scans (Windows)
./devsecops/run-security-scans.bat

# Run specific scan type
./devsecops/run-security-scans.bat sonarqube
./devsecops/run-security-scans.bat dependency-check
./devsecops/run-security-scans.bat trivy
```

**SonarQube Analysis**: Scans all three backend services (product-service, order-service, gateway-service)
- Access SonarQube dashboard at http://localhost:9000
- Default credentials: admin/admin123
- Reports are uploaded to SonarQube server

**OWASP Dependency-Check**: Scans dependencies for known vulnerabilities
- HTML report generated at: `devsecops/security-reports/dependency-check/dependency-check-report.html`
- Optional: Set `NVD_API_KEY` environment variable for faster NVD database updates

**Trivy**: Container image vulnerability scanning
- Scans Docker images for all services
- Generates both text and JSON reports in `devsecops/security-reports/trivy/`
- Reports: `<service>_report.txt` and `<service>_report.json`

## Development Guidelines

### Authentication & Authorization
- All backend endpoints require valid JWT tokens from Keycloak
- Frontend automatically attaches JWT tokens via Axios interceptors
- On 401 responses, frontend attempts token refresh before redirecting to login
- Role-based access: Check `realm_access.roles` in JWT token claims

### Adding New Backend Endpoints
1. Add method to appropriate controller
2. Define DTOs for request/response
3. Implement business logic in service layer
4. Add repository methods if database access is needed
5. Update Swagger annotations for documentation
6. Ensure proper security annotations (`@PreAuthorize` if role-based)

### Adding New Frontend Features
1. Create feature directory under `src/features/<feature-name>/`
2. Use `useApi` hook for API calls with automatic error handling
3. Use `useAuth` hook to access Keycloak user info and roles
4. Place shared UI components in `src/components/ui/`
5. Define TypeScript types in `src/types/`

### Database Changes
- Each microservice has its own PostgreSQL database
- Databases are isolated by port: product (5433), order (5434), keycloak (5435)
- No shared schemas between services
- For schema changes, add JPA entity changes and let Hibernate auto-update handle it (dev only)
- For production, use Flyway/Liquibase migrations (not currently configured)

### Service-to-Service Communication
- Use OpenFeign for inter-service HTTP calls (see `ProductClient` in order-service)
- Configure Feign client with `@FeignClient` annotation specifying service URL
- JWT token propagation is handled by `FeignConfig` class
- Always include circuit breaker patterns for resilience (currently not implemented)

## Key Configuration Files

- `.env`: Environment variables (DO NOT commit, use `.env.example` as template)
- `docker-compose.yml`: Service orchestration with three profiles (infra, app, security)
- `server/<service>/src/main/resources/application.yml`: Spring Boot configuration per service
- `frontend/src/config/keycloak.ts`: Keycloak client configuration
- `keycloak/configuration/realm.json`: Keycloak realm configuration

## Service URLs

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Gateway Swagger: http://localhost:8080/swagger-ui.html
- Product Service: http://localhost:8081
- Product Swagger: http://localhost:8081/swagger-ui.html
- Order Service: http://localhost:8082
- Order Swagger: http://localhost:8082/swagger-ui.html
- Keycloak: http://localhost:9090
- SonarQube: http://localhost:9000

## Testing

### Backend Testing
- Unit tests: Use JUnit 5 and Mockito
- Test files location: `src/test/java/`
- Run tests: `./mvnw.cmd test`
- Test Spring Security: Use `@WithMockUser` or `spring-security-test` utilities

### Frontend Testing
- Testing framework: React Testing Library + Jest
- Run tests: `npm test` in frontend directory
- Test files: Co-located with components as `*.test.tsx`

## Troubleshooting

### Keycloak Connection Issues
- Check Keycloak is running: `docker ps | findstr keycloak`
- Verify realm is imported: Check logs for "Imported realm eshop-realm"
- Ensure frontend redirect URI is configured: http://localhost:3000/*
- See `docs/KEYCLOAK_TROUBLESHOOTING.md` for detailed troubleshooting

### Database Connection Issues
- Verify PostgreSQL containers are healthy: `docker ps`
- Check database logs: `docker logs <container-name>`
- Ensure correct ports are exposed (5433, 5434, 5435)
- Check `.env` file has correct database credentials

### Service Startup Issues
- Services depend on Keycloak being fully started
- Wait for Keycloak health check before starting app services
- Check service logs: `docker logs <service-name>`
- Verify JWT issuer URI is accessible from service containers

## Documentation

Comprehensive documentation is available in the `docs/` directory:
- `API_INTEGRATION.md`: Complete API documentation with endpoints, request/response examples
- `APPLICATION_FLOW.md`: User flows and authentication sequences
- `PROJECT_STRUCTURE.md`: Detailed frontend architecture and patterns
- `KEYCLOAK_TROUBLESHOOTING.md`: Keycloak-specific troubleshooting guide
- `SETUP.md`: Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md`: Implementation decisions and rationale
