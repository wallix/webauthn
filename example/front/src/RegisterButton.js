import React, { Component } from 'react';
import { Fetch } from 'react-request';
import { 
    registrationChallengeToPublicKey, 
    publicKeyToJSON 
} from '@webauthn/client';

class RegisterButton extends Component {
    state = {
        credentials: null
    };

    handleResponse = (error, response) => {
        const publicKey = registrationChallengeToPublicKey(response.data);

        navigator.credentials
            .create({ publicKey })
            .then(publicKeyToJSON)
            .then(credentials => {
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
                    url="https://localhost:8000/register"
                    method="POST"
                    body={JSON.stringify({ id: 'uuid', email: 'test@test', credentials })}
                    lazy={false}
                >
                    {({ loading }) => <button disabled>{loading ? 'Loading ...' : 'Registered'}</button>}
                </Fetch>
            );
        }

        return (
            <Fetch
                headers={{ 'Content-Type': 'application/json' }}
                url="https://localhost:8000/register"
                method="POST"
                body={JSON.stringify({ id: 'uuid', email: 'test@test' })}
                onResponse={this.handleResponse}
            >
                {({ doFetch, loading, data }) => (
                    <button onClick={doFetch} disabled={loading || !!data}>
                        Register
                    </button>
                )}
            </Fetch>
        );
    }
}

export default RegisterButton;