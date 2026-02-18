import { CellType } from '../types/CellType'

export class CellModel {
    readonly id: number
    row: number
    col: number
    type: CellType

    constructor(id: number, row: number, col: number, type: CellType) {
        this.id = id
        this.row = row
        this.col = col
        this.type = type
    }
}