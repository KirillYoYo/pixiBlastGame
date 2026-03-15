import { Assets, Graphics, NineSliceSprite, TextStyle, Text, Sprite } from 'pixi.js'

import { Scene } from '@/core/RootContainer'
import { GameStore } from '@/game/store/GameStore'
import { BoardView } from '@/game/board/BoardView'
import levelData from '@/assets/levels/level_001.json'
import { LevelData } from '@/game/level/LevelData'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'
import { GameLayout } from '@/UI/Layout'
import {
    bg_booster,
    bg_frame_moves,
    bg_frame_play,
    bg_moves,
    icon_booster_bomb,
    icon_booster_teleport,
    img_bg_game,
    slot_frame_moves,
} from '@/consts'
import { Button } from '@/UI/Button'
import { SceneManager } from '@/core/SceneManager'
import { PartSceneParticleContainer } from '@/scenes/ParticlesTest/PartSceneParticleContainer'

export const CELL_SIZE = 64

export class PartSceneDefault extends Scene {
    private store!: GameStore
    private boardView!: BoardView
    layout!: GameLayout
    private gameOverText?: Text
    sprites: Sprite[] = []

    async onEnter() {
        console.log('enter')
        await Assets.load([
            { alias: bg_frame_moves, src: './assets/bg_frame_moves.png' },
            { alias: img_bg_game, src: './assets/img_bg_game.png' },
            { alias: bg_frame_play, src: './assets/bg_frame_play.png' },
            { alias: bg_moves, src: './assets/bg_moves.png' },
            { alias: slot_frame_moves, src: './assets/slot_frame_moves.png' },
            { alias: bg_booster, src: './assets/bg_booster.png' },
            { alias: icon_booster_bomb, src: './assets/icon_booster_bomb.png' },
            { alias: icon_booster_teleport, src: './assets/icon_booster_teleport.png' },
        ])

        /**/

        const round = new Graphics()
        /**/
        round.roundRect(0, 0, 5, 5, 999)

        // round.stroke(0x4f46e5)
        round.fill(0x4f46e5)
        round.alpha = 0.4

        const renderer = (window as any).__PIXI_APP__.renderer
        const texture = renderer.generateTexture(round)

        const sprite = new Sprite(texture)
        sprite.x = 10
        sprite.y = 10

        this.addChild(sprite)

        /**/

        interface Point3D {
            x: number
            y: number
            z: number
        }
        const pExample = { x: 1, y: 1, z: 1 }
        const fieldsLenght = Object.keys(pExample).length

        const points: Point3D[] = []

        for (let i = 0; i < 100000; i++) {
            points.push({
                x: randomInt(0, 1400),
                y: randomInt(0, 900),
                z: randomInt(0, 10),
            })
            const sprite = new Sprite(texture)
            this.sprites.push(sprite)
            this.sprites[this.sprites.length - 1].x = points[points.length - 1].x
            this.sprites[this.sprites.length - 1].y = points[points.length - 1].y
            this.sprites[this.sprites.length - 1].z = points[points.length - 1].z
            this.addChild(sprite)
        }

        const vertices = new Float32Array(points.length * fieldsLenght)
        points.forEach((p, i) => {
            vertices[i * 3 + 0] = p.x
            vertices[i * 3 + 1] = p.y
            vertices[i * 3 + 2] = p.z
        })

        const btn = new Button({
            onClick: async () => {
                SceneManager.getInstance().changeScene(new PartSceneParticleContainer())
            },
            label: 'CLICK',
            width: 100,
            height: 40,
            fontColor: parseInt('#ffffff'.replace('#', ''), 16),
        })
        btn.x = GAME_WIDTH - 100
        btn.y = 0
        this.addChild(btn)
    }

    update(val) {
        this.sprites.forEach(sprite => {
            sprite.x += randomInt(1, 4)
            sprite.y += randomInt(1, 7)
            if (sprite.y > GAME_HEIGHT || sprite.x > GAME_WIDTH) {
                sprite.x = randomInt(0, 1400)
                sprite.y = randomInt(0, 900)
            }
        })
    }
}

function randomInt(n: number, m: number): number {
    return Math.floor(Math.random() * (m - n + 1)) + n
}