import { Scene } from '@/core/RootContainer'
import { GameStore } from '@/game/store/GameStore'
import { BoardView } from '@/game/board/BoardView'
import levelData from '@/assets/levels/level_001.json'
import { LevelData } from '@/game/level/LevelData'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'
import { GameLayout } from '@/UI/Layout'
import { Assets, Graphics, NineSliceSprite, Sprite, TextStyle, Text, FillStyle } from 'pixi.js'
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

export const CELL_SIZE = 64

export class GameScene extends Scene {
    private store!: GameStore
    private boardView!: BoardView
    layout!: GameLayout
    private gameOverText?: Text

    async onEnter() {
        await Assets.load([
            { alias: bg_frame_moves, src: '/assets/bg_frame_moves.png' },
            { alias: img_bg_game, src: '/assets/img_bg_game.png' },
            { alias: bg_frame_play, src: '/assets/bg_frame_play.png' },
            { alias: bg_moves, src: '/assets/bg_moves.png' },
            { alias: slot_frame_moves, src: '/assets/slot_frame_moves.png' },
            { alias: bg_booster, src: '/assets/bg_booster.png' },
            { alias: icon_booster_bomb, src: '/assets/icon_booster_bomb.png' },
            { alias: icon_booster_teleport, src: '/assets/icon_booster_teleport.png' },
        ])

        this.store = new GameStore()
        this.store.loadLevel(levelData as unknown as LevelData)
        this.boardView = new BoardView(this.store.board, CELL_SIZE)

        this.layout = new GameLayout()
        this.layout.layout()

        this.addChild(this.layout)
        const texture = Assets.get(bg_frame_play)

        const playBg = new NineSliceSprite({
            texture,
            leftWidth: 100,
            topHeight: 100,
            rightWidth: 100,
            bottomHeight: 100,
        })
        this.layout.content.addChild(playBg)

        this.layout.content.addChild(this.boardView)

        const gap = 80
        playBg.width = this.boardView.width + gap
        playBg.height = this.boardView.height + gap
        playBg.x = (GAME_WIDTH - this.boardView.width) / 2 - gap / 2
        playBg.y = this.layout.content.height / 2 - this.boardView.height / 2 - gap / 2

        /**/
        const mask = new Graphics()
            .beginFill(0xffffff)
            .drawRect(0, 0, playBg.width, playBg.height)
            .endFill()
        mask.x = playBg.x
        mask.y = playBg.y

        this.boardView.x = (GAME_WIDTH - this.boardView.width) / 2
        this.boardView.y = this.layout.content.height / 2 - this.boardView.height / 2
    }

    onExit() {
        this.removeChildren()
    }

    update(delta: number) {
        super.update(delta)
        if (this.store?.isLose()) {
            this.showGameOver()
        }
    }

    private showGameOver() {
        // 🔥 GraphicsContext API v8
        const bg = new Graphics()

        // Сначала геометрия, потом стили
        bg.rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
        bg.fill(0x000000) // чисто чёрный
        bg.alpha = 0.7

        this.addChild(bg)
        this.gameOverBg = bg

        // Текст
        this.gameOverText = new Text({
            text: '❌ Ходов больше нет!\n🔄 Нажмите F5 для рестарта',
            style: new TextStyle({
                fontSize: 48,
                fill: '#ffffff',
                stroke: { color: '#000000', width: 4 },
                align: 'center',
            }),
        })
        this.gameOverText.anchor.set(0.5)
        this.gameOverText.x = GAME_WIDTH / 2
        this.gameOverText.y = GAME_HEIGHT / 2
        this.addChild(this.gameOverText)
    }

    private gameOverBg?: Graphics

    // В restartGame():
    private restartGame() {
        this.gameOverText?.destroy()
        this.gameOverBg?.destroy()
        this.gameOverText = undefined
        this.gameOverBg = undefined
        // ...
    }

    private onRestartKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'r' && this.gameOverText) {
            window.removeEventListener('keydown', this.onRestartKey)
        }
    }
}