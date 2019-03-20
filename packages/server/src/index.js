const { requestRegistrationChallenge, registrationCredentialsToUserKey } = require('./registration');
const { requestLoginChallenge, loginCredentialsToChallenge } = require('./login');

exports.requestRegistrationChallenge = requestRegistrationChallenge;
exports.registrationCredentialsToUserKey = registrationCredentialsToUserKey;
exports.requestLoginChallenge = requestLoginChallenge;
exports.loginCredentialsToChallenge = loginCredentialsToChallenge;
