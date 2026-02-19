import { Scene } from '@/core/RootContainer'
import { GameStore } from '@/game/store/GameStore'
import { BoardView } from '@/game/board/BoardView'
import levelData from '@/assets/levels/level_001.json'
import { LevelData } from '@/game/level/LevelData'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'
import { GameLayout } from '@/UI/Layout'
import { Assets, NineSliceSprite, Sprite } from 'pixi.js'
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

        this.boardView.x = (GAME_WIDTH - this.boardView.width) / 2
        this.boardView.y = this.layout.content.height / 2 - this.boardView.height / 2
    }

    onExit() {
        this.removeChildren()
    }
}