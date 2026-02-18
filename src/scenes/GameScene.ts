import { Scene } from '@/core/RootContainer'
import { GameStore } from '@/game/store/GameStore'
import { BoardView } from '@/game/board/BoardView'
import levelData from '@/assets/levels/level_001.json'
import { LevelData } from '@/game/level/LevelData'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'

export class GameScene extends Scene {
    private store!: GameStore
    private boardView!: BoardView

    onEnter() {
        this.store = new GameStore()
        this.store.loadLevel(levelData as unknown as LevelData)
        this.boardView = new BoardView(this.store.board, 60)
        this.boardView.x = 0
        this.boardView.y = 0
        console.log('this', this.width)
        console.log('this', this.getBounds().width)

        this.boardView.x = (GAME_WIDTH - this.boardView.width) / 2
        this.boardView.y = (GAME_HEIGHT - this.boardView.height) / 2

        this.addChild(this.boardView)
    }

    onExit() {
        this.removeChildren()
    }
}