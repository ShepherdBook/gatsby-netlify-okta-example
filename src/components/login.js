import OktaSignIn from "@okta/okta-signin-widget";
import "@okta/okta-signin-widget/dist/css/okta-sign-in.min.css";
import React from "react";
import config from "../../okta/config";

export const signIn = typeof window !== 'undefined' && new OktaSignIn(config);

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: false
        };

        this.signIn = signIn;
    }

    async componentDidMount() {
        const authClient = this.signIn.authClient;
        const session = await authClient.session.get();

        console.log('session.status', session.status);

        // Session exists, show logged in state
        if (session.status === 'ACTIVE') {
            
            // Clear parameters from browser window
            window.location.hash = '';

            // Set username in state
            this.setState({ user: session.login });
            localStorage.setItem('isAuthenticated', 'true');

            // Get access and ID tokens
            authClient.token.getWithoutPrompt({
                scopes: ['openid', 'email', 'profile'],
            }).then((tokens) => {
                tokens.forEach(token => {
                    if (token.idToken) {
                        authClient.tokenManager.add('idToken', token);
                    }
                    if (token.accessToken) {
                        authClient.tokenManager.add('accessToken', token);
                    }
                });

                // Say hello to the person who just logged in
                authClient.tokenManager.get('idToken').then(idToken => {
                    console.log(`Hello, `);
                    window.location.reload();
                });
            }).catch(error => console.error(error));
        } else {
            this.signIn.remove();
        }

        this.signIn.renderEl({ el: '#signIn' });
    }

    render() {
        return (
            <div id="signIn" />
        )
    }
}