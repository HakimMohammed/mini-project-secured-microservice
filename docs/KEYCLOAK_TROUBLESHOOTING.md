# Keycloak Authentication Troubleshooting Guide

## Issue: No Redirection to Keycloak Login

If the application loads but doesn't redirect to Keycloak for authentication, follow these steps:

### 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for:

- **Keycloak events**: Look for logs like `Keycloak event: onReady`, `onAuthSuccess`, or `onInitError`
- **Error messages**: Any red error messages related to Keycloak
- **Network errors**: Failed requests to `http://localhost:9090`

### 2. Verify Keycloak is Running

```bash
# Test if Keycloak is accessible
curl http://localhost:9090

# Or open in browser
http://localhost:9090
```

**Expected**: You should see the Keycloak welcome page or admin console

### 3. Check Keycloak Client Configuration

In Keycloak Admin Console (`http://localhost:9090`):

1. Go to **Clients** → **react-frontend**
2. Verify these settings:

```
✅ Client ID: react-frontend
✅ Client Protocol: openid-connect
✅ Access Type: public
✅ Standard Flow Enabled: ON
✅ Direct Access Grants Enabled: ON
✅ Valid Redirect URIs: http://localhost:3000/*
✅ Web Origins: *
✅ Root URL: http://localhost:3000
✅ Base URL: /
```

### 4. Common Issues & Solutions

#### Issue A: "Failed to fetch" or CORS errors

**Cause**: Keycloak is not running or not accessible

**Solution**:
```bash
# Start Keycloak
docker-compose up keycloak
# OR
./kc.sh start-dev
```

#### Issue B: Infinite loading screen

**Cause**: Keycloak client misconfiguration

**Solution**:
1. Check that `clientId` in `src/config/keycloak.ts` matches Keycloak
2. Verify redirect URIs include `http://localhost:3000/*`
3. Ensure "Standard Flow Enabled" is ON

#### Issue C: "Invalid redirect URI"

**Cause**: Redirect URI not configured in Keycloak

**Solution**:
Add to Valid Redirect URIs in Keycloak client:
- `http://localhost:3000/*`
- `http://localhost:3000`

#### Issue D: Application loads without authentication

**Cause**: `onLoad` setting or ProtectedRoute not working

**Solution**:
Check that:
1. `initOptions.onLoad` is set to `'login-required'` in App.tsx
2. Routes are wrapped with `<ProtectedRoute>`

### 5. Debug Mode

The application now includes debug logging. Check console for:

```javascript
// Successful initialization
Keycloak event: onReady
Keycloak event: onAuthSuccess
Keycloak tokens received: { token: 'present', refreshToken: 'present' }

// Failed initialization
Keycloak event: onInitError [error details]
Keycloak event: onAuthError [error details]
```

### 6. Manual Test

Try accessing Keycloak directly:

```
http://localhost:9090/realms/eshop-realm/.well-known/openid-configuration
```

**Expected**: JSON response with Keycloak configuration

### 7. Network Tab Check

In Browser DevTools → Network tab:

1. Look for requests to `localhost:9090`
2. Check if there's a redirect to Keycloak login page
3. Verify the redirect URL includes your client ID

### 8. Quick Fix Checklist

- [ ] Keycloak is running on port 9090
- [ ] Realm `eshop-realm` exists
- [ ] Client `react-frontend` exists and is configured
- [ ] Valid Redirect URIs includes `http://localhost:3000/*`
- [ ] Standard Flow is enabled
- [ ] Web Origins allows `*` or `http://localhost:3000`
- [ ] Browser console shows no CORS errors
- [ ] Application is running on port 3000

### 9. Alternative Configuration

If issues persist, try this simpler Keycloak init:

**src/App.tsx** - Change initOptions to:

```typescript
initOptions={{
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
}}
```

Then manually trigger login in ProtectedRoute if not authenticated.

### 10. Test with Direct Login

Create a test button to manually trigger login:

```typescript
// Add to any component
import { useKeycloak } from '@react-keycloak/web';

const TestLogin = () => {
    const { keycloak } = useKeycloak();
    
    return (
        <button onClick={() => keycloak.login()}>
            Manual Login Test
        </button>
    );
};
```

### 11. Verify Keycloak Configuration

Your Keycloak config should have:

```json
{
  "clients": [
    {
      "clientId": "react-frontend",
      "enabled": true,
      "publicClient": true,
      "protocol": "openid-connect",
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["*"],
      "rootUrl": "http://localhost:3000",
      "baseUrl": "/"
    }
  ]
}
```

### 12. Check Keycloak Logs

If using Docker:
```bash
docker logs keycloak-container-name
```

Look for errors related to:
- Client registration
- Redirect URI validation
- CORS issues

### 13. Still Not Working?

1. **Clear browser cache** and cookies
2. **Try incognito/private mode**
3. **Check firewall** - ensure ports 3000 and 9090 are accessible
4. **Restart services**:
   ```bash
   # Stop frontend
   Ctrl+C
   
   # Restart Keycloak
   docker-compose restart keycloak
   
   # Start frontend
   npm start
   ```

### 14. Expected Flow

When working correctly:

1. User opens `http://localhost:3000`
2. App shows "Initializing authentication..."
3. Browser redirects to `http://localhost:9090/realms/eshop-realm/protocol/openid-connect/auth?...`
4. Keycloak login page appears
5. User enters credentials
6. Keycloak redirects back to `http://localhost:3000`
7. App loads with user authenticated

### Need More Help?

Check the browser console logs and provide:
- Any error messages
- Keycloak event logs
- Network tab screenshot showing requests to Keycloak
