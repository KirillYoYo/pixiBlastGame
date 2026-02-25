import { BoardModel } from '../board/BoardModel'
import { GoalsModel } from '../GoalsModel'
import { MovesModel } from '../MovesModel'

import { LevelData } from './LevelData'

export class LevelParser {
    static parse(level: LevelData) {
        return {
            board: new BoardModel(level),
            // :-/
            moves: new MovesModel(level.moves + 1),
            goals: new GoalsModel(level.goals),
        }
    }
}
