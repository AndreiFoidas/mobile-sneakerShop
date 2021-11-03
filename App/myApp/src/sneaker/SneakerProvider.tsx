import {getLogger} from "../core";
import PropTypes from 'prop-types';
import {Sneaker} from "./Sneaker";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import {createSneaker, getSneakers, newWebSocket, updateSneaker} from "./SneakerAPI";
import {AuthContext} from "../auth";

const log = getLogger('SneakerProvider');

type SaveSneakerFunction = (sneaker: Sneaker) => Promise<any>;

export interface SneakersState {
    sneakers?: Sneaker[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveSneaker?: SaveSneakerFunction,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: SneakersState = {
    fetching: false,
    saving: false,
};

const FETCH_SNEAKERS_STARTED = 'FETCH_SNEAKERS_STARTED';
const FETCH_SNEAKERS_SUCCEEDED = 'FETCH_SNEAKERS_SUCCEEDED';
const FETCH_SNEAKERS_FAILED = 'FETCH_SNEAKERS_FAILED';
const SAVE_SNEAKER_STARTED = 'SAVE_SNEAKER_STARTED';
const SAVE_SNEAKER_SUCCEEDED = 'SAVE_SNEAKER_SUCCEEDED';
const SAVE_SNEAKER_FAILED = 'SAVE_SNEAKER_FAILED';

const reducer: (state: SneakersState, action: ActionProps) => SneakersState =
    (state, {type, payload}) => {
        switch(type) {
            case FETCH_SNEAKERS_STARTED:
                return {...state, fetching: true, fetchingError: null};

            case FETCH_SNEAKERS_SUCCEEDED:
                return {...state, sneakers: payload.sneakers, fetching: false};

            case FETCH_SNEAKERS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};

            case SAVE_SNEAKER_STARTED:
                return { ...state, savingError: null, saving: true };

            case SAVE_SNEAKER_SUCCEEDED:
                const sneakers = [...(state.sneakers || [])];
                const sneaker = payload.sneaker;
                const index = sneakers.findIndex(it => it._id === sneaker._id);

                if(index === -1) {
                    sneakers.splice(0, 0, sneaker);
                } else {
                    sneakers[index] = sneaker;
                }

                return {...state, sneakers, saving: false};

            case SAVE_SNEAKER_FAILED:
                return { ...state, savingError: payload.error, saving: false };

            default:
                return state;
        }
    };

export const SneakerContext = React.createContext<SneakersState>(initialState);

interface SneakerProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const SneakerProvider: React.FC<SneakerProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {sneakers, fetching, fetchingError, saving, savingError} = state;

    useEffect(getSneakersEffect, [token]);
    useEffect(webSocketEffect, [token]);

    const saveSneaker = useCallback<SaveSneakerFunction>(saveSneakerCallBack, [token]);
    const value = {sneakers, fetching, fetchingError, saving, savingError, saveSneaker};
    log('returns');
    return (
        <SneakerContext.Provider value={value}>
            {children}
        </SneakerContext.Provider>
    );


    function getSneakersEffect() {
        log('effect started')
        let cancelled = false;
        fetchSneakers().then(r => log(r));
        return () => {
            cancelled = true;
        }

        async function fetchSneakers() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchSneakers started');
                dispatch({type: FETCH_SNEAKERS_STARTED});

                const sneakers = await getSneakers(token);
                log('fetchSneakers succeeded');
                if (!cancelled) {
                    dispatch({type: FETCH_SNEAKERS_SUCCEEDED, payload: {sneakers}});
                }
            } catch (error) {
                log('fetchSneakers failed');
                dispatch({type: FETCH_SNEAKERS_FAILED, payload: {error} });
            }
        }
    }

    async function saveSneakerCallBack(sneaker: Sneaker) {
        try{
            log('saveSneaker started');
            dispatch({ type: SAVE_SNEAKER_STARTED });
            const savedSneaker = await (sneaker._id ? updateSneaker(token, sneaker) : createSneaker(token, sneaker));
            log('saveSneaker succeeded');
            dispatch({ type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker: savedSneaker} });
        } catch (error) {
            log('saveSneaker failed');
            dispatch({ type: SAVE_SNEAKER_FAILED, payload: { error } });            }
    }

    function webSocketEffect() {
        let canceled = false;
        log('webSocketEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: sneaker } = message;
                log(`web socket message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker}});
                }
            });
        }
        return () => {
            log('webSocketEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};