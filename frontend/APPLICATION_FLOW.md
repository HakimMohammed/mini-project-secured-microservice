# E-Shop Frontend - Application Flow

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Opens Application                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  ReactKeycloakProvider│
                  │   Initializes         │
                  └──────────┬────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Authenticated? │
                    └────┬───────┬───┘
                         │       │
                    NO   │       │   YES
                         │       │
                         ▼       ▼
              ┌──────────────┐  ┌──────────────┐
              │ Redirect to  │  │ Load App     │
              │ Keycloak     │  │ with Token   │
              │ Login        │  │              │
              └──────┬───────┘  └──────┬───────┘
                     │                 │
                     ▼                 ▼
          ┌──────────────────┐  ┌──────────────┐
          │ User Enters      │  │ Check Roles  │
          │ Credentials      │  │ CLIENT/ADMIN │
          └──────┬───────────┘  └──────┬───────┘
                 │                     │
                 ▼                     ▼
          ┌──────────────────┐  ┌──────────────┐
          │ Keycloak Returns │  │ Render       │
          │ JWT Token        │  │ Appropriate  │
          └──────┬───────────┘  │ UI           │
                 │               └──────────────┘
                 └───────────────────┘
```

## User Journey - Customer (CLIENT Role)

```
┌──────────────┐
│ Login        │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Home Page - Product List                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐                        │
│ │Product │ │Product │ │Product │                        │
│ │  Card  │ │  Card  │ │  Card  │                        │
│ └───┬────┘ └───┬────┘ └───┬────┘                        │
│     │          │          │                              │
│     └──────────┴──────────┘                              │
│                │                                          │
│                ▼                                          │
│     ┌──────────────────┐                                 │
│     │ Add to Cart      │                                 │
│     └─────────┬────────┘                                 │
│               │                                           │
│               ▼                                           │
│     ┌──────────────────────────────┐                     │
│     │ Shopping Cart                │                     │
│     │ - Adjust quantities          │                     │
│     │ - Remove items               │                     │
│     │ - View total                 │                     │
│     └─────────┬────────────────────┘                     │
│               │                                           │
│               ▼                                           │
│     ┌──────────────────┐                                 │
│     │ Checkout         │                                 │
│     └─────────┬────────┘                                 │
└───────────────┼──────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Order Created Successfully                                │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Order #12345678                                     │  │
│ │ Status: VALIDATED                                   │  │
│ │ Total: $3,025.00                                    │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ My Orders Page                                            │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Order History                                       │  │
│ │ - View all personal orders                          │  │
│ │ - See order details                                 │  │
│ │ - Check order status                                │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## User Journey - Administrator (ADMIN Role)

```
┌──────────────┐
│ Login        │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Home Page - Product Management                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [+ Add Product]                                    │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────┐ ┌────────┐ ┌────────┐                        │
│ │Product │ │Product │ │Product │                        │
│ │ [Edit] │ │ [Edit] │ │ [Edit] │                        │
│ │[Delete]│ │[Delete]│ │[Delete]│                        │
│ └────────┘ └────────┘ └────────┘                        │
└───────────────────────────────────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ Create      │  │ Edit         │  │ Delete       │
│ Product     │  │ Product      │  │ Product      │
│             │  │              │  │              │
│ - Name      │  │ - Update     │  │ - Confirm    │
│ - Desc      │  │   fields     │  │   deletion   │
│ - Price     │  │ - Save       │  │              │
│ - Quantity  │  │              │  │              │
└─────────────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Admin Dashboard                                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│ │ Products   │ │ All Orders │ │ Users      │            │
│ │ Management │ │ Monitoring │ │ (Keycloak) │            │
│ └────────────┘ └────────────┘ └────────────┘            │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ All Orders (from all customers)                     │  │
│ │ - Order #1 - User: john.doe - $1,500                │  │
│ │ - Order #2 - User: jane.smith - $3,025              │  │
│ │ - Order #3 - User: bob.wilson - $750                │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## API Call Flow

```
┌─────────────────┐
│ Component       │
│ (e.g., ProductList)
└────────┬────────┘
         │
         │ 1. Call service method
         ▼
┌─────────────────────┐
│ Service Layer       │
│ (productService.ts) │
└────────┬────────────┘
         │
         │ 2. Use axios instance
         ▼
┌─────────────────────────────────────────┐
│ API Instance (api.ts)                   │
│                                         │
│ Request Interceptor:                    │
│ ├─ Add Authorization header             │
│ └─ Bearer {JWT_TOKEN}                   │
└────────┬────────────────────────────────┘
         │
         │ 3. HTTP Request
         ▼
┌─────────────────────────────────────────┐
│ API Gateway (localhost:8080)            │
│ ├─ Validate JWT token                   │
│ ├─ Check user roles                     │
│ └─ Route to microservice                │
└────────┬────────────────────────────────┘
         │
         │ 4. Response
         ▼
┌─────────────────────────────────────────┐
│ Response Interceptor (api.ts)           │
│                                         │
│ If 401 Unauthorized:                    │
│ ├─ Try to refresh token                 │
│ ├─ Retry original request               │
│ └─ If refresh fails → Login             │
│                                         │
│ If 200 OK:                              │
│ └─ Return data                          │
└────────┬────────────────────────────────┘
         │
         │ 5. Return data
         ▼
┌─────────────────┐
│ Component       │
│ ├─ Update state │
│ └─ Render UI    │
└─────────────────┘
```

## Component Hierarchy

```
App
├── ReactKeycloakProvider
│   └── Router
│       └── Routes
│           ├── Route: "/"
│           │   └── ProtectedRoute (CLIENT, ADMIN)
│           │       └── Layout
│           │           └── HomePage
│           │               ├── ProductList
│           │               │   └── ProductCard (multiple)
│           │               └── CartView (if customer)
│           │
│           ├── Route: "/orders"
│           │   └── ProtectedRoute (CLIENT, ADMIN)
│           │       └── Layout
│           │           └── OrdersPage
│           │               └── OrderList
│           │                   └── OrderCard (multiple)
│           │
│           └── Route: "/admin"
│               └── ProtectedRoute (ADMIN only)
│                   └── Layout
│                       └── AdminPage
│                           ├── Dashboard Cards
│                           └── OrderList (all orders)
│
└── Layout (used by all routes)
    ├── Header
    │   ├── Logo
    │   ├── Navigation
    │   └── UserProfile
    ├── Main Content (children)
    └── Footer
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│ Authentication State (Keycloak)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ - User info                                         │ │
│ │ - JWT token                                         │ │
│ │ - Roles                                             │ │
│ │ - Authenticated status                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Accessed via: useAuth() hook                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Server State (API Data)                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Products:                                           │ │
│ │ ├─ data: Product[]                                  │ │
│ │ ├─ loading: boolean                                 │ │
│ │ ├─ error: string | null                             │ │
│ │ └─ refetch: () => void                              │ │
│ │                                                     │ │
│ │ Orders:                                             │ │
│ │ ├─ data: Order[]                                    │ │
│ │ ├─ loading: boolean                                 │ │
│ │ ├─ error: string | null                             │ │
│ │ └─ refetch: () => void                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Accessed via: useApi() hook                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Local Component State (React useState)                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Shopping Cart:                                      │ │
│ │ └─ cartItems: CartItem[]                            │ │
│ │                                                     │ │
│ │ Forms:                                              │ │
│ │ └─ formData: ProductRequest                         │ │
│ │                                                     │ │
│ │ UI State:                                           │ │
│ │ ├─ showForm: boolean                                │ │
│ │ ├─ editingProduct: Product | undefined              │ │
│ │ └─ loading: boolean                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│ API Call        │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Error? │
    └───┬─┬──┘
        │ │
    NO  │ │  YES
        │ │
        │ └──────────────────────────────────┐
        │                                    │
        ▼                                    ▼
┌───────────────┐                  ┌─────────────────┐
│ Return Data   │                  │ Check Error     │
│ to Component  │                  │ Status Code     │
└───────────────┘                  └────────┬────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
            │ 401           │      │ 403           │      │ 400/404/500   │
            │ Unauthorized  │      │ Forbidden     │      │ Other Errors  │
            └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
            │ Try Refresh   │      │ Show Access   │      │ Show Error    │
            │ Token         │      │ Denied        │      │ Message       │
            └───────┬───────┘      │ Message       │      │ to User       │
                    │              └───────────────┘      └───────────────┘
            ┌───────┴───────┐
            │               │
        SUCCESS         FAILURE
            │               │
            ▼               ▼
    ┌───────────────┐  ┌───────────────┐
    │ Retry         │  │ Redirect to   │
    │ Original      │  │ Login         │
    │ Request       │  │               │
    └───────────────┘  └───────────────┘
```

## Build & Deployment Flow

```
┌─────────────────┐
│ Development     │
│ npm start       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Webpack Dev Server              │
│ - Hot reload                    │
│ - Source maps                   │
│ - Fast refresh                  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Browser         │
│ localhost:3000  │
└─────────────────┘

┌─────────────────┐
│ Production      │
│ npm run build   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Build Process                   │
│ 1. TypeScript compilation       │
│ 2. Tailwind CSS processing      │
│ 3. Bundle optimization          │
│ 4. Minification                 │
│ 5. Tree shaking                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Build Output (build/)           │
│ - Optimized JS bundles          │
│ - Processed CSS                 │
│ - Static assets                 │
│ - index.html                    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Deploy to Static Server         │
│ - Nginx                         │
│ - Apache                        │
│ - Netlify/Vercel                │
│ - AWS S3 + CloudFront           │
└─────────────────────────────────┘
```

---

This visual guide helps understand how the application works from authentication to deployment!
