import { BoardModel } from '../board/BoardModel'
import { ScoreModel } from '../ScoreModel'
import { MovesModel } from '../MovesModel'
import { GoalsModel } from '../GoalsModel'
import { LevelParser } from '../level/LevelParser'
import { LevelData } from '../level/LevelData'

export class GameStore {
    board!: BoardModel
    score!: ScoreModel
    moves!: MovesModel
    goals!: GoalsModel

    loadLevel(levelData: LevelData) {
        const parsed = LevelParser.parse(levelData)

        this.board = parsed.board
        this.moves = parsed.moves
        this.goals = parsed.goals
        this.score = new ScoreModel()
    }

    isWin(): boolean {
        return this.goals.isCompleted()
    }

    isLose(): boolean {
        return this.moves.left <= 0 && !this.isWin()
    }
}