import React, { Component } from 'react';
import { Fetch } from 'react-request';
import {
    solveLoginChallenge
} from '@webauthn/client';


class LoginButton extends Component {
    state = { credentials: null };

    handleResponse = async (error, response) => {
        if (error) {
            console.error(error);
            return;
        }
        if (!response.data) {
            return;
        }

        const credentials = await solveLoginChallenge(response.data);

        this.setState({ credentials });
    };

    render() {
        const { credentials } = this.state;

        if (credentials) {
            return (
                <Fetch
                    headers={{ 'Content-Type': 'application/json' }}
                    url="https://localhost:8000/login-challenge"
                    method="POST"
                    body={JSON.stringify(credentials)}
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
