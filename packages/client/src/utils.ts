import { Unibabel } from 'unibabel';

type Credential = ArrayBuffer[] | ArrayBuffer | { [key: string]: Credential };
type CredentialJSON = string | Object | (string | Object)[];

export const publicKeyCredentialToJSON = (item: Credential): CredentialJSON => {
    if (item instanceof Array) {
        return item.map(publicKeyCredentialToJSON);
    }

    if (item instanceof ArrayBuffer) {
        // ArrayBuffer must be converted to typed arrays
        return Unibabel.bufferToBase64(new Uint8Array(item));
    }

    if (item instanceof Object) {
        const obj: { [key: string]: CredentialJSON } = {};

        // tslint:disable-next-line
        for (const key in item) {
            obj[key] = publicKeyCredentialToJSON(item[key]);
        }

        return obj;
    }

    return item;
};
