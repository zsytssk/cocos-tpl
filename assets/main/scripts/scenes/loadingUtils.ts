import {
    createSocket,
    getSocket,
} from '@main/utils/websocket/webSocketWrapUtil';

export async function connectSocket() {
    const publicKey =
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMUws+7NKknmImMYUsSr4DOKYVrs1s7BQzGBgkkTptjGiektUmxm3BNZq34ugF6Vob9V0vU5r0S7vfyuOTC87uFeGe+rBJf7si4kE5wsJiEBlLNZjrz0T30xHGJlf+eizYVKPkpo3012rKvHN0obBlN7iBsdiGpLGP3sPAgO2tFQIDAQAB';
    const url = typeof paladin !== 'undefined' ? paladin.sys.config.ws : '';
    const gameId = typeof paladin !== 'undefined' ? paladin.getGameId() : '';

    const socket = await createSocket(
        {
            url,
            gameId,
            publicKey,
            name: 'game',
            host: '',
        },
        3,
        3,
    );

    if (!socket) {
        return;
    }

    return socket;
}

export function getTrialData() {
    return new Promise((resolve, reject) => {
        const socket = getSocket('game');
        socket.event.once('trialSwitch', (data) => {
            resolve(data);
        });
        socket.send('trialSwitch');
    });
}
export function getGuestToken() {
    return new Promise((resolve, reject) => {
        const gameId = paladin.getGameId();

        const socket = getSocket('game');
        socket.event.once('guest', ({ jwt }) => {
            localStorage.setItem('guest@' + gameId, jwt);
            resolve(jwt);
        });
        socket.send('guest');
    });
}
