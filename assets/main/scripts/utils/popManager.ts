import {
    Canvas,
    Color,
    director,
    ImageAsset,
    Layers,
    Node,
    Prefab,
    screen,
    Sprite,
    SpriteFrame,
    Texture2D,
    UITransform,
    Widget,
} from 'cc';

import { AssetsManager } from './assetsManager';
import { PopCommon } from './popCommon';
import { PrefabManager } from './prefabManager';

export type OpenDialogOpt = {
    useExist?: boolean;
    closeOnSide?: boolean;
};

const DEFAULT_CONFIG: OpenDialogOpt = {
    useExist: true,
    closeOnSide: true,
};

export class PopManager {
    static instance: PopManager = null;
    static node: Node = null;
    static mask: Node = null;
    private static popList: Set<PopCommon> = new Set();
    private static loadingMap: { [key: string]: Promise<PopCommon> } = {};
    private static bundleName: string = 'pop';
    public static setBundleName(bundleName: string) {
        this.bundleName = bundleName;
    }
    static async show(path: string, opts: OpenDialogOpt = {}) {
        opts = { ...DEFAULT_CONFIG, ...opts };
        let createPopTask: Promise<PopCommon>;

        if (opts.useExist) {
            createPopTask = this.loadingMap[path];
        }

        if (!createPopTask) {
            createPopTask = this.loadingMap[path] = new Promise(
                async (resolve, reject) => {
                    try {
                        const prefab = await this.loadPrefab(path);
                        const instance = PrefabManager.request(
                            prefab,
                            `${this.bundleName}/${path}`,
                        );
                        const comp = instance.getComponent(PopCommon);
                        comp.setPrefab(prefab);
                        console.log(`test:>`, prefab, instance);
                        resolve(comp);
                        this.loadingMap[path] = Promise.resolve(comp);
                        instance.once(Node.EventType.NODE_DESTROYED, () => {
                            if (this.loadingMap[path]) {
                                delete this.loadingMap[path];
                            }
                        });
                    } catch (err) {
                        reject(err);
                    }
                },
            );
        }

        const comp = await createPopTask;
        const node = this.getNode();

        if (this.popList.has(comp)) {
            this.popList.delete(comp);
            comp.node.parent = null;
        }
        this.popList.add(comp);
        comp.node.parent = node;
        this.checkBg();

        this.mask.targetOff(comp);
        if (opts.closeOnSide) {
            this.mask.on(
                Node.EventType.TOUCH_END,
                () => {
                    comp.close();
                },
                comp,
            );
        }

        if (this.popList.size !== 0) {
            this.node.active = true;
        }

        return comp;
    }
    static async close(comp: PopCommon) {
        for (const item of this.popList) {
            if (item === comp) {
                const prefab = item.getPrefab();
                item.node.parent = null;
                this.popList.delete(item);
                PrefabManager.recover(item.node, prefab);
                this.checkBg();
                break;
            }
        }
        if (this.popList.size === 0) {
            this.node.active = false;
        }
    }
    private static getNode() {
        if (!this.node) {
            const node = new Node('PopManager');
            const uiTransform = node.addComponent(UITransform);
            uiTransform.setContentSize(screen.windowSize);
            this.node = node;
        }

        if (!this.node.parent) {
            const canvas = director
                .getScene()
                .getChildByName('Canvas')
                .getComponent(Canvas);
            this.node.parent = canvas.node;
        }
        return this.node;
    }
    private static checkBg() {
        let maskNode = this.mask;
        if (!maskNode) {
            maskNode = new Node('mask');
            const uiTransform = maskNode.addComponent(UITransform);
            const widget = maskNode.addComponent(Widget);
            const sprite = maskNode.addComponent(Sprite);
            maskNode.layer = Layers.Enum.UI_2D;

            sprite.type = Sprite.Type.SIMPLE;
            const imageObj = new Image();
            imageObj.src =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAA1BMVEX///+nxBvIAAAACklEQVQI12MAAgAABAABINItbwAAAABJRU5ErkJggg==';
            let textureObj = new Texture2D();
            textureObj.image = new ImageAsset(imageObj);
            let sf = new SpriteFrame();
            sf.texture = textureObj;
            sprite.spriteFrame = sf;
            sprite.color = new Color(0, 0, 0, 188);

            widget.left = 0;
            widget.right = 0;
            widget.top = 0;
            widget.bottom = 0;
            widget.alignMode = Widget.AlignMode.ALWAYS;
            this.mask = maskNode;
            maskNode.active = false;
            uiTransform.setContentSize(screen.windowSize);
        }

        const arr = [...this.popList];
        for (let len = arr.length, i = len - 1; i >= 0; i--) {
            const item = arr[i];
            if (item.showMask) {
                this.node.removeChild(maskNode);
                maskNode.active = true;
                this.node.removeChild(maskNode);
                this.node.insertChild(maskNode, i);
            }
        }
    }
    private static async loadPrefab(assetName: string) {
        const prefab = (await AssetsManager.loadBundleAssets(
            assetName,
            this.bundleName,
        )) as Prefab;

        return prefab;
    }
}
