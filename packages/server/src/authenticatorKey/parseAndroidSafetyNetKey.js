const {
    base64ToPem,
    hash,
    convertASN1toPEM,
    convertCOSEPublicKeyToRawPKCSECDHAKey
} = require('../utils');
const { decode, verify } = require('jws');
const pem = require('pem');

exports.parseAndroidSafetyNetKey = async (authenticatorKey, clientDataJSON) => {
    const encodedJws = authenticatorKey.attStmt.response.toString();
    const jws = decode(authenticatorKey.attStmt.response);
    const payload = JSON.parse(jws.payload);

    // Check device integrity.
    if (!payload.ctsProfileMatch && !payload.basicIntegrity) {
        return undefined;
    }

    // Verify that the nonce is identical to the hash of authenticatorData + clientDataHash.
    const clientDataHash = hash(
        'SHA256',
        Buffer.from(clientDataJSON, 'base64')
    );
    const authAndClientData = Buffer.concat([authenticatorKey.authData, clientDataHash]);
    const expectedNonce = hash('SHA256', authAndClientData).toString('base64');
    if (expectedNonce !== payload.nonce) {
        return undefined;
    }

    // Verify that the SafetyNet response actually came from the SafetyNet service.
    const formattedCerts = jws.header.x5c.map(cert => base64ToPem(cert, 'CERTIFICATE'));
    const certChain = formattedCerts.slice(0).reverse()
    const leafCert = formattedCerts[0];
    try {
        const leafCertInfo = await pem.promisified.readCertificateInfo(leafCert)
        if (leafCertInfo.commonName !== 'attest.android.com') {
            throw new Error('Certificate was not issued to attest.android.com');
        }
        const verified = await pem.promisified.verifySigningChain(certChain)
        if (!verified) {
            throw new Error('Could not verifiy certificate signing chain')
        }
    } catch (err) {
        return undefined;
    }

    // Verify the signature of the JWS message.
    try {
        const leafKeyInfo = await pem.promisified.getPublicKey(leafCert)
        const publicKey = leafKeyInfo.publicKey
        if (!verify(encodedJws, jws.header.alg, publicKey)) {
          throw new Error('Could not verify JWS signature')
        }
    } catch (err) {
        return undefined;
    }

    const authenticatorData = parseAttestationData(authenticatorKey.authData);

    const publicKey = convertCOSEPublicKeyToRawPKCSECDHAKey(
        authenticatorData.COSEPublicKey
    );

    return {
        fmt: 'android-safetynet',
        publicKey: publicKey.toString('base64'),
        counter: authenticatorData.counter,
        credID: authenticatorData.credID.toString('base64'),
    };
};

exports.validateAndroidSafetyNetKey = (
    authenticatorDataBuffer,
    key,
    clientDataJSON,
    base64Signature
) => {
    const authenticatorData = parseAttestationData(authenticatorDataBuffer);

    if (!(authenticatorData.flags.up)) {
        throw new Error('User was NOT presented durring authentication!');
    }

    const clientDataHash = hash(
        'SHA256',
        Buffer.from(clientDataJSON, 'base64')
    );
    const signatureBaseBuffer = Buffer.concat([
        authenticatorDataBuffer,
        clientDataHash,
    ]);

    const publicKey = convertASN1toPEM(Buffer.from(key.publicKey, 'base64'));
    const signatureBuffer = Buffer.from(base64Signature, 'base64');

    return createVerify('sha256')
        .update(signatureBaseBuffer)
        .verify(publicKey, signatureBuffer);
};

const parseAttestationData = buffer => {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    const flagsInt = flagsBuf[0];
    const flags = {
        up: !!(flagsInt & 0x01),
        uv: !!(flagsInt & 0x04),
        at: !!(flagsInt & 0x40),
        ed: !!(flagsInt & 0x80),
        flagsInt,
    };

    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    const counter = counterBuf.readUInt32BE(0);

    let aaguid;
    let credID;
    let COSEPublicKey;

    if (flags.at) {
        aaguid = buffer.slice(0, 16);
        buffer = buffer.slice(16);
        const credIDLenBuf = buffer.slice(0, 2);
        buffer = buffer.slice(2);
        const credIDLen = credIDLenBuf.readUInt16BE(0);
        credID = buffer.slice(0, credIDLen);
        buffer = buffer.slice(credIDLen);
        COSEPublicKey = buffer;
    }

    return {
        rpIdHash,
        flagsBuf,
        flags,
        counter,
        counterBuf,
        aaguid,
        credID,
        COSEPublicKey,
    };
};
