import { publicKeyCredentialToJSON } from './utils';

const registrationChallengeToPublicKey = credentialsChallengeRequest => {
    const { Unibabel } = require('unibabel');

    return {
        ...credentialsChallengeRequest,
        challenge: Unibabel.base64ToBuffer(
            credentialsChallengeRequest.challenge
        ),
        user: {
            ...credentialsChallengeRequest.user,
            id: Unibabel.base64ToBuffer(credentialsChallengeRequest.user.id),
        },
    };
};

export const solveRegistrationChallenge = async credentialsChallengeRequest => {
    const publicKey = registrationChallengeToPublicKey(
        credentialsChallengeRequest
    );
    const credentials = await navigator.credentials.create({
        publicKey,
    });

    return publicKeyCredentialToJSON(credentials);
};