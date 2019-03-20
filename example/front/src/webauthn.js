import { Unibabel } from 'unibabel';

export const registrationChallengeToPublicKey = challenge => ({
    ...challenge,
    challenge: Unibabel.base64ToBuffer(challenge.challenge),
    user: {
        ...challenge.user,
        id: Unibabel.base64ToBuffer(challenge.user.id)
    }
});

export const loginChallengeToPublicKey = ({ challenge, allowCredentials }) => ({
    challenge: Unibabel.base64ToBuffer(challenge),
    allowCredentials: allowCredentials.map(allowCredential => ({
        ...allowCredential,
        id: Unibabel.base64ToBuffer(allowCredential.id)
    }))
});

const serializeBuffersToJSON = item => {
    if (item instanceof Array) {
        return item.map(serializeBuffersToJSON);
    }

    if (item instanceof ArrayBuffer) {
        // ArrayBuffer must be converted to typed arrays
        return Unibabel.bufferToBase64(new Uint8Array(item));
    }

    if (item instanceof Object) {
        const obj = {};

        for (const key in item) {
            obj[key] = serializeBuffersToJSON(item[key]);
        }

        return obj;
    }

    return item;
};

export const publicKeyToJSON = serializeBuffersToJSON;
