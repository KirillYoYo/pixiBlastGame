import * as PIXI from 'pixi.js'
import { Scene } from '@/scenes/Scene'
import { TickerCallback } from 'pixi.js'

export class SceneManager {
    private app: PIXI.Application
    private currentScene?: Scene

    constructor(app: PIXI.Application) {
        this.app = app
    }

    changeScene(scene: Scene) {
        if (this.currentScene) {
            this.currentScene.onExit()
            this.app.stage.removeChild(this.currentScene.container)
        }

        this.currentScene = scene

        this.app.stage.addChild(scene.container)
        scene.onEnter()

        this.app.ticker.add(scene.update as unknown as TickerCallback<Scene>, scene)
    }
}