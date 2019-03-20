const fs = require('fs');
const path = require('path');
const express = require('express');
const spdy = require('spdy');
const cors = require('cors');
const bodyParser = require('body-parser');

const {
    requestRegistrationChallenge,
    registrationCredentialsToUserKey,
    requestLoginChallenge,
    loginCredentialsToChallenge
} = require('../../packages/server/src');

const app = express();
app.use(cors());
app.use(bodyParser.json());
let users = [];

app.post('/register', (req, res) => {
    const { id, email, credentials } = req.body;

    if (credentials) {
        const key = registrationCredentialsToUserKey(credentials);

        const user = {
            email,
            keys: [key]
        };

        users = [...users.filter(user => user.email !== email), user];

        return res.send({ loggedIn: true });
    }

    const challenge = requestRegistrationChallenge({
        relyingParty: { name: 'ACME' },
        user: { id, name: email }
    });

    res.send(challenge);
});

app.post('/login', (req, res) => {
    const { email, credentials } = req.body;

    if (credentials) {
        const challenge = loginCredentialsToChallenge(credentials);
        const user = users.find(user => user.lastChallenge === challenge);

        return res.send({ loggedIn: !!user });
    }

    const user = users.find(user => user.email === email);

    if (!user) {
        return res.sendStatus(400);
    }

    const { challenge, allowCredentials } = requestLoginChallenge(user.keys);

    user.lastChallenge = challenge;
    res.send({ challenge, allowCredentials });
});

const config = {
    cert: fs.readFileSync(path.resolve(__dirname, '../tls/localhost.pem')),
    key: fs.readFileSync(path.resolve(__dirname, '../tls/localhost-key.pem'))
};

spdy.createServer(config, app).listen(8000, () => {
    console.log('Server is listening at https://localhost:8000. Ctrl^C to stop it.');
});
