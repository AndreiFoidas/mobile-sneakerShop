import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from "../core";
import {Sneaker} from "./Sneaker";

const sneakerUrl = `http://${baseUrl}/api/sneaker`;

export const getSneakers: (token: string) => Promise<Sneaker[]> = token => {
    return withLogs(axios.get(sneakerUrl, authConfig(token)), 'getSneakers');
}

export const createSneaker: (token: string, sneaker: Sneaker) => Promise<Sneaker[]> = (token, sneaker) => {
    return withLogs(axios.post(sneakerUrl, sneaker, authConfig(token)), 'createSneaker');
}

export const updateSneaker: (token: string, sneaker: Sneaker) => Promise<Sneaker[]> = (token, sneaker) => {
    return withLogs(axios.put(`${sneakerUrl}/${sneaker._id}`, sneaker, authConfig(token)), 'updateSneaker');
}

interface MessageData {
    type: string;
    payload: {
        sneaker: Sneaker;
    };
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const webSocket = new WebSocket(`ws://${baseUrl}`)
    webSocket.onopen = () => {
        log('web socket onopen');
        webSocket.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    webSocket.onclose = () => {
        log('web socket onclose');
    };
    webSocket.onerror = error => {
        log('web socket onerror', error);
    };
    webSocket.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        webSocket.close();
    }
}
