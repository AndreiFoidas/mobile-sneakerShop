import {getLogger} from "../core";
import PropTypes from 'prop-types';
import {Sneaker} from "./Sneaker";
import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import {createSneaker, getSneakers, newWebSocket, syncData, updateSneaker} from "./SneakerAPI";
import {AuthContext} from "../auth";
import {Network} from "@capacitor/network";
import {Storage} from "@capacitor/storage";

const log = getLogger('SneakerProvider');

type SaveSneakerFunction = (sneaker: any) => Promise<any>;

export interface SneakersState {
    sneakers?: Sneaker[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveSneaker?: SaveSneakerFunction,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
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
                log(sneaker);
                log(sneakers);
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

    const [networkStatus, setNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then(status => setNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    useEffect(networkEffect, [token, setNetworkStatus]);

    useEffect(getSneakersEffect, [token]);
    useEffect(webSocketEffect, [token]);

    const saveSneaker = useCallback<SaveSneakerFunction>(saveSneakerCallBack, [token]);
    const value = {sneakers, fetching, fetchingError, saving, savingError, saveSneaker, networkStatus, savedOffline, setSavedOffline};
    log('returns');
    return (
        <SneakerContext.Provider value={value}>
            {children}
        </SneakerContext.Provider>
    );

    function networkEffect() {
        console.log("network effect");
        log('network effect');
        let canceled = false;
        Network.addListener('networkStatusChange', async (status) => {
            if (canceled)
                return;
            const connected = status.connected;
            if (connected) {
                alert('SYNC data');
                log('sync data');
                await syncData(token);
            }
            setNetworkStatus(status.connected);
        });
        return () => {
            canceled = true;
        }
    }

    function getSneakersEffect() {
        log('effect started');
        let cancelled = false;
        fetchSneakers().then(r => log(r));
        return () => {
            cancelled = true;
        }

        async function fetchSneakers() {
            if (!token?.trim()) {
                return;
            }
            if (!navigator?.onLine) {
                alert("FETCHING ELEMENTS OFFLINE!");
                let storageKeys = Storage.keys();
                const sneakers = await storageKeys.then(async function (storageKeys) {
                    const saved = []
                    for (let i = 0; i < storageKeys.keys.length; i++){
                        if (storageKeys.keys[i] !== 'token') {
                             const sneaker = await Storage.get({key: storageKeys.keys[i]});
                             if (sneaker.value != null)
                                 var parsedSneaker = JSON.parse(sneaker.value);
                             saved.push(parsedSneaker);
                        }
                    }
                    return saved;
                });
                dispatch({type: FETCH_SNEAKERS_SUCCEEDED, payload: {sneakers: sneakers}});
            } else {
                try {
                    log('fetchSneakers started');
                    dispatch({type: FETCH_SNEAKERS_STARTED});

                    const sneakers = await getSneakers(token);
                    log('fetchSneakers succeeded');
                    if (!cancelled) {
                        dispatch({type: FETCH_SNEAKERS_SUCCEEDED, payload: {sneakers: sneakers}});
                    }
                } catch (error) {
                    let storageKeys = Storage.keys();
                    const sneakers = await storageKeys.then(async function (storageKeys) {
                        const saved = []
                        for (let i = 0; i < storageKeys.keys.length; i++){
                            if (storageKeys.keys[i] !== 'token') {
                                const sneaker = await Storage.get({key: storageKeys.keys[i]});
                                if (sneaker.value != null)
                                    var parsedSneaker = JSON.parse(sneaker.value);
                                saved.push(parsedSneaker);
                            }
                        }
                        return saved;
                    });
                    dispatch({type: FETCH_SNEAKERS_SUCCEEDED, payload: {sneakers: sneakers}});
                }
            }
        }
    }

    async function saveSneakerCallBack(sneaker: Sneaker) {
        try {
            if (navigator.onLine) {
                log('saveSneaker started');
                dispatch({type: SAVE_SNEAKER_STARTED});
                const savedSneaker = await (sneaker._id ? updateSneaker(token, sneaker) : createSneaker(token, sneaker));
                log('saveSneaker succeeded');
                dispatch({type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker: savedSneaker}});
            } else {
                alert("SAVED OFFLINE");
                log('saveSneaker failed');
                sneaker._id = (sneaker._id == undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : sneaker._id;
                await Storage.set({
                    key: sneaker._id!,
                    value: JSON.stringify({
                        _id: sneaker._id,
                        name: sneaker.name,
                        price: sneaker.price,
                        owned: sneaker.owned,
                        releaseDate: sneaker.releaseDate
                    })
                });
                dispatch({type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker: sneaker}});
                setSavedOffline(true);
            }
        } catch (error) {
            log('saveSneaker failed');
            await Storage.set({
                key: String(sneaker._id),
                value: JSON.stringify(sneaker)
            })
            dispatch({type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker: sneaker}});
        }

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
                    dispatch({type: SAVE_SNEAKER_SUCCEEDED, payload: {sneaker: sneaker}});
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