import  { publicKeyCredentialToJSON, AssertionCredential, stringToBuffer } from './utils';

/**
 * JSON representation of an allowed Webauthn credential
 */
export interface AllowedCredentialJSON extends Omit<PublicKeyCredentialDescriptor, 'id'> {
    id: string; // A base64-encoded Buffer
}

/**
 * JSON-ified options to be passed into navigator.credentials.get(). These values are requested
 * from the Relying Party (see `server > generateLoginChallenge()`), which responds with JSON
 * containing ArrayBuffers converted to base64-encoded strings.
 */
export interface LoginChallengeJSON extends Omit<PublicKeyCredentialRequestOptions, 'challenge' | 'allowCredentials'> {
    challenge: string; // A base64-encoded Buffer
    allowCredentials: AllowedCredentialJSON[];
}

/**
 * Convert JSON-ified credential options into values for use in navigator.credentials.get()
 */
function loginChallengeToPublicKey (challenge: LoginChallengeJSON): PublicKeyCredentialRequestOptions {
    let allowCredentials: PublicKeyCredentialDescriptor[];
    if (Array.isArray(challenge.allowCredentials) && challenge.allowCredentials.length > 0) {
        allowCredentials = challenge.allowCredentials.map(allowCredential => ({
            ...allowCredential,
            id: stringToBuffer(allowCredential.id),
        }));
    }

    return {
        ...challenge,
        challenge: stringToBuffer(challenge.challenge),
        // @ts-ignore 2454
        allowCredentials,
    };
};

/**
 * Initiate the Webauthn Assertion process, then convert the results to JSON to POST back to the
 * Relying Party (see `server > parseLoginRequest()`)
 */
export const solveLoginChallenge = async (challenge: LoginChallengeJSON) => {
    const publicKey = loginChallengeToPublicKey(challenge);
    const credentials = (await navigator.credentials.get({ publicKey }) as AssertionCredential);

    return publicKeyCredentialToJSON(credentials);
};
