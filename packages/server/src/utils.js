const { createHash, createVerify, randomBytes } = require('crypto');

exports.randomBase64Buffer = (len = 32) => {
    const buff = randomBytes(len);

    return buff.toString('base64');
};

/**
 * U2F Presence constant
 */
const U2F_USER_PRESENTED = 0x01;
exports.U2F_USER_PRESENTED = U2F_USER_PRESENTED;

/**
 * Returns a digest of the given data.
 */
exports.hash = (alg, data) =>
    createHash(alg)
        .update(data)
        .digest();

/**
 * Convert binary certificate or public key to an OpenSSL-compatible PEM text format.
 */
exports.convertASN1toPEM = pkBuffer => {
    if (!Buffer.isBuffer(pkBuffer)) {
        throw new Error('ASN1toPEM: pkBuffer must be Buffer.');
    }

    let type;
    if (pkBuffer.length === 65 && pkBuffer[0] === 0x04) {
        /*
            If needed, we encode rawpublic key to ASN structure, adding metadata:
            SEQUENCE {
              SEQUENCE {
                 OBJECTIDENTIFIER 1.2.840.10045.2.1 (ecPublicKey)
                 OBJECTIDENTIFIER 1.2.840.10045.3.1.7 (P-256)
              }
              BITSTRING <raw public key>
            }
            Luckily, to do that, we just need to prefix it with constant 26 bytes (metadata is constant).
        */
        pkBuffer = Buffer.concat([
            Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex'),
            pkBuffer
        ]);

        type = 'PUBLIC KEY';
    } else {
        type = 'CERTIFICATE';
    }

    const b64cert = pkBuffer.toString('base64');

    const PEMKeyMatches = b64cert.match(/.{1,64}/g);

    if (!PEMKeyMatches) {
        throw new Error('Invalid key');
    }

    const PEMKey = PEMKeyMatches.join('\n');

    return `-----BEGIN ${type}-----\n` + PEMKey + `\n-----END ${type}-----\n`;
};

/**
 * Takes signature, data and PEM public key and tries to verify signature
 */
exports.verifySignature = (signature, data, publicKey) => {
    return createVerify('SHA256')
        .update(data)
        .verify(publicKey, signature);
};

exports.randomBase64Buffer = (len = 32) => {
    const buff = randomBytes(len);

    return buff.toString('base64');
};
