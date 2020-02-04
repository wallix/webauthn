# @webauthn/client

This library contains convenience methods intended to simplify interactions with a browser's Webauthn API.

This front end library complements this repo's [@webauthn/server](../server/) NodeJS library.

## Installation

```js
npm install @webauthn/client
```

## Usage

```js
import {
    solveRegistrationChallenge,
    solveLoginChallenge
} from '@webauthn/client';
```

- `solveRegistrationChallenge`: convert the challenge returned by the server on the register route into the response to be returned
- `solveLoginChallenge`: convert the challenge returned by the server on the login route into the response to be returned

See an example in [example/front](../../example/front/).

## TypeScript support

This client library's source files are 100% TypeScript. As a result every method is fully typed and supports use in both JavaScript and TypeScript projects.
