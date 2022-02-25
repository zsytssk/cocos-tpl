
import { test } from '@main/utils/utils';
import { _decorator,ProgressBar, Component, Node } from 'cc';

const { ccclass, menu,type } = _decorator;

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
        this.progressBar.node.active = false;
        this.btnLogin.active = false;
    }
    start () {

       paladin.checkComponents({
        list: ['launch'],
        success(res) {
            test();
            if (res.launch) {
                paladin.comps.launch.hide();
            }
        },
    });
    }

}
