import { _decorator, Node, Label } from 'cc';

import { PopCommon } from '@main/utils/popCommon';
import { PopManager } from '@main/utils/popManager';

type CloseType = 'confirm' | '';
const { ccclass, menu, type } = _decorator;

@ccclass('PopAlert')
@menu('pop/PopAlert')
export class PopAlert extends PopCommon {
    showMask = true;
    resolve: (type: CloseType) => void;

    @type(Node)
    btnConfirm: Node = null;

    @type(Node)
    btnCancel: Node = null;

    @type(Label)
    label: Label = null;
    static async showPop(msg: string, useExist = false) {
        const pop = (await PopManager.show('prefabs/alert', {
            useExist,
        })) as PopAlert;
        return pop.showMsg(msg);
    }
    onLoad() {
        super.onLoad();
        this.btnConfirm.on(
            Node.EventType.TOUCH_END,
            () => {
                this.close('confirm');
            },
            this,
        );
        this.btnCancel.on(
            Node.EventType.TOUCH_END,
            () => {
                this.close();
            },
            this,
        );
    }
    showMsg(msg: string) {
        return new Promise((resolve, reject) => {
            this.label.string = msg;
            this.resolve = resolve;
        });
    }
    public onClose(type: CloseType) {
        this.resolve(type);
    }
}

(window as any).test = PopAlert;
