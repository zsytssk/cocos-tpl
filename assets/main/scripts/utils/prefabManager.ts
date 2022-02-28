import { instantiate, Node, NodePool, Prefab } from 'cc';

export interface IPrefab {
    onUse(): void;
    onRecover(): void;
}
export class PrefabManager {
    static poolMap: Map<Prefab, NodePool> = new Map();
    static infoMap: Map<Prefab, { name: string; size: number }> = new Map();
    static request(prefab: Prefab, name?: string) {
        if (this.poolMap.has(prefab)) {
            const pool = this.poolMap.get(prefab);
            return pool.size() ? pool.get() : instantiate(prefab);
        }
        const node = instantiate(prefab);
        const info = this.infoMap.get(prefab);
        this.infoMap.set(prefab, {
            name: name || node.name,
            size: info?.size ? info.size + 1 : 1,
        });
        return node;
    }
    static recover(node: Node, prefab: Prefab) {
        if (!this.poolMap.has(prefab)) {
            this.poolMap.set(prefab, new NodePool());
        }
        this.poolMap.get(prefab).put(node);
    }
    static showPoolInfo() {
        const table: any[] = [];

        for (let [prefab, value] of this.poolMap.entries()) {
            const info = this.infoMap.get(prefab);
            table.push({
                'Pool Name': info.name,
                'Pool Size': value.size(),
                'All Size': info.size,
            });
        }

        console.table(table);
    }
}
