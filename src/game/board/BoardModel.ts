import { CellModel } from './CellModel'
import { CellType } from '../types/CellType'
import { EventEmitter } from 'pixi.js'

export class BoardModel extends EventEmitter {
    readonly rows: number
    readonly cols: number
    cells: CellModel[][] = []

    private idCounter = 0

    constructor(rows: number, cols: number, layout?: CellType[][]) {
        super()
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

    onCellClick(row: number, col: number) {
        const start = this.getCell(row, col)
        if (!start) return

        const group = this.findGroup(start)
        if (group.length < 2) return

        const removed = group.slice()
        removed.forEach(cell => this.removeCell(cell))

        const moved: { cell: CellModel; fromRow: number; toRow: number }[] = []
        const spawned: { cell: CellModel; row: number; col: number; spawnRow: number }[] = []

        // падение и новые тайлы
        for (let col = 0; col < this.cols; col++) {
            let writeRow = this.rows - 1
            for (let row = this.rows - 1; row >= 0; row--) {
                const cell = this.getCell(row, col)
                if (!cell) continue
                if (row !== writeRow) {
                    this.setCell(writeRow, col, cell)
                    this.cells[row][col] = null as any
                    moved.push({ cell, fromRow: row, toRow: writeRow })
                }
                writeRow--
            }

            let emptyBelow = 0
            for (let r = this.rows - 1; r >= 0; r--) {
                if (!this.getCell(r, col)) emptyBelow++
            }

            // новые тайлы сверху
            for (let row = 0; row < this.rows; row++) {
                if (this.getCell(row, col)) continue

                const spawnRow = row - emptyBelow - 1

                const cell = new CellModel(this.idCounter++, row, col, this.randomType())

                this.cells[row][col] = cell

                spawned.push({
                    cell,
                    row,
                    col,
                    spawnRow,
                })

                emptyBelow--
            }
        }

        this.emit('boardUpdated', { removed, moved, spawned })
    }

    private findGroup(start: CellModel): CellModel[] {
        const targetType = start.type
        const visited = new Set<number>()
        const result: CellModel[] = []

        const stack: CellModel[] = [start]

        while (stack.length) {
            const cell = stack.pop()!
            if (visited.has(cell.id)) continue

            visited.add(cell.id)
            result.push(cell)

            const neighbors = this.getNeighbors(cell)

            for (const n of neighbors) {
                if (n.type === targetType && !visited.has(n.id)) {
                    stack.push(n)
                }
            }
        }

        return result
    }
    private getNeighbors(cell: CellModel): CellModel[] {
        const { row, col } = cell
        return [
            this.getCell(row - 1, col),
            this.getCell(row + 1, col),
            this.getCell(row, col - 1),
            this.getCell(row, col + 1),
        ].filter(Boolean) as CellModel[]
    }

    fillEmpty() {
        for (let col = 0; col < this.cols; col++) {
            this.collapseColumn(col)
            this.spawnNewCells(col)
        }

        this.emit('boardUpdated')
    }
    private collapseColumn(col: number) {
        let writeRow = this.rows - 1

        for (let row = this.rows - 1; row >= 0; row--) {
            const cell = this.getCell(row, col)
            if (!cell) continue

            if (row !== writeRow) {
                this.setCell(writeRow, col, cell)
                this.cells[row][col] = null as any

                this.emit('cellMoved', {
                    cell,
                    fromRow: row,
                    toRow: writeRow,
                })
            }

            writeRow--
        }
    }
    private spawnNewCells(col: number) {
        for (let row = 0; row < this.rows; row++) {
            if (this.getCell(row, col)) continue

            const cell = new CellModel(this.idCounter++, row, col, this.randomType())

            this.cells[row][col] = cell

            this.emit('cellSpawned', {
                cell,
                row,
                col,
            })
        }
    }
}