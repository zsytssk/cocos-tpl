/* eslint-disable @typescript-eslint/no-explicit-any */
import { sleep } from '../utils';

export type Config = {
    url: string;
    handlers: Handlers;
    ping_pong_map?: PingPongMap;
};

export type PingPongMap = {
    ping: string;
    pong: string;
};

export type Handlers = {
    /** 接收数据 */
    onData?: (data: string) => void;
    /** 出现错误 */
    onError?: (error?: string) => void;
    /** 重连开始 */
    onReconnect?: (no: number) => void;
    /** 重连结束 */
    onReconnected?: () => void;
    /** 断开连接 */
    onEnd?: () => void;
};

export type Status = 'CONNECTING' | 'RECONNECTING' | 'OPEN' | 'CLOSED';

/** webSocket 处理函数:> 连接+断线重连+心跳检测 */
export class WebSocketCtrl {
    public url: string;
    public handlers = {} as Handlers;
    private ws: WebSocket;
    /** 重连最大次数 */
    private reconnect_max = 3;
    /** 心跳倒计时 - timeout  */
    private heartbeat_interval: number;
    /** 心跳倒计时 - 没收到返回 timeout */
    private heartbeat_gap_timeout: number;
    /** 心跳倒计时 - 运行时间 */
    private heartbeat_time = 10;
    /** 心跳倒计时 - 断开连接运行时间 */
    private heartbeat_gap_time = 3;
    /** ping pong 对应的字符 */
    private ping_pong_map?: PingPongMap;
    public status: Status;
    public static log: (...params: any) => void;
    constructor(config: Config) {
        this.url = config.url;
        this.handlers = config.handlers;
        this.ping_pong_map = config.ping_pong_map;
    }
    private async innerConnect() {
        const { url } = this;
        return new Promise<boolean>((resolve, _reject) => {
            try {
                const ws = new WebSocket(url);
                ws.onopen = () => {
                    ws.onmessage = this.onmessage;
                    ws.onerror = this.onError;
                    ws.onclose = this.onclose;
                    this.ws = ws;
                    this.onopen();
                    resolve(true);
                };
                ws.onerror = ws.onclose = () => {
                    resolve(false);
                };
            } catch {
                resolve(false);
            }
        });
    }
    public connect() {
        WebSocketCtrl.log?.('WebSocket:> 连接:>', this.url);
        this.status = 'CONNECTING';
        return this.innerConnect();
    }
    public send(msg: string) {
        const { status, ws } = this;
        if (status !== 'OPEN') {
            return console.error(`socket is no connected!`);
        }
        try {
            ws.send(msg);
        } catch (err) {
            console.error(err);
            this.reconnect();
        }
    }
    private onopen = () => {
        WebSocketCtrl.log?.('WebSocket:> 连接上了');

        this.status = 'OPEN';

        if (this.ping_pong_map) {
            this.startHeartBeat();
        }
    }; //tslint:disable-line
    private onmessage = (ev: MessageEvent) => {
        const msg = ev.data;
        if (this.ping_pong_map) {
            const { ping, pong } = this.ping_pong_map;
            switch (msg) {
                case ping:
                    this.sendPong();
                    break;
                case pong:
                    this.startHeartBeat();
                    break;
            }
        }
        this.handlers.onData?.(msg);
    }; //tslint:disable-line
    private onError() {
        this.handlers.onError?.();
    } //tslint:disable-line
    private onclose() {
        if (!this.ws) {
            return;
        }
        this.reconnect();
    } //tslint:disable-line
    /**
     * 重连
     */
    public async reconnect() {
        WebSocketCtrl.log?.('WebSocket:> 断线重连');
        const { reconnect_max, handlers } = this;

        this.status = 'RECONNECTING';
        for (let i = 0; i < reconnect_max; i++) {
            handlers.onReconnect?.(i);
            this.reset();
            const status = await this.innerConnect();
            if (status) {
                this.handlers.onReconnected?.();
                return true;
            } else {
                await sleep(3);
            }
        }

        this.end();
        return false;
    }
    public startHeartBeat() {
        const { heartbeat_time, heartbeat_gap_time } = this;

        clearInterval(this.heartbeat_interval);
        clearTimeout(this.heartbeat_gap_timeout);

        this.heartbeat_interval = setInterval(() => {
            this.heartbeat_gap_timeout = setTimeout(() => {
                this.reconnect();
            }, heartbeat_gap_time * 1000) as any;

            this.sendPing();
        }, heartbeat_time * 1000) as any;
    }
    public clearHearBeatGapTimeout() {
        clearTimeout(this.heartbeat_gap_timeout);
    }
    public sendPing() {
        if (this.ping_pong_map) {
            const { ping } = this.ping_pong_map;
            this.ws.send(ping);
        }
    }
    public sendPong() {
        if (this.ping_pong_map) {
            const { pong } = this.ping_pong_map;
            this.ws.send(pong);
        }
    }
    /**
     * 断开连接
     */
    public disconnect() {
        if (this.status === 'CLOSED') {
            return;
        }
        this.end();
    }
    /** 真正的关闭 */
    private end() {
        WebSocketCtrl.log?.('WebSocket:> 断开连接');
        this.reset();
        this.status = 'CLOSED';
        this.handlers.onEnd?.();
        this.handlers = {};
    }
    /** 清理本地数据 */
    private reset() {
        const { ws } = this;
        if (ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;

            ws.close();
            this.ws = null;
        }
        clearInterval(this.heartbeat_interval);
        clearTimeout(this.heartbeat_gap_timeout);
    }
}
