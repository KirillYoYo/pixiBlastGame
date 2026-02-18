import { CellType } from '../types/CellType'

export type LevelData = {
    rows: number
    cols: number
    moves: number
    board?: CellType[][]
    goals: {
        type: CellType
        target: number
    }[]
}