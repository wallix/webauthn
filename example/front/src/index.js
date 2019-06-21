import { solveRegistrationChallenge, solveLoginChallenge } from '@webauthn/client';

const loginButton = document.getElementById('login');
const registerButton = document.getElementById('register');
const messageDiv = document.getElementById('message');

const displayMessage = message => {
    messageDiv.innerHTML = message;
}

registerButton.onclick = async () => {
    const challenge = await fetch('https://localhost:8000/request-register', {
        method: 'POST',
        headers: {
            'content-type': 'Application/Json'
        },
        body: JSON.stringify({ id: 'uuid', email: 'test@test' })
    })
        .then(response => response.json());
    const credentials = await solveRegistrationChallenge(challenge);

    const { loggedIn } = await fetch(
        'https://localhost:8000/register', 
        {
            method: 'POST',
            headers: {
                'content-type': 'Application/Json'
            },
            body: JSON.stringify(credentials)
        }
    ).then(response => response.json());

    if (loggedIn) {
        displayMessage('registration successful');
        return;
    }
    displayMessage('registration failed');
};

loginButton.onclick = async () => {
    const challenge = await fetch('https://localhost:8000/login', {
        method: 'POST',
        headers: {
            'content-type': 'Application/Json'
        },
        body: JSON.stringify({ email: 'test@test' })
    })
    .then(response => response.json());


    const credentials = await solveLoginChallenge(challenge);
    const { loggedIn } = await fetch(
        'https://localhost:8000/login-challenge', 
        {
            method: 'POST',
            headers: {
                'content-type': 'Application/Json'
            },
            body: JSON.stringify(credentials)
        }
    ).then(response => response.json());

    if (loggedIn) {
        displayMessage('You are logged in');
        return;
    }
    displayMessage('Invalid credential');
};
