const { decodeAllSync } = require('cbor');

const { randomBase64Buffer } = require('./utils');
const { getChallengeFromClientData } = require('./getChallengeFromClientData');
const { parseFidoU2FKey } = require('./authenticatorKey/parseFidoU2FKey');
const { parseFidoPackedKey } = require('./authenticatorKey/parseFidoPackedKey');
const { validateRegistrationCredentials } = require('./validation');

const parseAuthenticatorKey = (webAuthnResponse) => {
    const authenticatorKeyBuffer = Buffer.from(
        webAuthnResponse.attestationObject,
        'base64'
    );
    const authenticatorKey = decodeAllSync(authenticatorKeyBuffer)[0];

    if (authenticatorKey.fmt === 'fido-u2f') {
        return parseFidoU2FKey(
            authenticatorKey,
            webAuthnResponse.clientDataJSON
        );
    }

    if (authenticatorKey.fmt === 'packed') {
        return parseFidoPackedKey(
            authenticatorKey,
            webAuthnResponse.clientDataJSON
        );
    }

    return undefined;
};

exports.parseRegisterRequest = (body) => {
    if (!validateRegistrationCredentials(body)) {
        return {};
    }
    const challenge = getChallengeFromClientData(body.response.clientDataJSON);
    const key = parseAuthenticatorKey(body.response);

    return {
        challenge,
        key,
    };
};

exports.generateRegistrationChallenge = ({ relyingParty, user, attestation = 'direct' } = {}) => {
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
        attestation,
        pubKeyCredParams: [
            {
                type: 'public-key',
                alg: -7 // "ES256" IANA COSE Algorithms registry
            }
        ]
    };
};
