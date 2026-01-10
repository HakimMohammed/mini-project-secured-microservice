import { useKeycloak } from '@react-keycloak/web';

export const useAuth = () => {
    const { keycloak, initialized } = useKeycloak();

    const isAuthenticated = keycloak.authenticated || false;
    const user = keycloak.tokenParsed;

    const hasRole = (role: string): boolean => {
        return keycloak.hasRealmRole(role);
    };

    const isAdmin = hasRole('ADMIN');
    const isClient = hasRole('CLIENT');

    const login = () => {
        keycloak.login();
    };

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const getUserInfo = () => {
        if (!user) return null;
        return {
            id: user.sub,
            username: user.preferred_username,
            email: user.email,
            name: user.name,
            roles: user.realm_access?.roles || [],
        };
    };

    return {
        initialized,
        isAuthenticated,
        user: getUserInfo(),
        isAdmin,
        isClient,
        hasRole,
        login,
        logout,
        keycloak,
    };
};
