import { Application, Container, TickerCallback } from 'pixi.js'
import { SceneManager } from './SceneManager'
import { GameScene } from '@/scenes/GameScene'

export const GAME_WIDTH = 1024
export const GAME_HEIGHT = 720

export class Game {
    public app!: Application
    public sceneManager!: SceneManager
    root: Container

    async start() {
        this.app = new Application()

        await this.app.init({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        })

        document.getElementById('pixi-container')!.appendChild(this.app.canvas)

        console.log(this.app.screen)
        console.log(this.app.canvas.getBoundingClientRect())

        this.root = new Container()
        this.app.stage.addChild(this.root)

        this.sceneManager = new SceneManager(this.root)
        this.sceneManager.changeScene(new GameScene())

        this.app.ticker.add(this.update as unknown as TickerCallback<this>, this)

        window.addEventListener('resize', () => this.resize())
        this.resize()
    }

    private update(delta: number) {
        this.sceneManager.update(delta)
    }

    private resize() {
        const scaleX = window.innerWidth / GAME_WIDTH
        const scaleY = window.innerHeight / GAME_HEIGHT

        const scale = Math.min(scaleX, scaleY)

        this.root.scale.set(scale)

        this.root.x = (window.innerWidth - GAME_WIDTH * scale) / 2
        this.root.y = (window.innerHeight - GAME_HEIGHT * scale) / 2
    }
}