# E-Shop Microservices - Frontend Integration Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Services & Ports](#services--ports)
3. [Keycloak Configuration](#keycloak-configuration)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Request/Response Examples](#requestresponse-examples)
7. [Error Handling](#error-handling)
8. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Angular/Vue)                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP + JWT Token
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Port 8080)                         │
│                                                                     │
│  • Single entry point for all API calls                            │
│  • JWT validation via Keycloak                                      │
│  • Routes requests to appropriate microservice                      │
│  • Swagger UI aggregation                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│   PRODUCT SERVICE (8081)      │   │    ORDER SERVICE (8082)       │
│                               │   │                               │
│  • Product CRUD               │   │  • Create orders              │
│  • Stock management           │   │  • View user orders           │
│  • Admin only: create/update  │   │  • Admin: view all orders     │
└───────────────────────────────┘   └───────────────────────────────┘
                    │                               │
                    ▼                               ▼
            ┌──────────────┐                ┌──────────────┐
            │ product_db   │                │  order_db    │
            │ (PostgreSQL) │                │ (PostgreSQL) │
            └──────────────┘                └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     KEYCLOAK (Port 9090)                            │
│                                                                     │
│  • Identity Provider                                                │
│  • User authentication                                              │
│  • Role management (ADMIN, CLIENT)                                  │
│  • JWT token issuance                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Services & Ports

| Service | Port | Base URL | Description |
|---------|------|----------|-------------|
| **Keycloak** | 9090 | `http://localhost:9090` | Identity & Access Management |
| **API Gateway** | 8080 | `http://localhost:8080` | Single entry point (USE THIS) |
| **Product Service** | 8081 | `http://localhost:8081` | Product management (internal) |
| **Order Service** | 8082 | `http://localhost:8082` | Order management (internal) |

> ⚠️ **IMPORTANT**: Frontend should ONLY communicate with the **API Gateway (port 8080)** and **Keycloak (port 9090)**. Never call microservices directly.

---

## Keycloak Configuration

### Realm Details
| Property | Value |
|----------|-------|
| Realm Name | `eshop-realm` |
| Keycloak URL | `http://localhost:9090` |
| Token Endpoint | `http://localhost:9090/realms/eshop-realm/protocol/openid-connect/token` |
| Auth Endpoint | `http://localhost:9090/realms/eshop-realm/protocol/openid-connect/auth` |
| Logout Endpoint | `http://localhost:9090/realms/eshop-realm/protocol/openid-connect/logout` |
| UserInfo Endpoint | `http://localhost:9090/realms/eshop-realm/protocol/openid-connect/userinfo` |

### Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| `CLIENT` | Regular customer | View products, Create orders, View own orders |
| `ADMIN` | Administrator | All CLIENT permissions + Manage products + View all orders |

### Client Configuration (Frontend)
Create a **public** client in Keycloak for the frontend:

| Property | Value |
|----------|-------|
| Client ID | `eshop-frontend` (or your choice) |
| Client Type | Public |
| Valid Redirect URIs | `http://localhost:3000/*` (your frontend URL) |
| Web Origins | `http://localhost:3000` |
| Standard Flow | Enabled |
| Direct Access Grants | Enabled (for testing) |

---

## Authentication Flow

### 1. Login Flow (Authorization Code + PKCE - Recommended)

```
┌──────────┐                              ┌──────────┐                              ┌──────────┐
│ Frontend │                              │ Keycloak │                              │ Gateway  │
└────┬─────┘                              └────┬─────┘                              └────┬─────┘
     │                                         │                                         │
     │ 1. Redirect to Keycloak login           │                                         │
     │────────────────────────────────────────►│                                         │
     │                                         │                                         │
     │ 2. User enters credentials              │                                         │
     │                                         │                                         │
     │ 3. Redirect back with authorization code│                                         │
     │◄────────────────────────────────────────│                                         │
     │                                         │                                         │
     │ 4. Exchange code for tokens             │                                         │
     │────────────────────────────────────────►│                                         │
     │                                         │                                         │
     │ 5. Return access_token + refresh_token  │                                         │
     │◄────────────────────────────────────────│                                         │
     │                                         │                                         │
     │ 6. API call with Bearer token           │                                         │
     │─────────────────────────────────────────────────────────────────────────────────►│
     │                                         │                                         │
     │ 7. Response                             │                                         │
     │◄─────────────────────────────────────────────────────────────────────────────────│
```

### 2. Token Structure

The JWT access token contains:

```json
{
  "exp": 1736539200,
  "iat": 1736538900,
  "sub": "user-uuid-here",
  "realm_access": {
    "roles": ["CLIENT", "default-roles-eshop-realm"]
  },
  "preferred_username": "john.doe",
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### 3. Making Authenticated Requests

All API requests must include the JWT token in the Authorization header:

```http
GET /api/products HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## API Endpoints

### Product Service (via Gateway)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/products` | CLIENT, ADMIN | List all products |
| `GET` | `/api/products/{id}` | CLIENT, ADMIN | Get product by ID |
| `POST` | `/api/products` | ADMIN | Create new product |
| `PUT` | `/api/products/{id}` | ADMIN | Update product |
| `DELETE` | `/api/products/{id}` | ADMIN | Delete product |

### Order Service (via Gateway)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/orders` | CLIENT, ADMIN | Create new order |
| `GET` | `/api/orders/my-orders` | CLIENT, ADMIN | Get current user's orders |
| `GET` | `/api/orders` | ADMIN | Get all orders (admin only) |

### Swagger Documentation

| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Gateway Swagger (aggregated) |
| `http://localhost:8081/swagger-ui.html` | Product Service Swagger |
| `http://localhost:8082/swagger-ui.html` | Order Service Swagger |

---

## Request/Response Examples

### Products

#### List All Products
```http
GET http://localhost:8080/api/products
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Laptop Pro",
    "description": "High-end workstation",
    "price": 1500.0,
    "quantity": 10
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Wireless Mouse",
    "description": "Ergonomic 2.4GHz",
    "price": 25.0,
    "quantity": 50
  }
]
```

#### Get Product by ID
```http
GET http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Laptop Pro",
  "description": "High-end workstation",
  "price": 1500.0,
  "quantity": 10
}
```

#### Create Product (ADMIN only)
```http
POST http://localhost:8080/api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Gaming Keyboard",
  "description": "RGB Mechanical Keyboard",
  "price": 150.0,
  "quantity": 25
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Gaming Keyboard",
  "description": "RGB Mechanical Keyboard",
  "price": 150.0,
  "quantity": 25
}
```

#### Update Product (ADMIN only)
```http
PUT http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Gaming Keyboard Pro",
  "description": "RGB Mechanical Keyboard with Macro Keys",
  "price": 180.0,
  "quantity": 20
}
```

#### Delete Product (ADMIN only)
```http
DELETE http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer <admin-token>
```

**Response (204 No Content)**

---

### Orders

#### Create Order
```http
POST http://localhost:8080/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "order-uuid-here",
  "userId": "user-uuid-from-token",
  "orderDate": "2026-01-10T20:30:00",
  "status": "VALIDATED",
  "totalAmount": 3025.0,
  "items": [
    {
      "id": "item-uuid-1",
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2,
      "price": 1500.0
    },
    {
      "id": "item-uuid-2",
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1,
      "price": 25.0
    }
  ]
}
```

#### Get My Orders
```http
GET http://localhost:8080/api/orders/my-orders
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "order-uuid-1",
    "userId": "user-uuid",
    "orderDate": "2026-01-10T20:30:00",
    "status": "VALIDATED",
    "totalAmount": 3025.0,
    "items": [...]
  }
]
```

#### Get All Orders (ADMIN only)
```http
GET http://localhost:8080/api/orders
Authorization: Bearer <admin-token>
```

---

## Error Handling

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "timestamp": "2026-01-10T20:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Successful GET, PUT |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, Insufficient stock |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Valid token but insufficient role |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Server-side error |

### Validation Errors

```json
{
  "timestamp": "2026-01-10T20:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "name": "Product name is required",
    "price": "Price must be positive",
    "quantity": "Quantity cannot be negative"
  }
}
```

### Insufficient Stock Error

```json
{
  "timestamp": "2026-01-10T20:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient stock for product 'Laptop Pro'. Available: 10, Requested: 15"
}
```

---

## Frontend Implementation Guide

### Recommended Libraries

| Framework | Auth Library | HTTP Client |
|-----------|--------------|-------------|
| React | `@react-keycloak/web` or `oidc-client-ts` | `axios` or `fetch` |
| Angular | `keycloak-angular` | `HttpClient` |
| Vue | `@dsb-norge/vue-keycloak-js` | `axios` |

### React Example Setup

#### 1. Install Dependencies
```bash
npm install keycloak-js @react-keycloak/web axios
```

#### 2. Keycloak Configuration (`keycloak.ts`)
```typescript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'eshop-realm',
  clientId: 'eshop-frontend'
});

export default keycloak;
```

#### 3. App Setup (`App.tsx`)
```tsx
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      }}
    >
      <Router>
        {/* Your routes */}
      </Router>
    </ReactKeycloakProvider>
  );
}
```

#### 4. API Service (`api.ts`)
```typescript
import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await keycloak.updateToken(30);
        error.config.headers.Authorization = `Bearer ${keycloak.token}`;
        return api.request(error.config);
      } catch {
        keycloak.login();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 5. Using the API
```typescript
import api from './api';

// Get all products
const getProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

// Create order
const createOrder = async (items: { productId: string; quantity: number }[]) => {
  const response = await api.post('/api/orders', { items });
  return response.data;
};

// Get my orders
const getMyOrders = async () => {
  const response = await api.get('/api/orders/my-orders');
  return response.data;
};
```

#### 6. Protected Route Component
```tsx
import { useKeycloak } from '@react-keycloak/web';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  if (roles && !roles.some(role => keycloak.hasRealmRole(role))) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};

// Usage
<ProtectedRoute roles={['ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

#### 7. Check User Roles
```typescript
import { useKeycloak } from '@react-keycloak/web';

const MyComponent = () => {
  const { keycloak } = useKeycloak();
  
  const isAdmin = keycloak.hasRealmRole('ADMIN');
  const isClient = keycloak.hasRealmRole('CLIENT');
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isClient && <ClientDashboard />}
    </div>
  );
};
```

#### 8. Logout
```typescript
const handleLogout = () => {
  keycloak.logout({ redirectUri: window.location.origin });
};
```

---

## Data Models

### Product
```typescript
interface Product {
  id: string;           // UUID
  name: string;         // Required, not blank
  description: string;  // Optional
  price: number;        // Required, positive
  quantity: number;     // Required, >= 0
}

interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
}
```

### Order
```typescript
interface Order {
  id: string;              // UUID
  userId: string;          // User's Keycloak ID
  orderDate: string;       // ISO 8601 datetime
  status: 'PENDING' | 'VALIDATED';
  totalAmount: number;     // Auto-calculated
  items: OrderItem[];
}

interface OrderItem {
  id: string;           // UUID
  productId: string;    // Product UUID
  quantity: number;     // Ordered quantity
  price: number;        // Price at time of order
}

interface OrderRequest {
  items: {
    productId: string;  // Required
    quantity: number;   // Required, >= 1
  }[];
}
```

### User (from Keycloak Token)
```typescript
interface User {
  sub: string;              // User UUID
  preferred_username: string;
  email: string;
  name: string;
  realm_access: {
    roles: string[];        // ['CLIENT'] or ['ADMIN', 'CLIENT']
  };
}
```

---

## CORS Configuration

The Gateway allows cross-origin requests. If you encounter CORS issues, ensure:

1. Your frontend URL is in the allowed origins
2. You're sending the correct headers
3. Preflight requests are handled

---

## Testing Checklist

### Authentication
- [ ] User can login via Keycloak
- [ ] Token is stored and sent with requests
- [ ] Token refresh works automatically
- [ ] User can logout
- [ ] Unauthenticated requests return 401

### Products (CLIENT)
- [ ] Can view all products
- [ ] Can view single product
- [ ] Cannot create/update/delete products (403)

### Products (ADMIN)
- [ ] Can view all products
- [ ] Can create new product
- [ ] Can update existing product
- [ ] Can delete product
- [ ] Validation errors shown properly

### Orders (CLIENT)
- [ ] Can create order
- [ ] Can view own orders only
- [ ] Cannot view all orders (403)
- [ ] Insufficient stock error handled

### Orders (ADMIN)
- [ ] Can create order
- [ ] Can view own orders
- [ ] Can view all orders

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                     QUICK REFERENCE                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  GATEWAY URL:     http://localhost:8080                        │
│  KEYCLOAK URL:    http://localhost:9090                        │
│  REALM:           eshop-realm                                  │
│  SWAGGER:         http://localhost:8080/swagger-ui.html        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  PRODUCTS                                                      │
│  GET    /api/products           - List all (CLIENT, ADMIN)     │
│  GET    /api/products/{id}      - Get one (CLIENT, ADMIN)      │
│  POST   /api/products           - Create (ADMIN)               │
│  PUT    /api/products/{id}      - Update (ADMIN)               │
│  DELETE /api/products/{id}      - Delete (ADMIN)               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  ORDERS                                                        │
│  POST   /api/orders             - Create (CLIENT, ADMIN)       │
│  GET    /api/orders/my-orders   - My orders (CLIENT, ADMIN)    │
│  GET    /api/orders             - All orders (ADMIN)           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  AUTH HEADER                                                   │
│  Authorization: Bearer <jwt-token>                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
