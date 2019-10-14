# webauthn

Implementation of strong authentication with the webauthn standard and FIDO2.
Strong authentication is an authentication method using a physical key.

For a more thorough introduction see these two nice articles:

- [introduction](https://medium.com/@herrjemand/introduction-to-webauthn-api-5fd1fb46c285)
- [verifying fido2 responses](https://medium.com/@herrjemand/verifying-fido2-responses-4691288c8770)

## Installation

```js
npm install @webauthn/client
npm install @webauthn/server
```

## usage

`Webauthn` is composed of two parts `@webauthn/client` and `@webauthn/server`

### On the browser

```js
import { 
    solveRegistrationChallenge,
    solveLoginChallenge
} from '@webauthn/client';
```

- `solveRegistrationChallenge`:
    convert the challenge returned by the server on the register route into the response to be returned
- `solveLoginChallenge`:
    convert the challenge returned by the server on the login route into the response to be returned

See an example in example/front

### On the server

```js
import {
    parseRegisterRequest,
    generateRegistrationChallenge,
    parseLoginRequest,
    generateLoginChallenge,
    verifyAuthenticatorAssertion,
} from '@webauthn/server';
```

- `parseRegisterRequest`:
    Extract challenge and key from the register request body. The challenge allow to retrieve the user, and the key must be stored server side linked to the user.
- `generateRegistrationChallenge`:
    Generate a challenge from a relying party and a user `{ relyingParty, user }` to be sent back to the client, in order to register
- `parseLoginRequest`:
    Extract challenge and KeyId from the login request.
- `generateLoginChallenge`:
    Generate challengeResponse from the key sent by the client during login. challengeResponse.challenge should be stored serverside linked to the corresponding user
- `verifyAuthenticatorAssertion`:
    Take the loginChallenge request body and the key stored with the user, and return true if it passes the authenticator assertion

See an example in example/server


## Roadmap

For now only fido-u2f and packed format are implemented

- Implement android-key format
- Implement android-safetynet format
- Implement tpm format



