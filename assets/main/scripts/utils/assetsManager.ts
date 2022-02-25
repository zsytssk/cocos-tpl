import { Asset, assetManager, AssetManager } from 'cc';

export class AssetsManager {
    private static assetsMap: Map<string, Asset> = new Map();
    private static cdn: string = '.';
    public static setCdn(cdn: string = '.') {
        this.cdn = cdn;
    }
    public static loadResource(assetName: string) {
        return new Promise<Asset>((resolve, reject) => {
            const key = `resources/${assetName}`;
            if (this.assetsMap.has(key)) {
                return this.assetsMap.get(key);
            }

            assetManager.loadAny(
                {
                    path: assetName,
                    bundle: 'resources',
                },
                (err, asset: Asset) => {
                    if (err) {
                        return reject(err);
                    }
                    this.assetsMap.set(key, asset);
                    resolve(asset);
                },
            );
        });
    }
    public static async loadBundleAssets(
        assetName: string,
        bundleName: string,
    ) {
        const key = `${bundleName}/${assetName}`;
        if (this.assetsMap.has(key)) {
            return this.assetsMap.get(key);
        }

        const bundle = await this.loadBundle(bundleName);
        if (!bundle) {
            throw new Error(`cant find bundle:${bundleName}`);
        }
        return new Promise<Asset>((resolve, reject) => {
            bundle.load(assetName, (err, asset) => {
                if (err) {
                    return reject(err);
                }
                this.assetsMap.set(key, asset);
                resolve(asset);
            });
        });
    }
    public static loadBundle(bundleName: string) {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName);
            if (bundle) {
                return resolve(bundle);
            }
            const path: string = `${this.cdn}/assets/${bundleName}`;

            assetManager.loadBundle(
                path,
                (err: Error, bundle: AssetManager.Bundle) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(bundle);
                },
            );
        });
    }
}
