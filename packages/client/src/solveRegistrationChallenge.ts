import { credentialToJSON, AttestationCredential, stringToBuffer } from './utils';

/**
 * JSON-ified options to be passed into navigator.credentials.create(). These values are requested
 * from the Relying Party (see `server > generateRegistrationChallenge()`), which responds with JSON
 * containing ArrayBuffers converted to base64-encoded strings.
 */
export interface RegistrationChallengeJSON extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'user'> {
    challenge: string; // A base64-encoded Buffer
    user: {
        id: string; // A base64-encoded Buffer
        displayName: string;
        name: string;
    },
}

/**
 * Convert JSON-ified credential options into values for use in navigator.credentials.create()
 */
export function registrationChallengeToPublicKey (challenge: RegistrationChallengeJSON): PublicKeyCredentialCreationOptions {
    return {
        ...challenge,
        challenge: stringToBuffer(challenge.challenge),
        user: {
            ...challenge.user,
            id: stringToBuffer(challenge.user.id),
        },
    };
}

/**
 * Initiate the Webauthn Attestation process, then convert the results to JSON to POST back to the
 * Relying Party (see `server > parseRegisterRequest()`)
 */
export async function solveRegistrationChallenge (challenge: RegistrationChallengeJSON) {
    const publicKey = registrationChallengeToPublicKey(challenge);
    const credential = (await navigator.credentials.create({ publicKey }) as AttestationCredential);

    return credentialToJSON(credential);
}
