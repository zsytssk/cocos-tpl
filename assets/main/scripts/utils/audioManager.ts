import { AudioClip, AudioSource, Node } from 'cc';

import { AssetsManager } from './assetsManager';

export type AudioType = 'MUSIC' | 'EFFECT';

export class AudioManager {
    private static musicMap: Map<string, AudioSource> = new Map();
    private static effectMap: Map<string, AudioSource> = new Map();
    private static bundleName: string = 'audio';
    private static musicVolume: number = 0.5;
    private static effectVolume: number = 0.5;
    public static async setBundleName(bundleName: string) {
        this.bundleName = bundleName;
    }
    public static setVolume(type: AudioType, volume = 1) {
        if (type === 'MUSIC') {
            this.musicVolume = volume;
        } else {
            this.effectVolume = volume;
        }

        const audioMap = type === 'MUSIC' ? this.musicMap : this.effectMap;

        for (const audioSource of audioMap.values()) {
            if (audioSource.volume !== volume) {
                audioSource.volume = volume;
            }
        }
    }
    /** 播放音乐 */
    public static async playMusic(assetName: string) {
        this.stopMusic();
        let audioSource: AudioSource = await this.getAudioSource(
            assetName,
            'MUSIC',
        );

        audioSource.volume = this.musicVolume;
        audioSource.loop = true;
        audioSource.play();
    }
    /** 停止音乐 */
    public static stopMusic(): void {
        if (this.musicMap.size === 0) {
            return;
        }

        for (const audioSource of this.musicMap.values()) {
            audioSource.stop();
        }
    }
    /** 暂停音乐 */
    public static pauseMusic(): void {
        if (this.musicMap.size === 0) {
            return;
        }

        for (const audioSource of this.musicMap.values()) {
            if (audioSource.playing) {
                audioSource.pause();
            }
        }
    }

    // 恢复音乐
    public static resumeMusic(): void {
        if (this.musicMap.size === 0) {
            return;
        }

        for (const audioSource of this.musicMap.values()) {
            if (audioSource.state === AudioSource.AudioState.PAUSED) {
                audioSource.play();
            }
        }
    }
    /** 播放音效 */
    public static async playEffect(assetName: string) {
        let audioSource: AudioSource = await this.getAudioSource(
            assetName,
            'EFFECT',
        );

        audioSource.volume = this.effectVolume;
        audioSource.loop = false;

        this.effectMap.set(audioSource.uuid, audioSource);

        audioSource.stop();

        audioSource.node.on(
            AudioSource.EventType.ENDED,
            () => {
                this.effectMap.delete(audioSource.uuid);
                audioSource.destroy();
            },
            this,
        );

        audioSource.play();
    }

    /** 停止所有音频 */
    public static stopEffect(): void {
        if (this.effectMap.size === 0) {
            return;
        }

        for (const audioSource of this.effectMap.values()) {
            audioSource.volume = 0;
        }
    }

    private static async getAudioSource(
        assetName: string,
        type: AudioType,
    ): Promise<AudioSource> {
        const map = type === 'MUSIC' ? this.musicMap : this.effectMap;

        if (map.has(assetName)) {
            return map.get(assetName);
        }

        const audioSource = new AudioSource();
        const audioClip = (await AssetsManager.loadBundleAssets(
            assetName,
            this.bundleName,
        )) as AudioClip;

        const audioNode = new Node();
        audioSource.node = audioNode;
        audioSource.clip = audioClip;

        return audioSource;
    }
}
