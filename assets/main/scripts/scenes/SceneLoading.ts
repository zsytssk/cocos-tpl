import { _decorator, ProgressBar, Component, Node, director } from 'cc';

import { AudioManager } from '@main/utils/audioManager';
import { PopManager } from '@main/utils/popManager';
import {
    createSocket,
    waitCreateSocket,
} from '@main/utils/websocket/webSocketWrapUtil';

import { PopAlert } from '../../../bundle/pop/scripts/alert';

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
        this.initEvent();
    }
    private initEvent() {
        this.btnLogin.on(Node.EventType.TOUCH_END, () => {
            PopAlert.showPop('this is a test').then((type) => {
                console.log(`test:>popAlert:>${type}`);
            });
        });

        waitCreateSocket('test');
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
