import React, { Component } from 'react';
import { Fetch } from 'react-request';
import {
    loginChallengeToPublicKey, 
    publicKeyToJSON 
} from '@webauthn/client';


class LoginButton extends Component {
    state = { credentials: null };

    handleResponse = (error, response) => {
        if (!response.data) {
            return;
        }

        const publicKey = loginChallengeToPublicKey(response.data);

        navigator.credentials
            .get({ publicKey })
            .then(publicKeyToJSON)
            .then(credentials => {
                console.warn('creds', credentials);
                this.setState({ credentials });
            })
            .catch(error => {
                console.error(error.name);
                console.error(error.message);
                console.error(error);
            });
    };

    render() {
        const { credentials } = this.state;

        if (credentials) {
            return (
                <Fetch
                    headers={{ 'Content-Type': 'application/json' }}
                    url="https://localhost:8000/login"
                    method="POST"
                    body={JSON.stringify({ credentials })}
                    lazy={false}
                >
                    {({ loading, data }) => (
                        <button disabled>
                            {loading ? 'Loading ...' : data && data.loggedIn ? 'Logged In' : 'NOT LOGGED'}
                        </button>
                    )}
                </Fetch>
            );
        }

        return (
            <Fetch
                headers={{ 'Content-Type': 'application/json' }}
                url="https://localhost:8000/login"
                method="POST"
                body={JSON.stringify({ email: 'test@test' })}
                onResponse={this.handleResponse}
            >
                {({ doFetch, loading, data }) => (
                    <button onClick={doFetch} disabled={loading || !!data}>
                        Login
                    </button>
                )}
            </Fetch>
        );
    }
}

export default LoginButton;
