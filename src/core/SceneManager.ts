import { Container } from 'pixi.js'

import { Scene } from '@/scenes/Scene'

export class SceneManager {
    private currentScene?: Scene

    constructor(private root: Container) {}

    changeScene(scene: Scene) {
        if (this.currentScene) {
            this.currentScene.onExit()
            this.root.removeChild(this.currentScene)
        }

        this.currentScene = scene
        this.root.addChild(scene)
        scene.onEnter()
    }

    update(delta: number) {
        this.currentScene?.update(delta)
    }
}
