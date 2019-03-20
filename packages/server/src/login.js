const { randomBase64Buffer } = require('./utils');
const { validateLoginCredentials } = require('./validation');

exports.requestLoginChallenge = userKeys => {
    const keys = userKeys.map(({ key }) => key);

    const allowCredentials = keys.map(key => ({
        type: 'public-key',
        id: key.credID,
        transports: ['usb', 'nfc', 'ble']
    }));

    return {
        challenge: randomBase64Buffer(32),
        allowCredentials
    };
};

const getChallenge = clientDataJSON => {
    const clientDataBuffer = Buffer.from(clientDataJSON, 'base64');
    const clientData = JSON.parse(clientDataBuffer.toString());
    const challenge = Buffer.from(clientData.challenge, 'base64');
    return challenge.toString('base64');
};

exports.loginCredentialsToChallenge = credentials => {
    if (!validateLoginCredentials(credentials)) {
        throw new Error('Login credentials are invalid');
    }

    return getChallenge(credentials.response.clientDataJSON);
};
