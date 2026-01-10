# E-Shop Frontend - Project Structure

## Overview
This is a production-ready React TypeScript application with Keycloak authentication, built using a feature-based architecture and shadcn/ui components.

## Directory Structure

```
frontend/
├── public/                      # Static files
│   ├── index.html              # HTML template
│   └── ...
│
├── src/
│   ├── components/             # Shared components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   └── index.ts       # Barrel export
│   │   └── Layout.tsx         # Main layout with navigation
│   │
│   ├── features/              # Feature modules (business logic)
│   │   ├── auth/             # Authentication feature
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── products/         # Product management feature
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── orders/           # Order management feature
│   │       ├── OrderCard.tsx
│   │       ├── OrderList.tsx
│   │       ├── ShoppingCart.tsx (exports CartView)
│   │       └── index.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useApi.ts        # API data fetching hook
│   │
│   ├── services/            # API service layer
│   │   ├── api.ts          # Axios instance with interceptors
│   │   ├── productService.ts
│   │   └── orderService.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts       # All type definitions
│   │
│   ├── config/            # Configuration files
│   │   └── keycloak.ts   # Keycloak configuration
│   │
│   ├── lib/              # Utility functions
│   │   └── utils.ts     # Helper functions (cn, etc.)
│   │
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── AdminPage.tsx
│   │
│   ├── App.tsx         # Main App component with routing
│   ├── index.tsx       # Application entry point
│   └── index.css       # Global styles with Tailwind
│
├── backend-endpoints/   # API documentation
│   ├── FRONTEND_INTEGRATION_DOCS.md
│   ├── product-service.json
│   └── order-service.json
│
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── README.md           # Project documentation
└── SETUP.md           # Setup instructions

```

## Architecture Principles

### 1. Feature-Based Organization
- Each feature is self-contained in its own directory
- Features include components, logic, and types specific to that feature
- Promotes modularity and maintainability

### 2. Separation of Concerns
- **Components**: UI presentation
- **Services**: API communication
- **Hooks**: Reusable logic
- **Types**: Type definitions
- **Config**: Configuration

### 3. Component Hierarchy
```
App (Keycloak Provider)
└── Router
    └── Routes
        └── ProtectedRoute
            └── Layout
                └── Page Components
                    └── Feature Components
                        └── UI Components
```

## Key Files Explained

### `src/App.tsx`
- Main application component
- Sets up Keycloak authentication provider
- Configures routing with React Router
- Wraps routes with ProtectedRoute for authorization

### `src/components/Layout.tsx`
- Main layout wrapper
- Contains navigation header
- User profile display
- Footer

### `src/services/api.ts`
- Axios instance with base configuration
- Request interceptor: Adds JWT token to all requests
- Response interceptor: Handles token refresh on 401 errors

### `src/hooks/useAuth.ts`
- Custom hook for authentication
- Provides user info, roles, login/logout functions
- Simplifies Keycloak integration

### `src/hooks/useApi.ts`
- Generic hook for API calls
- Handles loading, error, and data states
- Provides refetch functionality

## Component Patterns

### UI Components (`components/ui/`)
- Reusable, generic components
- Based on shadcn/ui
- Accept className for customization
- Use forwardRef for ref forwarding

### Feature Components (`features/*/`)
- Business logic components
- Use UI components for presentation
- Handle feature-specific state
- Connect to services

### Page Components (`pages/`)
- Route-level components
- Compose feature components
- Minimal logic, mostly composition

## State Management

### Local State
- React useState for component-specific state
- Shopping cart in HomePage
- Form data in ProductForm

### Server State
- useApi hook for fetching data
- Automatic refetching
- Loading and error states

### Authentication State
- Managed by Keycloak
- Accessed via useAuth hook
- Token refresh handled automatically

## Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Configured with shadcn/ui design tokens
- Custom color palette in tailwind.config.js

### CSS Variables
- Defined in index.css
- Support for dark mode
- Consistent theming

### Component Styling
- Use `cn()` utility for conditional classes
- Combine Tailwind utilities
- Maintain responsive design

## API Integration

### Request Flow
1. Component calls service method
2. Service uses api instance (axios)
3. Request interceptor adds JWT token
4. Request sent to API Gateway
5. Response returned to component

### Error Handling
1. 401 Unauthorized → Token refresh attempt
2. If refresh fails → Redirect to login
3. Other errors → Returned to component
4. Component displays error message

## Type Safety

### TypeScript Benefits
- Compile-time error checking
- IntelliSense support
- Better refactoring
- Self-documenting code

### Type Definitions
- All API responses typed
- Component props typed
- Service methods typed
- Hook return values typed

## Best Practices Followed

1. **Feature-Based Structure**: Easy to locate and modify code
2. **TypeScript**: Type safety throughout
3. **Custom Hooks**: Reusable logic
4. **Service Layer**: Centralized API calls
5. **Component Composition**: Small, focused components
6. **Error Handling**: Comprehensive error management
7. **Loading States**: User feedback during async operations
8. **Responsive Design**: Works on all screen sizes
9. **Accessibility**: Semantic HTML, proper labels
10. **Code Organization**: Clear file structure

## Development Workflow

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Make Changes**
   - Edit files in `src/`
   - Hot reload updates automatically

3. **Test Features**
   - Login with different roles
   - Test CRUD operations
   - Verify error handling

4. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment

### Build Output
- Optimized bundle in `build/` directory
- Static files ready for deployment
- Can be served by any static file server

### Environment Configuration
- Update `.env` for different environments
- Configure Keycloak URLs
- Set API Gateway URL

## Future Enhancements

Potential improvements:
- Add React Query for better server state management
- Implement global state management (Redux/Zustand) if needed
- Add unit and integration tests
- Implement pagination for products/orders
- Add search and filtering
- Implement real-time updates with WebSockets
- Add product images
- Implement order tracking
- Add user profile management

## Contributing

When adding new features:
1. Create feature directory in `features/`
2. Add service methods in `services/`
3. Define types in `types/`
4. Create page component if needed
5. Update routing in `App.tsx`
6. Add to navigation in `Layout.tsx`

## License

MIT
