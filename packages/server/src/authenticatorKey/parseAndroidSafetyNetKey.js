const {
    base64ToPem,
    hash,
    convertASN1toPEM,
    convertCOSEPublicKeyToRawPKCSECDHAKey
} = require('../utils');
const { createVerify } = require('crypto');
const jsrsasign = require('jsrsasign');
const { decode, verify } = require('jws');

const gsr2 = 'MIIDujCCAqKgAwIBAgILBAAAAAABD4Ym5g0wDQYJKoZIhvcNAQEFBQAwTDEgMB4GA1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjIxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMDYxMjE1MDgwMDAwWhcNMjExMjE1MDgwMDAwWjBMMSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEGA1UEChMKR2xvYmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbPJA6+Lm8omUVCxKs+IVSbC9N/hHD6ErPLv4dfxn+G07IwXNb9rfF73OX4YJYJkhD10FPe+3t+c4isUoh7SqbKSaZeqKeMWhG8eoLrvozps6yWJQeXSpkqBy+0Hne/ig+1AnwblrjFuTosvNYSuetZfeLQBoZfXklqtTleiDTsvHgMCJiEbKjNS7SgfQx5TfC4LcshytVsW33hoCmEofnTlEnLJGKRILzdC9XZzPnqJworc5HGnRusyMvo4KD0L5CLTfuwNhv2GXqF4G3yYROIXJ/gkwpRl4pazq+r1feqCapgvdzZX99yqWATXgAByUr6P6TqBwMhAo6CygPCm48CAwEAAaOBnDCBmTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm+IHV2ccHsBqBt5ZtJot39wZhi4wNgYDVR0fBC8wLTAroCmgJ4YlaHR0cDovL2NybC5nbG9iYWxzaWduLm5ldC9yb290LXIyLmNybDAfBgNVHSMEGDAWgBSb4gdXZxwewGoG3lm0mi3f3BmGLjANBgkqhkiG9w0BAQUFAAOCAQEAmYFThxxol4aR7OBKuEQLq4GsJ0/WwbgcQ3izDJr86iw8bmEbTUsp9Z8FHSbBuOmDAGJFtqkIk7mpM0sYmsL4h4hO291xNBrBVNpGP+DTKqttVCL1OmLNIG+6KYnX3ZHu01yiPqFbQfXf5WRDLenVOavSot+3i9DAgBkcRcAtjOj4LaR0VknFBbVPFd5uRHg5h6h+u/N5GJG79G+dwfCMNYxdAfvDbbnvRG15RjF+Cv6pgsH/76tuIMRQyV+dTZsXjAzlAcmgQWpzU/qlULRuJQ/7TBj0/VLZjmmx6BEP3ojY+x1J96relc8geMJgEtslQIxq/H5COEBkEveegeGTLg==';


const getCertificateSubject = (certificate) => {
    const subjectCert = new jsrsasign.X509();
    subjectCert.readCertPEM(certificate);

    const subjectString = subjectCert.getSubjectString();
    const subjectFields = subjectString.slice(1).split('/');

    let fields = {};
    for (let field of subjectFields) {
        const [ key, val ] = field.split('=');
        fields[key] = val;
    }

    return fields;
}

const verifySigningChain = (certificates) => {
    if ((new Set(certificates)).size !== certificates.length) {
        throw new Error('Failed to validate certificates path! Duplicate certificates detected!');
    }

    certificates.forEach((subjectPem, i) => {
        const subjectCert = new jsrsasign.X509();
        subjectCert.readCertPEM(subjectPem);

        let issuerPem = '';
        if (i + 1 >= certificates.length)
            issuerPem = subjectPem;
        else
            issuerPem = certificates[i + 1];

        const issuerCert = new jsrsasign.X509();
        issuerCert.readCertPEM(issuerPem);

        if (subjectCert.getIssuerString() !== issuerCert.getSubjectString()) {
            throw new Error(`Failed to validate certificate path! Issuers don't match!`);
        }

        const subjectCertStruct = jsrsasign.ASN1HEX.getTLVbyList(subjectCert.hex, 0, [0]);
        const algorithm         = subjectCert.getSignatureAlgorithmField();
        const signatureHex      = subjectCert.getSignatureValueHex();

        const signature = new jsrsasign.crypto.Signature({ alg: algorithm });
        signature.init(issuerPem);
        signature.updateHex(subjectCertStruct);

        if (!signature.verify(signatureHex)) {
            throw new Error('Failed to validate certificate path! Signature is not valid!');
        }
    })
}

exports.parseAndroidSafetyNetKey = (authenticatorKey, clientDataJSON) => {
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
    const formattedCerts = jws.header.x5c.concat([gsr2]).map(cert => base64ToPem(cert, 'CERTIFICATE'));
    const leafCert = formattedCerts[0];
    const subject = getCertificateSubject(leafCert);
    if (subject.CN !== 'attest.android.com') {
        return undefined;
    }
    try {
        verifySigningChain(formattedCerts);
    } catch (err) {
        return undefined;
    }

    // Verify the signature of the JWS message.
    const leafCertX509 = new jsrsasign.X509();
    leafCertX509.readCertPEM(leafCert);
    const leafPublicKey = Buffer.from(leafCertX509.getPublicKeyHex(), 'hex').toString('base64');
    const leafPublicKeyPem = base64ToPem(leafPublicKey, 'PUBLIC KEY');
    if (!verify(encodedJws, jws.header.alg, leafPublicKeyPem)) {
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
