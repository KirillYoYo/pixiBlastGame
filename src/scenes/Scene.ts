import * as PIXI from 'pixi.js';

export abstract class Scene {
    public container: PIXI.Container;

    constructor() {
        this.container = new PIXI.Container();
    }

    /** вызывается при показе сцены */
    abstract onEnter(): void;

    /** вызывается при скрытии сцены */
    abstract onExit(): void;

    /** игровой цикл */
    update(delta: number): void {}
}