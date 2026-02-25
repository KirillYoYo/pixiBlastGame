import { EventEmitter } from 'pixi.js'

import { EventBus, Events } from '@/game/store/EventBus'
import { LevelData } from '@/game/level/LevelData'

import { CellType } from '../types/CellType'

import { CellModel } from './CellModel'

export interface movedType {
    cell: CellModel
    fromRow: number
    toRow: number
}
export interface spawnedType {
    cell: CellModel
    row: number
    col: number
    spawnRow: number
}

export type boostersNames = 'bomb' | 'teleport'

export class BoardModel extends EventEmitter {
    readonly rows: number
    readonly cols: number
    cells: CellModel[][] = []
    selectedBooster: boostersNames | null = null
    boosters: LevelData['boosters']
    teleportStep: CellModel | null = null

    private idCounter = 0

    constructor({ rows, cols, boosters, moves }: LevelData) {
        super()
        this.rows = rows
        this.cols = cols
        this.boosters = boosters

        for (let r = 0; r < rows; r++) {
            this.cells[r] = []
            for (let c = 0; c < cols; c++) {
                const type = this.randomType()
                this.cells[r][c] = new CellModel(this.idCounter++, r, c, type)
            }
        }

        EventBus.on(Events.SELECT_BOOSTER, (name: boostersNames | null) => {
            this.selectedBooster = name
        })

        // ;-)
        setTimeout(() => {
            EventBus.emit(Events.BOOSTERS_UPDATED, this.boosters)
            EventBus.emit(Events.SET_MOVES, moves)
            // =)
            EventBus.emit(Events.MOVE_SPEND)
        }, 0)
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

        let group = this.findGroup(start)
        if (this.selectedBooster) {
            group = this.boosterHandler(this.selectedBooster, start) || []
            if (this.selectedBooster !== 'bomb') {
                return
            }
        }

        if (group.length < 2) return

        const removed = group.slice()
        removed.forEach(cell => this.removeCell(cell))

        const moved: movedType[] = []
        const spawned: spawnedType[] = []

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

        EventBus.emit(Events.BOARD_UPDATED, { removed, moved, spawned })
        if (this.selectedBooster) {
            this.boosters = {
                ...this.boosters,
                [this.selectedBooster]: this.boosters[this.selectedBooster] - 1,
            }
            EventBus.emit(Events.BOOSTERS_UPDATED, this.boosters)
            EventBus.emit(Events.SELECT_BOOSTER, null)
            this.selectedBooster = null
        }

        /**/
        EventBus.emit(Events.MOVE_SPEND)
    }

    boosterHandler(booster: string, cell: CellModel) {
        switch (booster) {
            case 'teleport':
                return this.teleportHandler(cell)
            case 'bomb':
                return this.getBombNeighbors(cell)
        }
    }

    teleportHandler(cell: CellModel) {
        if (!this.teleportStep) {
            this.teleportStep = cell
        } else {
            this.swapCells(this.teleportStep.row, this.teleportStep.col, cell.row, cell.col)
            EventBus.emit(Events.CELLS_UPDATED, this.cells)
            EventBus.emit(Events.SELECT_BOOSTER, null)
            this.selectedBooster = null
            this.teleportStep = null
            EventBus.emit(Events.MOVE_SPEND)
        }
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

    private getBombNeighbors(cell: CellModel): CellModel[] {
        const { row, col } = cell
        return [
            cell,
            this.getCell(row - 1, col),
            this.getCell(row + 1, col),
            this.getCell(row, col - 1),
            this.getCell(row, col + 1),
            this.getCell(row - 1, col - 1),
            this.getCell(row - 1, col + 1),
            this.getCell(row + 1, col - 1),
            this.getCell(row + 1, col + 1),
        ].filter(Boolean) as CellModel[]
    }

    swapCells(row1: number, col1: number, row2: number, col2: number): void {
        const cell1 = this.cells[row1]?.[col1]
        const cell2 = this.cells[row2]?.[col2]

        if (!cell1 || !cell2) return
        ;[cell1.row, cell2.row] = [cell2.row, cell1.row]
        ;[cell1.col, cell2.col] = [cell2.col, cell1.col]

        this.cells[row1][col1] = cell2
        this.cells[row2][col2] = cell1
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
