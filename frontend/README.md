# E-Shop Frontend

A modern React TypeScript e-commerce frontend with Keycloak authentication and shadcn/ui components.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Prerequisites

- Node.js 16+
- Backend services running (Keycloak, API Gateway)

## Tech Stack

- React 19 with TypeScript
- Keycloak OIDC authentication
- React Router
- Axios with interceptors
- shadcn/ui + Tailwind CSS

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run development server |
| `npm build` | Build for production |
| `npm test` | Run tests |

## Configuration

Update Keycloak settings in `src/config/keycloak.ts` if needed.

## Documentation

See the main project [docs/](../docs/) folder for:
- [Full Setup Guide](../docs/SETUP.md)
- [Application Flow](../docs/APPLICATION_FLOW.md)
- [API Integration](../docs/API_INTEGRATION.md)
- [Project Structure](../docs/PROJECT_STRUCTURE.md)


The application communicates with the backend through the API Gateway at `http://localhost:8080`:

- **Products**: `/api/products`
- **Orders**: `/api/orders`

All requests include JWT authentication tokens automatically via Axios interceptors.

## Key Features Implementation

### Authentication
- Automatic token refresh on expiration
- Protected routes with role-based access
- Seamless Keycloak integration

### Product Management
- CRUD operations for admins
- Real-time stock tracking
- Product search and filtering

### Shopping Cart
- Add/remove items
- Quantity management
- Order checkout with validation

### Order Management
- Order history for users
- All orders view for admins
- Order status tracking

## Environment Variables

Create a `.env` file if you need to customize:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:9090
REACT_APP_KEYCLOAK_REALM=eshop-realm
REACT_APP_KEYCLOAK_CLIENT_ID=eshop-frontend
```

## Troubleshooting

### CORS Issues
Ensure the API Gateway has CORS configured to allow `http://localhost:3000`

### Authentication Errors
- Verify Keycloak is running on port 9090
- Check client configuration in Keycloak
- Ensure redirect URIs are correctly set


