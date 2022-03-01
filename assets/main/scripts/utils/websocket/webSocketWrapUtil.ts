/* eslint-disable @typescript-eslint/no-explicit-any */
import rxjs, { Subscriber } from 'rxjs';

import cryptoJS from '@main/libs/crypto-js.js';
import JSEncrypt from '@main/libs/jsencrypt.min.js';

import { EventCom } from '../eventCom';
import { sleep } from '../utils';
import { Config, WebSocketTrait, WebSocketWrapCtrl } from './webSocketManager';

const { CryptoJS } = cryptoJS;
const { Observable } = rxjs;

/** socket 的工具函数 */
const common_key_map: Map<string, string> = new Map();
let socket_ctor: Ctor<WebSocketTrait>;
const socket_map: Map<string, WebSocketTrait> = new Map();

/**  监听创建 */
const socket_map_event = new EventCom();
const SocketMapEvent = {
    Create: 'create',
    Disconnect: 'disconnect',
};

/** 重试三次 */
export async function createSocket(config: Config, retry = 3, wait = 3) {
    for (let i = 0; i < retry; i++) {
        const { name } = config;
        const ctor = socket_ctor || WebSocketWrapCtrl;
        const socket = new ctor(config);
        const status = await socket.connect();

        if (status) {
            socket_map_event.emit(SocketMapEvent.Create, name, socket);
            socket_map.set(name, socket);
            return socket;
        } else {
            await sleep(wait);
            continue;
        }
    }
}
export function waitCreateSocket(name: string) {
    return new Promise((resolve, _reject) => {
        const socket = socket_map.get(name);
        if (socket) {
            return resolve(socket);
        }
        socket_map_event.once(
            SocketMapEvent.Create,
            (_name: string, _socket: WebSocketTrait) => {
                if (_name === name) {
                    resolve(_socket);
                }
            },
        );
    }) as Promise<WebSocketTrait>;
}
export function onCreateSocket(name: string, once?: boolean) {
    const observer = new Observable(
        (subscriber: Subscriber<WebSocketTrait>) => {
            const fn = (_name: string, _socket: WebSocketTrait) => {
                if (_name === name) {
                    subscriber.next(_socket);
                    if (once) {
                        subscriber.complete();
                    }
                }
            };
            socket_map_event.on(SocketMapEvent.Create, fn, null);
            subscriber.add(() => {
                socket_map_event.off(SocketMapEvent.Create, null, fn);
            });

            const socket = socket_map.get(name);
            if (socket) {
                fn(name, socket);
            }
        },
    );

    return observer;
}

export function mockSocketCtor(ctor: Ctor<WebSocketTrait>) {
    socket_ctor = ctor;
}
export function getSocket(name: string) {
    return socket_map.get(name);
}
export function disconnectSocket(name: string) {
    const socket = socket_map.get(name);
    if (socket) {
        socket.disconnect();
        socket_map.delete(name);
    }
}

export function createComKey(name: string) {
    const date_str = new Date().toString();
    const comm_key =
        Date.parse(date_str).toString() +
        Date.parse(date_str).toString() +
        Date.parse(date_str).toString().substring(0, 6);
    common_key_map.set(name, comm_key);
    return comm_key;
}

export function genUrl(config: Config) {
    const { url, publicKey, code, host, name, gameId } = config;

    // 临时修改
    let new_url = `${url}?auth=${getAuth(name, publicKey)}`;
    if (code) {
        new_url += `&code=${code}`;
    }
    if (host) {
        new_url += `&host=${host}`;
    }
    if (gameId !== '') {
        new_url += `&gameId=${gameId}`;
    }
    return new_url;
}

export function getAuth(name: string, public_key: string) {
    const comm_key = createComKey(name);
    const jsencrypt = new JSEncrypt();
    jsencrypt.setPublicKey(public_key);
    const encryptedString = jsencrypt.encrypt(comm_key);
    return encryptedString;
}

export function decrypt(name: string, data: string) {
    try {
        const comm_key = common_key_map.get(name);
        const desData = CryptoJS.AES.decrypt(
            data,
            CryptoJS.enc.Utf8.parse(comm_key),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            },
        );
        const rep_str = desData.toString(CryptoJS.enc.Utf8);
        const rep = JSON.parse(rep_str);
        return rep;
    } catch {
        console.error('cant decrypt data');
        return '';
    }
}

export function encrypt(name: string, msg: string) {
    const comm_key = common_key_map.get(name);
    const encryptData = CryptoJS.AES.encrypt(
        msg,
        CryptoJS.enc.Utf8.parse(comm_key),
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        },
    );
    return encryptData.toString();
}

export function socketEventToPromise(
    socket: WebSocketTrait,
    event: string,
    OK_CODE: number,
) {
    return <T>(data: any) => {
        return new Promise<T>((resolve, reject) => {
            socket.event.once(event, (_data: T, code: number) => {
                if (code !== OK_CODE) {
                    reject({ code, data: _data });
                    return;
                }

                resolve(_data);
            });
            socket.send(event, data);
        });
    };
}

export function bindSocketEvent(
    socket: WebSocketTrait,
    bind_obj: any,
    bind_info: { [key: string]: Func<void> },
) {
    const { event } = socket;
    for (const key in bind_info) {
        event.on(key, bind_info[key], bind_obj);
    }
}

export function offSocketEvent(socket: WebSocketTrait, bind_obj: any) {
    const { event } = socket;
    event.offAllCaller(bind_obj);
}
