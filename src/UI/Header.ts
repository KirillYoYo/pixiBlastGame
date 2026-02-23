import { Assets, Container, NineSliceSprite, Sprite, Text } from 'pixi.js'
import { bg_frame_moves, bg_moves, slot_frame_moves } from '@/consts'
import { EventBus, Events } from '@/game/store/EventBus'

export class Header extends Container {
    constructor(height: number, width: number) {
        super()

        const texture = Assets.get(bg_frame_moves)
        const movesBg = new Sprite(Assets.get(bg_moves))
        const scoresBg = new Sprite(Assets.get(slot_frame_moves))

        const bg = new NineSliceSprite({
            texture,
            leftWidth: 200,
            topHeight: 0,
            rightWidth: 200,
            bottomHeight: 20,
        })

        bg.width = 650
        bg.height = height + 10
        bg.y = height * 0.05
        bg.x = width / 2 - bg.width / 2

        this.addChild(bg)
        this.addChild(movesBg)
        this.addChild(scoresBg)

        movesBg.height = height * 0.9
        movesBg.width = movesBg.height
        movesBg.y = bg.y
        movesBg.x = bg.x + 110
        const movesText = new Text({
            text: '0',
            style: {
                fill: 0xffffff,
                fontSize: 32,
                fontWeight: 'bold',
            },
        })

        this.addChild(movesText)
        movesText.x = movesBg.x + movesBg.width / 2 - movesText.width / 2
        movesText.y = movesBg.y + movesBg.height / 2 - movesText.height / 2

        scoresBg.rotation = Math.PI / 2
        scoresBg.x = bg.x + bg.width - scoresBg.width + 20
        scoresBg.y = bg.y
        scoresBg.width = height * 0.9

        const scoresText = new Text({
            text: '0 / 0',
            style: {
                fill: 0xffffff,
                fontSize: 32,
                fontWeight: 'bold',
            },
        })

        this.addChild(scoresText)
        scoresText.x =
            scoresBg.getBounds().x + scoresBg.getBounds().width / 2 - scoresText.width / 2
        scoresText.y = scoresBg.y + scoresBg.getBounds().height / 2 - scoresText.height / 2

        EventBus.on(Events.SCORE_CHANGED, scores => {
            scoresText.text = scores
        })

        EventBus.on(Events.SET_MOVES, moves => {
            movesText.text = moves
            movesText.x = movesBg.x + movesBg.width / 2 - movesText.width / 2
        })
    }
}