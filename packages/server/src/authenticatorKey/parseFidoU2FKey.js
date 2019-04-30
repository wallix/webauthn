const {
    U2F_USER_PRESENTED,
    hash,
    convertASN1toPEM,
    verifySignature,
    convertCOSEPublicKeyToRawPKCSECDHAKey,
} = require('../utils');

exports.parseFidoU2FKey = (authenticatorKey, clientDataJSON) => {
    const authenticatorData = parseAttestationData(authenticatorKey.authData);

    if (!(authenticatorData.flags & U2F_USER_PRESENTED)) {
        throw new Error('User was NOT presented during authentication!');
    }

    const clientDataHash = hash(
        'SHA256',
        Buffer.from(clientDataJSON, 'base64')
    );
    const reservedByte = Buffer.from([0x00]);
    const publicKey = convertCOSEPublicKeyToRawPKCSECDHAKey(
        authenticatorData.COSEPublicKey
    );
    const signatureBase = Buffer.concat([
        reservedByte,
        authenticatorData.rpIdHash,
        clientDataHash,
        authenticatorData.credID,
        publicKey,
    ]);

    const PEMCertificate = convertASN1toPEM(authenticatorKey.attStmt.x5c[0]);
    const signature = authenticatorKey.attStmt.sig;

    const verified = verifySignature(signature, signatureBase, PEMCertificate);

    if (verified) {
        return {
            fmt: 'fido-u2f',
            publicKey: publicKey.toString('base64'),
            counter: authenticatorData.counter,
            credID: authenticatorData.credID.toString('base64'),
        };
    }

    return undefined;
};

exports.validateFidoU2FKey = (
    authenticatorDataBuffer,
    key,
    clientDataJSON,
    base64Signature
) => {
    const authenticatorData = parseAssertionData(authenticatorDataBuffer);

    if (!(authenticatorData.flags & U2F_USER_PRESENTED)) {
        throw new Error('User was NOT presented durring authentication!');
    }

    const clientDataHash = hash(
        'SHA256',
        Buffer.from(clientDataJSON, 'base64')
    );
    const signatureBase = Buffer.concat([
        authenticatorData.rpIdHash,
        authenticatorData.flagsBuf,
        authenticatorData.counterBuf,
        clientDataHash,
    ]);

    const publicKey = convertASN1toPEM(Buffer.from(key.publicKey, 'base64'));
    const signature = Buffer.from(base64Signature, 'base64');

    return verifySignature(signature, signatureBase, publicKey);
};

const parseAttestationData = (buffer) => {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    const flags = flagsBuf[0];
    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    const counter = counterBuf.readUInt32BE(0);
    const aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    const credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    const credIDLen = credIDLenBuf.readUInt16BE(0);
    const credID = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);
    const COSEPublicKey = buffer;

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

const parseAssertionData = (buffer) => {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    const flags = flagsBuf[0];
    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    const counter = counterBuf.readUInt32BE(0);

    return {
        rpIdHash,
        flagsBuf,
        flags,
        counter,
        counterBuf,
    };
};
