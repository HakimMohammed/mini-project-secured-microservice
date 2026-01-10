# E-Shop Frontend - Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- Backend services running:
  - Keycloak on port 9090
  - API Gateway on port 8080

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Keycloak Client

1. Open Keycloak Admin Console: http://localhost:9090
2. Login with admin credentials
3. Select `eshop-realm` realm
4. Go to **Clients** → **Create Client**
5. Configure:
   - **Client ID**: `react-frontend`
   - **Client Type**: Public
   - **Valid Redirect URIs**: `http://localhost:3000/*`
   - **Web Origins**: `http://localhost:3000`
   - **Standard Flow**: Enabled
   - **Direct Access Grants**: Enabled

### 4. Create Test Users

#### Admin User
1. Go to **Users** → **Add User**
2. Username: `admin`
3. Email: `admin@eshop.com`
4. Save
5. Go to **Credentials** tab → Set password
6. Go to **Role Mappings** tab → Assign `ADMIN` role

#### Client User
1. Go to **Users** → **Add User**
2. Username: `client`
3. Email: `client@eshop.com`
4. Save
5. Go to **Credentials** tab → Set password
6. Go to **Role Mappings** tab → Assign `CLIENT` role

### 5. Start the Application
```bash
npm start
```

The application will open at http://localhost:3000

## Testing the Application

### As CLIENT User
1. Login with client credentials
2. Browse products
3. Add products to cart
4. Checkout to create an order
5. View your orders in "My Orders"

### As ADMIN User
1. Login with admin credentials
2. Create/Edit/Delete products
3. View all orders from all users
4. Access Admin Dashboard

## Architecture

```
src/
├── components/          # Shared UI components
│   ├── ui/             # shadcn/ui base components
│   └── Layout.tsx      # Main layout with navigation
├── features/           # Feature modules
│   ├── auth/          # Authentication & authorization
│   ├── products/      # Product management
│   └── orders/        # Orders & shopping cart
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   └── useApi.ts      # API data fetching hook
├── services/          # API services
│   ├── api.ts         # Axios instance with interceptors
│   ├── productService.ts
│   └── orderService.ts
├── types/             # TypeScript definitions
├── config/            # Configuration
│   └── keycloak.ts    # Keycloak setup
├── lib/               # Utilities
│   └── utils.ts       # Helper functions
└── pages/             # Page components
    ├── HomePage.tsx
    ├── OrdersPage.tsx
    └── AdminPage.tsx
```

## Key Features

### Authentication
- **Keycloak Integration**: OIDC authentication with JWT tokens
- **Auto Token Refresh**: Automatic token renewal before expiration
- **Protected Routes**: Role-based access control
- **User Profile**: Display user info and logout

### Product Management
- **Browse Products**: All users can view products
- **CRUD Operations**: Admins can create, update, delete products
- **Stock Management**: Real-time stock tracking
- **Responsive Cards**: Modern product card design

### Shopping Cart
- **Add to Cart**: Customers can add products
- **Quantity Management**: Increase/decrease quantities
- **Stock Validation**: Prevent ordering more than available
- **Checkout**: Create orders with validation

### Order Management
- **My Orders**: Users see their order history
- **All Orders**: Admins see all orders
- **Order Details**: View items, quantities, prices
- **Order Status**: Track order status

## API Endpoints Used

All requests go through API Gateway at `http://localhost:8080`

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (ADMIN)
- `PUT /api/products/{id}` - Update product (ADMIN)
- `DELETE /api/products/{id}` - Delete product (ADMIN)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (ADMIN)

## Troubleshooting

### Issue: "Cannot connect to Keycloak"
**Solution**: Ensure Keycloak is running on port 9090
```bash
# Check if Keycloak is running
curl http://localhost:9090
```

### Issue: "401 Unauthorized"
**Solution**: 
1. Check if you're logged in
2. Verify token is being sent in requests (check Network tab)
3. Ensure Keycloak client is configured correctly

### Issue: "403 Forbidden"
**Solution**: User doesn't have required role
1. Check user's role assignments in Keycloak
2. Ensure `ADMIN` or `CLIENT` role is assigned

### Issue: "CORS Error"
**Solution**: 
1. Verify API Gateway CORS configuration
2. Ensure `http://localhost:3000` is in allowed origins

### Issue: Products/Orders not loading
**Solution**:
1. Check if API Gateway is running on port 8080
2. Verify backend services are running
3. Check browser console for errors

## Development Tips

### Adding New Components
1. Create component in appropriate feature folder
2. Use shadcn/ui components for consistency
3. Follow TypeScript best practices
4. Export from feature's index file

### Adding New API Endpoints
1. Add service method in `services/`
2. Define TypeScript types in `types/`
3. Use `useApi` hook for data fetching
4. Handle loading and error states

### Styling
- Use Tailwind CSS utility classes
- Follow shadcn/ui design tokens
- Use `cn()` utility for conditional classes
- Maintain responsive design

## Production Build

```bash
npm run build
```

The optimized build will be in the `build/` folder.

## Environment Variables

Copy `.env.example` to `.env` and customize:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:9090
REACT_APP_KEYCLOAK_REALM=eshop-realm
REACT_APP_KEYCLOAK_CLIENT_ID=eshop-frontend
```

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing
- **Keycloak** - Authentication
- **Axios** - HTTP client
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## License

MIT
