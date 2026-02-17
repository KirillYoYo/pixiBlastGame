import * as PIXI from 'pixi.js'
import { Scene } from './Scene'

export class GameScene extends Scene {
    private text!: PIXI.Text

    onEnter(): void {
        console.log('scene enter')
        this.text = new PIXI.Text('Game Scene', {
            fill: 0xffffff,
            fontSize: 48,
        })

        this.text.anchor.set(0.5)
        this.text.position.set(360, 640)

        this.container.addChild(this.text)
    }

    onExit(): void {
        this.container.removeChildren()
    }

    update(delta: number): void {
        this.text.rotation += 0.01 * delta
    }
}