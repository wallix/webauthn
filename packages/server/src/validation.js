const validateCredentials = credentials => {
    if (
        !credentials.id ||
        !credentials.rawId ||
        !credentials.type ||
        credentials.type !== 'public-key' ||
        !credentials.response ||
        !credentials.response.clientDataJSON
    ) {
        return false;
    }

    return true;
};

exports.validateRegistrationCredentials = credentials =>
    validateCredentials(credentials) && !!credentials.response.attestationObject;

exports.validateLoginCredentials = credentials =>
    validateCredentials(credentials) && credentials.response.authenticatorData;
