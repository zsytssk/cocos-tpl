import { Component, Node, _decorator } from 'cc';

import { PopManager } from './popManager';

const { type } = _decorator;

export class PopCommon extends Component {
    public showMask = true;
    @type(Node)
    closeBtn: Node = null;
    onLoad() {
        this.closeBtn?.on(Node.EventType.TOUCH_END, () => {
            this.close();
        });
    }
    public close(...params: any[]) {
        PopManager.close(this);
        this.onClose(...params);
    }
    public onClose(...params: any[]) {}
}
