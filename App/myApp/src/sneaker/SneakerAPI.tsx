import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from "../core";
import {Sneaker} from "./Sneaker";
import { Storage } from '@capacitor/storage'

const sneakerUrl = `http://${baseUrl}/api/sneaker`;

// @ts-ignore
export const getSneakers: (token: string) => Promise<Sneaker[]> = token => {
    try{
        var result = axios.get(`${sneakerUrl}`, authConfig(token));
        result.then(async result => {
            // @ts-ignore
            for (const each of result.data) {
                await Storage.set({
                    key: each._id!,
                    value: JSON.stringify({
                        _id: each._id,
                        name: each.name,
                        price: each.price,
                        owned: each.owned,
                        releaseDate: each.releaseDate
                    })
                })
            }
        }).catch(error => {
            if (error.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (error.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        });
        return withLogs(result, 'getSneakers');
    } catch (error){
        throw error;
    }
    //return withLogs(axios.get(sneakerUrl, authConfig(token)), 'getSneakers');
}

// @ts-ignore
export const createSneaker: (token: string, sneaker: Sneaker) => Promise<Sneaker[]> = (token, sneaker) => {
    var result = axios.post(`${sneakerUrl}`, sneaker, authConfig(token));
    result.then(async result =>{
        var item: any = result.data
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                price: item.price,
                owned: item.owned,
                releaseDate: item.releaseDate
            })
        })
    }).catch(err => {
        if (err.response) {
            console.log('client received an error response (5xx, 4xx)');
        } else if (err.request) {
            alert('client never received a response, or request never left');
        } else {
            console.log('anything else');
        }
    });
    return withLogs(result, 'createSneaker');
    //return withLogs(axios.post(sneakerUrl, sneaker, authConfig(token)), 'createSneaker');
}


// @ts-ignore
export const updateSneaker: (token: string, sneaker: Sneaker) => Promise<Sneaker[]> = (token, sneaker) => {
    var result = axios.put(`${sneakerUrl}/${sneaker._id}`, sneaker, authConfig(token));
    result.then(async result =>{
        var item: any = result.data
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                price: item.price,
                owned: item.owned,
                releaseDate: item.releaseDate
            })
        }).catch(err => {
            if (err.response) {
                alert('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                alert('client never received a response, or request never left');
            } else {
                alert('anything else');
            }
        })
    });
    return withLogs(result, 'updateSneaker');
    //return withLogs(axios.put(`${sneakerUrl}/${sneaker._id}`, sneaker, authConfig(token)), 'updateSneaker');
}

const equals = (sneaker1: any, sneaker2: any) => {
    return sneaker1.name === sneaker2.name && sneaker1.price === sneaker2.price && sneaker1.owned === sneaker2.owned && sneaker1.releaseDate === sneaker2.releaseDate;
}

// @ts-ignore
export const syncData: (token: string) => Promise<Sneaker[]> = async token => {
    try{
        const { keys } = await Storage.keys();
        var result = axios.get(`${sneakerUrl}`, authConfig(token));
        result.then(async result =>{
            for (const key of keys) {
                if( key !== 'token'){
                    // @ts-ignore
                    const sneakerOnServer = result.data.find((each: { _id: string; }) => each._id === key);
                    const sneakerLocal = await Storage.get({key: key});

                    //alert('SNEAKER ON SERVER: ' + JSON.stringify(sneakerOnServer));
                    //alert('SNEAKER LOCALLY: ' + sneakerLocal.value!);

                    if (sneakerOnServer !== undefined && !equals(sneakerOnServer, JSON.parse(sneakerLocal.value!))){ //update
                        alert('UPDATE ' + sneakerLocal.value);
                        axios.put(`${sneakerUrl}/${key}`, JSON.parse(sneakerLocal.value!), authConfig(token));
                    } else if (sneakerOnServer === undefined){ //create
                        alert('CREATE' + sneakerLocal.value!);
                        axios.post(`${sneakerUrl}`, JSON.parse(sneakerLocal.value!), authConfig(token));
                    } // nothing changed
                }
            }
        }).catch(err => {
            if (err.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        })
        return withLogs(result, 'syncItems');
    } catch (error) {
        throw error;
    }
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
    webSocket.onclose = function (event) {
        console.log(event);
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
