import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'eshop-realm',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'react-frontend'
});

export default keycloak;
