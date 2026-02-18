import { CellModel } from './CellModel'
import { CellType } from '../types/CellType'

export class BoardModel {
    readonly rows: number
    readonly cols: number
    cells: CellModel[][] = []

    private idCounter = 0

    constructor(rows: number, cols: number, layout?: CellType[][]) {
        this.rows = rows
        this.cols = cols

        for (let r = 0; r < rows; r++) {
            this.cells[r] = []
            for (let c = 0; c < cols; c++) {
                const type = this.randomType()
                this.cells[r][c] = new CellModel(this.idCounter++, r, c, type)
            }
        }
    }

    getCell(row: number, col: number): CellModel | null {
        return this.cells[row]?.[col] ?? null
    }

    removeCell(cell: CellModel) {
        this.cells[cell.row][cell.col] = null as any
    }

    setCell(row: number, col: number, cell: CellModel) {
        cell.row = row
        cell.col = col
        this.cells[row][col] = cell
    }

    private randomType(): CellType {
        const types = Object.values(CellType)
        return types[Math.floor(Math.random() * types.length)]
    }
}