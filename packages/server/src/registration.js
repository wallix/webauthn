const { randomBase64Buffer } = require('./utils');
const { validateRegistrationCredentials } = require('./validation');
const { getAuthenticatorKeyId, parseAuthenticatorKey } = require('./authenticatorKey');

exports.requestRegistrationChallenge = ({ relyingParty, user } = {}) => {
    if (!relyingParty || !relyingParty.name || typeof relyingParty.name !== 'string') {
        throw new Error('The typeof relyingParty.name should be a string');
    }

    if (!user || !user.id || !user.name || typeof user.id !== 'string' || typeof user.name !== 'string') {
        throw new Error('The user should have an id (string) and a name (string)');
    }

    return {
        challenge: randomBase64Buffer(32),
        rp: {
            id: relyingParty.id,
            name: relyingParty.name
        },
        user: {
            id: Buffer.from(user.id).toString('base64'),
            displayName: user.displayName || user.name,
            name: user.name
        },
        attestation: 'direct',
        pubKeyCredParams: [
            {
                type: 'public-key',
                alg: -7 // "ES256" IANA COSE Algorithms registry
            }
        ]
    };
};

exports.registrationCredentialsToUserKey = credentials => {
    if (!validateRegistrationCredentials(credentials)) {
        throw new Error('Registration credentials are invalid');
    }

    const id = getAuthenticatorKeyId(credentials.id);
    const key = parseAuthenticatorKey(credentials.response);

    return { id, key };
};
