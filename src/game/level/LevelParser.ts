import { BoardModel } from '../board/BoardModel'
import { GoalsModel } from '../GoalsModel'
import { MovesModel } from '../MovesModel'
import { LevelData } from './LevelData'

export class LevelParser {
    static parse(level: LevelData) {
        return {
            board: new BoardModel(level.rows, level.cols, level.board),
            moves: new MovesModel(level.moves),
            goals: new GoalsModel(level.goals),
        }
    }
}