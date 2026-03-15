import { Application, Container, Graphics, TickerCallback } from 'pixi.js'
import { Stats } from 'pixi-stats'

import { GameScene } from '@/scenes/GameScene'
import { PartSceneParticleContainer } from '@/scenes/ParticlesTest/PartSceneParticleContainer'
import { PartSceneDefault } from '@/scenes/ParticlesTest/PartSceneDefault'

import { SceneManager } from './SceneManager'

declare global {
    interface Window {
        __PIXI_APP__: Application
    }
}

const aspect = window.innerHeight / window.innerWidth
console.log('window.innerHeight', window.innerHeight)
console.log('window.innerWidth', window.innerWidth)
let gameW = 1600
let gameH = 900

if (aspect > 1) {
    // портрет
    gameW = 900
    gameH = 1600
} else {
    // ландшафт
    gameW = 1600
    gameH = 900
}

export const GAME_WIDTH = gameW
// export const GAME_HEIGHT = Math.round(GAME_WIDTH * (window.innerHeight / window.innerWidth))
export const GAME_HEIGHT = gameH

export class Game {
    public app!: Application
    public sceneManager!: SceneManager
    root: Container
    contentCenter: Container

    async start() {
        this.app = new Application()
        ;(window as any).__PIXI_APP__ = this.app

        await this.app.init({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        })

        document.getElementById('pixi-container')!.appendChild(this.app.canvas)

        this.root = new Container()
        this.contentCenter = new Container()
        this.app.stage.addChild(this.root)
        this.root.x = 0
        this.root.y = 0

        SceneManager.init(this.contentCenter)
        SceneManager.getInstance().changeScene(new PartSceneParticleContainer())

        this.app.ticker.add(this.update as unknown as TickerCallback<this>, this)
        this.root.addChild(this.contentCenter)

        window.addEventListener('resize', () => this.resize())
        this.resize()
    }

    private update(delta: number) {
        SceneManager.getInstance().update(delta)
    }

    private resize() {
        const scaleX = window.innerWidth / GAME_WIDTH
        const scaleY = window.innerHeight / GAME_HEIGHT

        const scale = Math.min(scaleX, scaleY)

        this.contentCenter.scale.set(scale)

        this.contentCenter.x = (window.innerWidth - GAME_WIDTH * scale) / 2
        this.contentCenter.y = (window.innerHeight - GAME_HEIGHT * scale) / 2

        this.performResize()
    }

    private performResize() {
        const { innerWidth, innerHeight } = window
        const scaleX = innerWidth / GAME_WIDTH
        const scaleY = innerHeight / GAME_HEIGHT
        const scale = Math.min(scaleX, scaleY) // letterbox

        // 🔥 Центрирование + scale
        this.contentCenter.scale.set(scale)
        this.contentCenter.x = (innerWidth - GAME_WIDTH * scale) / 2
        this.contentCenter.y = (innerHeight - GAME_HEIGHT * scale) / 2

        // 🔥 Обновить canvas под новый размер (важно для мобильных)
        this.app.renderer.resize(innerWidth, innerHeight)

        const element = document.querySelector('#app')
        const ticker = this.app.ticker

        new Stats(this.app.renderer, ticker, element)
    }
}