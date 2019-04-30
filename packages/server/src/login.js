const { randomBase64Buffer, parseBrowserBufferString } = require('./utils');
const { getChallengeFromClientData } = require('./getChallengeFromClientData');
const { validateFidoPackedKey } = require('./authenticatorKey/parseFidoPackedKey');
const { validateFidoU2FKey } = require('./authenticatorKey/parseFidoU2FKey');
const { validateLoginCredentials } = require('./validation');

exports.generateLoginChallenge = key => {
    const keys = [].concat(key); // convert key to array if its not
    const allowCredentials = keys.map(({ credID }) => ({
        type: 'public-key',
        id: credID,
        transports: ['usb', 'nfc', 'ble'],
    }));

    return {
        challenge: randomBase64Buffer(32),
        allowCredentials,
    };
};

exports.parseLoginRequest = (body) => {
    if (!validateLoginCredentials(body)) {
        return {};
    }
    const challenge = getChallengeFromClientData(body.response.clientDataJSON);
    const keyId = parseBrowserBufferString(body.id);

    return {
        challenge,
        keyId,
    };
};

exports.verifyAuthenticatorAssertion = (data, key) => {
    const authenticatorDataBuffer = Buffer.from(
        data.response.authenticatorData,
        'base64'
    );

    if (key.fmt === 'fido-u2f') {
        return validateFidoU2FKey(
            authenticatorDataBuffer,
            key,
            data.response.clientDataJSON,
            data.response.signature
        );
    }

    if (key.fmt === 'packed') {
        return validateFidoPackedKey(
            authenticatorDataBuffer,
            key,
            data.response.clientDataJSON,
            data.response.signature
        );
    }

    return false;
};
