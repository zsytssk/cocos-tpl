import { Component, Node, Prefab, _decorator } from 'cc';

import { PopManager } from './popManager';

const { type } = _decorator;

export class PopCommon extends Component {
    public showMask = true;
    public prefab: Prefab;
    @type(Node)
    closeBtn: Node = null;
    onLoad() {
        this.closeBtn?.on(Node.EventType.TOUCH_END, () => {
            this.close();
        });
    }
    /** 在close的时候，prefabManager recover的时候要用 */
    public setPrefab(prefab: Prefab) {
        this.prefab = prefab;
    }
    public getPrefab() {
        return this.prefab;
    }

    public close(...params: any[]) {
        PopManager.close(this);
        this.onClose(...params);
    }
    public onClose(...params: any[]) {}
}
