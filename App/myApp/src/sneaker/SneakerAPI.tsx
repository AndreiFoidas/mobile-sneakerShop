import axios from 'axios';
import {getLogger} from "../core";
import {Sneaker} from "./Sneaker";

const log = getLogger('SneakerAPI');

const serverURL = 'localhost:3000';
const sneakerUrl = `http://${serverURL}/sneaker`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, functionName: string): Promise<T> {
    log(`${functionName} - started`);
    return promise
        .then(res => {
            log(`${functionName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${functionName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getSneakers: () => Promise<Sneaker[]> = () => {
    return withLogs(axios.get(sneakerUrl, config), 'getSneakers');
}

export const createSneaker: (sneaker: Sneaker) => Promise<Sneaker[]> = sneaker => {
    return withLogs(axios.post(sneakerUrl, sneaker, config), 'createSneaker');
}

export const updateSneaker: (sneaker: Sneaker) => Promise<Sneaker[]> = sneaker => {
    return withLogs(axios.put(`${sneakerUrl}/${sneaker.id}`, sneaker, config), 'updateSneaker');
}

interface MessageData {
    event: string;
    payload: {
        sneaker: Sneaker;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const webSocket = new WebSocket(`ws://${sneakerUrl}`)
    webSocket.onopen = () => {
        log('web socket onopen');
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