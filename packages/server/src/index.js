const { generateRegistrationChallenge, parseRegisterRequest } = require('./registration');
const { generateLoginChallenge, parseLoginRequest, verifyAuthenticatorAssertion } = require('./login');

exports.generateRegistrationChallenge = generateRegistrationChallenge;
exports.generateLoginChallenge = generateLoginChallenge;
exports.parseRegisterRequest = parseRegisterRequest;
exports.parseLoginRequest = parseLoginRequest;
exports.verifyAuthenticatorAssertion = verifyAuthenticatorAssertion;
