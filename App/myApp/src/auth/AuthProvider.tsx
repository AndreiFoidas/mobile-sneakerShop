import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authAPI';

const log = getLogger('AuthProvider');

type LoginFunction = (username?: string, password?: string) => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFunction;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
    const login = useCallback<LoginFunction>(loginCallback, []);
    useEffect(authenticationEffect, [pendingAuthentication]);

    const value = { isAuthenticated, login, isAuthenticating, authenticationError, token };
    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
      log('login');
      setState({...state, pendingAuthentication: true, username, password });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate().then(r => log(r));
        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication){
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            try{
                log('authenticate...');
                setState({...state, isAuthenticating: true, });
                const { username, password } = state;
                const { token } =  await loginApi(username, password);
                if (canceled) {
                    return;
                }

                log('authenticate succeeded');
                setState({...state, token, pendingAuthentication: false, isAuthenticated: true, isAuthenticating: false});
            } catch(error) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                // @ts-ignore
                setState({...state, authenticationError: error, pendingAuthentication: false, isAuthenticating: false});
            }
        }
    }

};