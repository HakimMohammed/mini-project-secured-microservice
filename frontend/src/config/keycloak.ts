import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:9090',
    realm: 'eshop-realm',
    clientId: 'react-frontend'
});

export default keycloak;
