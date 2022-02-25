import { _decorator, Component, Node, director } from 'cc';

const { ccclass, menu, type } = _decorator;

@ccclass('SceneGame')
@menu('scenes/SceneGame')
export class SceneGame extends Component {
    @type(Node)
    btnLogin: Node = null;
    onLoad() {
        console.log(`test:>game:>onLoad`);
        this.btnLogin.on(Node.EventType.TOUCH_END, () => {
            director.loadScene('loading');
        });
    }
    start() {
        // [3]
    }
    onDestroy() {
        console.log(`test:>game:>destroy`);
        super.destroy();
        return true;
    }
}
