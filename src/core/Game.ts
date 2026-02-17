import { Application } from 'pixi.js'
import { SceneManager } from './SceneManager'
import { GameScene } from '@/scenes/GameScene'

export class Game {
    public app!: Application
    public sceneManager!: SceneManager

    async start() {
        this.app = new Application()

        await this.app.init({
            width: 720,
            height: 1280,
            backgroundColor: 0x1e1e1e,
        })

        document.body.appendChild(this.app.canvas)

        this.sceneManager = new SceneManager(this.app)
        this.sceneManager.changeScene(new GameScene())
    }
}