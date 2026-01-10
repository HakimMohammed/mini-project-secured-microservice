# E-Shop Frontend - React Application

A modern, secure e-commerce frontend application built with React, TypeScript, shadcn/ui, and Keycloak authentication.

## Features

- 🔐 **Keycloak Authentication** - Secure OIDC authentication with JWT tokens
- 👥 **Role-Based Access Control** - CLIENT and ADMIN roles with different permissions
- 🛍️ **Product Management** - Browse products, manage inventory (admin)
- 🛒 **Shopping Cart** - Add products to cart and checkout
- 📦 **Order Management** - View orders (users see their own, admins see all)
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design** - Works on all device sizes
- ⚡ **Feature-Based Architecture** - Clean, maintainable code structure

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Keycloak** - Authentication and authorization
- **Axios** - HTTP client with interceptors
- **shadcn/ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/          # Shared components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout component
├── features/           # Feature-based modules
│   ├── auth/          # Authentication components
│   ├── products/      # Product management
│   └── orders/        # Order and cart management
├── hooks/             # Custom React hooks
├── services/          # API service layer
├── types/             # TypeScript type definitions
├── config/            # Configuration files
├── lib/               # Utility functions
└── pages/             # Page components

```

## Prerequisites

- Node.js 16+
- npm or yarn
- Running backend services:
  - Keycloak (port 9090)
  - API Gateway (port 8080)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Keycloak client:
   - Create a public client in Keycloak named `eshop-frontend`
   - Set valid redirect URIs to `http://localhost:3000/*`
   - Enable Standard Flow and Direct Access Grants

3. Update Keycloak configuration if needed in `src/config/keycloak.ts`

## Running the Application

Start the development server:

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## User Roles

### CLIENT Role
- View all products
- Add products to cart
- Create orders
- View own orders

### ADMIN Role
- All CLIENT permissions
- Create/update/delete products
- View all orders from all users

## API Integration

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

### API Errors
- Confirm API Gateway is running on port 8080
- Check network tab for detailed error messages
- Verify JWT token is being sent in requests

## Contributing

1. Follow the feature-based architecture
2. Use TypeScript for type safety
3. Follow React best practices
4. Use shadcn/ui components for consistency
5. Write meaningful commit messages

## License

MIT License
