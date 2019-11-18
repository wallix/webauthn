export const publicKeyCredentialToJSON = item => {
    if (item instanceof Array) {
        return item.map(publicKeyCredentialToJSON);
    }

    if (item instanceof ArrayBuffer) {
        const { Unibabel } = require('unibabel');
        // ArrayBuffer must be converted to typed arrays
        return Unibabel.bufferToBase64(new Uint8Array(item));
    }

    if (item instanceof Object) {
        const obj = {};

        // eslint-disable-next-line guard-for-in
        for (const key in item) {
            obj[key] = publicKeyCredentialToJSON(item[key]);
        }

        return obj;
    }

    return item;
};
