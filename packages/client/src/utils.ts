import { Unibabel } from 'unibabel';

/**
 * Values returned from navigator.credentials.create()
 */
export interface AttestationCredential extends PublicKeyCredential {
    rawId: ArrayBuffer;
    response: AuthenticatorAttestationResponse;
}

/**
 * AttestationCredentials with ArrayBuffers converted to base64-encoded strings for JSON
 * compatibility
 */
export interface AttestationCredentialJSON extends Omit<AttestationCredential, 'rawId' | 'response'> {
    rawId: string;
    response: {
        attestationObject: string;
        clientDataJSON: string;
    }
}

/**
 * Values returned from navigator.credentials.get()
 */
export interface AssertionCredential extends PublicKeyCredential {
    rawId: ArrayBuffer;
    response: AuthenticatorAssertionResponse;
}

/**
 * AssertionCredentials with ArrayBuffers converted to base64-encoded strings for JSON
 * compatibility
 */
export interface AssertionCredentialJSON extends Omit<AssertionCredential, 'rawId' | 'response'> {
    rawId: string;
    response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
        userHandle: string;
    }
}

type WebauthnCredential = AttestationCredential | AssertionCredential;
type WebauthnCredentialJSON = AttestationCredentialJSON | AssertionCredentialJSON;

/**
 * Convenience method for converting an ArrayBuffer to a base64-encoded string
 */
export function bufferToString(input: ArrayBuffer): string {
    return Unibabel.bufferToBase64(new Uint8Array(input));
}

/**
 * Convenience method for converting a base64-encoded string to an ArrayBuffer
 */
export function stringToBuffer(input: string): ArrayBuffer {
    return Unibabel.base64ToBuffer(input);
}

export function publicKeyCredentialToJSON (credential: WebauthnCredential): WebauthnCredentialJSON {
    if ('attestationObject' in credential.response) {
        return {
            ...credential,
            rawId: bufferToString(credential.rawId),
            response: {
                attestationObject: bufferToString(credential.response.attestationObject),
                clientDataJSON: bufferToString(credential.response.clientDataJSON),
            },
        } as AttestationCredentialJSON;
    } else {
        return {
            ...credential,
            rawId: bufferToString(credential.rawId),
            response: {
                authenticatorData: bufferToString(credential.response.authenticatorData),
                clientDataJSON: bufferToString(credential.response.clientDataJSON),
                signature: bufferToString(credential.response.signature),
                userHandle: bufferToString(credential.response.userHandle),
            }
        } as AssertionCredentialJSON;
    }
};
