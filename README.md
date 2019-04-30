# webauthn

Implementation of strong authentication with the webauthn standard and FIDO2.
Strong authentication is an authentication method using a physical key.

For a more thorough introduction see these two nice articles:

- [introduction](https://medium.com/@herrjemand/introduction-to-webauthn-api-5fd1fb46c285)
- [verifying fido2 responses](https://medium.com/@herrjemand/verifying-fido2-responses-4691288c8770)

## Installation

```js
npm install webauthn
```

## Usage

Webauthn is composed of two parts @webauthn/client and @webauthn/server

### On the browser

```js
import { 
    registrationChallengeToPublicKey, 
    loginChallengeToPublicKey, 
    publicKeyToJSON 
} from '@webauthn/client';
```

- registrationChallengeToPublicKey:
    convert the challenge returned by the server on the register route into a publicKey
- publicKeyToJSON:
    convert the publicKey to JSON.
- loginChallengeToPublicKey:
    convert the challenge returned by the server on the login route into a publicKey

See an example in example/front

### On the server

```js
import {
    requestRegistrationChallenge,
    registrationCredentialsToUserKey,
    requestLoginChallenge,
    loginCredentialsToChallenge
} from '@webauthn/server';
```

- requestRegistrationChallenge:
    Generate a challenge from a relying party and an user `{ relyingParty, user }`
- registrationCredentialsToUserKey:
    convert credential to user key
- requestLoginChallenge:
    generate challenge from userKeys. Return both the challenge and the allowCredentials
- loginCredentialsToChallenge:
    convert the credential from the client to challenge to be returned to it

See an example in example/server


## Roadmap

For now only fido-u2f and packed format are implemeted

- Implement android-key format
- Implement android-safetynet format
- Implement tpm format



