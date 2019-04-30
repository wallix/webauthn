import  { publicKeyCredentialToJSON } from './utils';

const loginChallengeToPublicKey = getAssert => {
    const { Unibabel } = require('unibabel');

    return {
        ...getAssert,
        challenge: Unibabel.base64ToBuffer(getAssert.challenge),
        allowCredentials: getAssert.allowCredentials.map(allowCredential => ({
            ...allowCredential,
            id: Unibabel.base64ToBuffer(allowCredential.id),
        })),
    };
};

export const solveLoginChallenge = async credentialsChallengeRequest => {
    const publicKey = loginChallengeToPublicKey(credentialsChallengeRequest);

    // @ts-ignore
    const credentials = await navigator.credentials.get({
        publicKey,
    });

    return publicKeyCredentialToJSON(credentials);
};