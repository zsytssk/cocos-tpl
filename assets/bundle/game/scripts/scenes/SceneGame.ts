import { _decorator, Component, Node } from 'cc';

import { PopAlert } from '../../../pop/scripts/alert';

const { ccclass, menu, type } = _decorator;

@ccclass('SceneGame')
@menu('scenes/SceneGame')
export class SceneGame extends Component {
    @type(Node)
    btnLogin: Node = null;
    onLoad() {
        console.log(`test:>game:>onLoad`);
        this.btnLogin.on(Node.EventType.TOUCH_END, () => {
            PopAlert.showPop('this is a test').then((type) => {
                console.log(`test:>popAlert:>${type}`);
            });
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
