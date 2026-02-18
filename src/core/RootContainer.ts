import { Container } from 'pixi.js'

export abstract class Scene extends Container {
    onEnter(): void {}
    onExit(): void {}
    update(delta: number): void {}
}