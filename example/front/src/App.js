import React, { Component } from 'react';

import RegisterButton from './RegisterButton';
import LoginButton from './LoginButton';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <RegisterButton />
                    &nbsp;
                    <LoginButton />
                </header>
            </div>
        );
    }
}

export default App;
