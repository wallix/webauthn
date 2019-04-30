import React, { Component } from 'react';
import { Fetch } from 'react-request';
import { 
    solveRegistrationChallenge 
} from '@webauthn/client';

class RegisterButton extends Component {
    state = {
        credentials: null
    };

    handleResponse = async (error, response) => {
        if (error) {
            console.error(error);
            return;
        }
        const credentials = await solveRegistrationChallenge(response.data);

        this.setState({ credentials });
    };

    render() {
        const { credentials } = this.state;

        if (credentials) {
            return (
                <Fetch
                    headers={{ 'Content-Type': 'application/json' }}
                    url="https://localhost:8000/register"
                    method="POST"
                    body={JSON.stringify(credentials)}
                    lazy={false}
                >
                    {({ loading }) => <button disabled>{loading ? 'Loading ...' : 'Registered'}</button>}
                </Fetch>
            );
        }

        return (
            <Fetch
                headers={{ 'Content-Type': 'application/json' }}
                url="https://localhost:8000/request-register"
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