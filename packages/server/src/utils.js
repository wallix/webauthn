const { decodeAllSync } = require('cbor');
const { createHash, createVerify, randomBytes } = require('crypto');

/**
 * U2F Presence constant
 */
exports.U2F_USER_PRESENTED = 0x01;

/**
 * Returns a digest of the given data.
 */
exports.hash = (alg, data) => {
    return createHash(alg)
        .update(data)
        .digest();
};

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
            Buffer.from(
                '3059301306072a8648ce3d020106082a8648ce3d030107034200',
                'hex'
            ),
            pkBuffer,
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
 * Takes COSE encoded public key and converts it to RAW PKCS ECDHA key
 * @param  {Buffer} cosePublicKey - COSE encoded public key
 * @return {Buffer}               - RAW PKCS encoded public key
 */
exports.convertCOSEPublicKeyToRawPKCSECDHAKey = cosePublicKey => {
    /* 
    +------+-------+-------+---------+----------------------------------+
    | name | key   | label | type    | description                      |
    |      | type  |       |         |                                  |
    +------+-------+-------+---------+----------------------------------+
    | crv  | 2     | -1    | int /   | EC Curve identifier - Taken from |
    |      |       |       | tstr    | the COSE Curves registry         |
    |      |       |       |         |                                  |
    | x    | 2     | -2    | bstr    | X Coordinate                     |
    |      |       |       |         |                                  |
    | y    | 2     | -3    | bstr /  | Y Coordinate                     |
    |      |       |       | bool    |                                  |
    |      |       |       |         |                                  |
    | d    | 2     | -4    | bstr    | Private key                      |
    +------+-------+-------+---------+----------------------------------+
    */

    const coseStruct = decodeAllSync(cosePublicKey)[0];
    const tag = Buffer.from([0x04]);
    const x = coseStruct.get(-2);
    const y = coseStruct.get(-3);

    return Buffer.concat([tag, x, y]);
};

/**
 * Takes signature, data and PEM public key and tries to verify signature
 */
exports.verifySignature = (
    signature,
    data,
    publicKey
) => {
    return createVerify('SHA256')
        .update(data)
        .verify(publicKey, signature);
};

exports.randomBase64Buffer = (len = 32) => {
    const buff = randomBytes(len);

    return buff.toString('base64');
};

// parse base64 from the browser
exports.parseBrowserBufferString = (key_id) => {
    const buffer = Buffer.from(key_id, 'base64');
    return buffer.toString('base64');
};
