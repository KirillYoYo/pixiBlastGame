import { Container } from 'pixi.js'

export abstract class Scene extends Container {
    /** вызывается при показе сцены */
    onEnter(): void {}

    /** вызывается при скрытии сцены */
    onExit(): void {}

    /** игровой цикл */
    update(delta: number): void {}
}