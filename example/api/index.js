const fs = require('fs');
const path = require('path');
const express = require('express');
const spdy = require('spdy');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRepository = require('./userRepository');
const {
    generateRegistrationChallenge,
    parseRegisterRequest,
    generateLoginChallenge,
    parseLoginRequest,
    verifyAuthenticatorAssertion,
} = require('@webauthn/server');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/request-register', (req, res) => {
    const { id, email } = req.body;

    const challengeResponse = generateRegistrationChallenge({
        relyingParty: { name: 'ACME' },
        user: { id, name: email }
    });

    userRepository.create({
        id,
        email,
        challenge: challengeResponse.challenge,
    })

    res.send(challengeResponse);
});

app.post('/register', (req, res) => {
    const { key, challenge } = parseRegisterRequest(req.body);

    const user = userRepository.findByChallenge(challenge);

    if (!user) {
        return res.sendStatus(400);
    }

    userRepository.addKeyToUser(user, key);

    return res.send({ loggedIn: true });
});

app.post('/login', (req, res) => {
    const { email } = req.body;

    const user = userRepository.findByEmail(email);

    if (!user) {
        return res.sendStatus(400);
    }

    const assertionChallenge = generateLoginChallenge(user.key);

    userRepository.updateUserChallenge(user, assertionChallenge.challenge);

    res.send(assertionChallenge);
});

app.post('/login-challenge', (req, res) => {
    const { challenge, keyId } = parseLoginRequest(req.body);
    if (!challenge) {
        return res.sendStatus(400);
    }
    const user = userRepository.findByChallenge(challenge);

    if (!user || !user.key || user.key.credID !== keyId) {
        return res.sendStatus(400);
    }

    const loggedIn = verifyAuthenticatorAssertion(req.body, user.key);

    return res.send({ loggedIn });
});

const config = {
    cert: fs.readFileSync(path.resolve(__dirname, '../tls/localhost.pem')),
    key: fs.readFileSync(path.resolve(__dirname, '../tls/localhost-key.pem'))
};

spdy.createServer(config, app).listen(8000, () => {
    console.log('Server is listening at https://localhost:8000. Ctrl^C to stop it.');
});
