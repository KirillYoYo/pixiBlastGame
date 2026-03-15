import { Container } from 'pixi.js'

import { Scene } from '@/scenes/Scene'

export class SceneManager {
    private static instance: SceneManager | null = null
    private currentScene?: Scene
    private root!: Container // теперь приватное поле

    private constructor(root: Container) {
        this.root = root
    }

    static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            throw new Error('SceneManager не инициализирован! Сначала вызовите init()')
        }
        return SceneManager.instance
    }

    static init(root: Container): SceneManager {
        if (SceneManager.instance) {
            console.warn('SceneManager уже инициализирован!')
            return SceneManager.instance
        }
        SceneManager.instance = new SceneManager(root)
        return SceneManager.instance
    }

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