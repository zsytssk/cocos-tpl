import { Component, Node, ProgressBar, _decorator } from 'cc';

import { checkLocalTest } from '@main/test/test';
import { AudioManager } from '@main/utils/audioManager';
import { request } from '@main/utils/request';
import { waitCreateSocket } from '@main/utils/websocket/webSocketWrapUtil';

import { PopAlert } from '../../../bundle/pop/scripts/alert';
import { connectSocket, getGuestToken, getTrialData } from './loadingUtils';

const { ccclass, menu, type } = _decorator;

@ccclass('SceneLoading')
@menu('scenes/SceneLoading')
export class SceneLoading extends Component {
    // 进度条
    @type(ProgressBar)
    progressBar: ProgressBar = null;

    // 按钮 - 登录
    @type(Node)
    btnLogin: Node = null;

    onLoad() {
        AudioManager.playMusic('music/loading');
        this.progressBar.node.active = false;
        this.btnLogin.active = true;

        checkLocalTest();

        this.initEvent();
        // this.connectSocket();
    }
    private initEvent() {
        this.btnLogin.on(Node.EventType.TOUCH_END, () => {
            PopAlert.showPop('this is a test').then((type) => {
                console.log(`test:>popAlert:>${type}`);
            });
            request(
                'https://p3.toutiaoimg.com/origin/tos-cn-i-qvj2lq49k0/74add08c76d34a7f898a8845b407553b?from=pc',
            ).then((data) => {
                console.log(`test:>request:>`, data);
            });
        });

        waitCreateSocket('test');
    }
    private async connectSocket() {
        const socket = await connectSocket();

        if (!socket) {
            return;
        }

        if (paladin.sys.config.isLogin) {
            this.progressBar.node.active = true;
            this.btnLogin.active = false;

            // 移除游客token
            const gameId = paladin.getGameId();
            localStorage.removeItem('guest@' + gameId);
            socket.send('changeCurrency', { currency: paladin.getCurrency() });
        } else {
            const { status } = (await getTrialData()) as any;
            this.progressBar.node.active = status;
            this.btnLogin.active = !status;

            if (status) {
                // 切换场景 +  加载 音效 + 弹框
                const gameId = paladin.getGameId();
                const token = localStorage.getItem('guest@' + gameId);

                console.log(`test:>loading:>token:>${token}`);
                if (!token) {
                    await getGuestToken();
                }
                socket.setParams({ jwt: token });
            }
        }
    }

    start() {
        paladin.checkComponents({
            list: ['launch'],
            success(res) {
                if (res.launch) {
                    paladin.comps.launch.hide();
                }
            },
        });
    }
    onDestroy() {
        console.log(`test:>loading:>onDestroy`);
    }
}
