import { Container, Ticker } from 'pixi.js'
import { BoardModel } from './BoardModel'
import { CellView } from './CellView'
import { CellModel } from './CellModel'

export class BoardView extends Container {
    private board: BoardModel
    private cellSize: number
    private gap: number = 6

    private cellViews = new Map<number, CellView>()
    private fallingCells: { view: CellView; targetY: number; speed: number }[] = []

    constructor(board: BoardModel, cellSize: number) {
        super()
        this.board = board
        this.cellSize = cellSize

        this.build()
        Ticker.shared.add(this.update, this)
    }

    private build() {
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const cell = this.board.getCell(r, c)
                if (!cell) continue
                this.createCellView(cell, r, c)
            }
        }

        this.board.on('boardUpdated', ({ removed, moved, spawned }) => {
            // удаляем клетки
            removed.forEach(cell => {
                const view = this.cellViews.get(cell.id)
                view?.destroy()
                this.cellViews.delete(cell.id)
            })

            // падаем существующие
            moved.forEach(({ cell, toRow }) => {
                const view = this.cellViews.get(cell.id)
                if (!view) return
                const targetY = toRow * (this.cellSize + this.gap)
                this.fallingCells.push({ view, targetY, speed: 15 })
            })

            // создаём новые
            spawned.forEach(({ cell, row, col, spawnRow }) => {
                const view = new CellView(cell, this.cellSize)
                view.x = col * (this.cellSize + this.gap)
                view.y = this.cellSize * (spawnRow + 1)
                this.cellViews.set(cell.id, view)
                this.addChild(view)
                this.fallingCells.push({
                    view,
                    targetY: row * (this.cellSize + this.gap),
                    speed: 15,
                })

                view.eventMode = 'static'
                view.cursor = 'pointer'
                view.on('pointertap', () => this.board.onCellClick(cell.row, cell.col))
            })
        })
    }

    private createCellView(cell: CellModel, row: number, col: number) {
        const view = new CellView(cell, this.cellSize)
        view.x = col * (this.cellSize + this.gap)
        view.y = row * (this.cellSize + this.gap)

        view.eventMode = 'static'
        view.cursor = 'pointer'
        view.on('pointertap', () => {
            this.board.onCellClick(cell.row, cell.col)
        })

        this.cellViews.set(cell.id, view)
        this.addChild(view)
    }

    private update(delta: Ticker) {
        // анимация падающих клеток
        for (let i = this.fallingCells.length - 1; i >= 0; i--) {
            const falling = this.fallingCells[i]
            if (!falling) {
                continue
            }
            falling.view.y += falling.speed * delta.deltaTime
            if (falling.view.y >= falling.targetY) {
                falling.view.y = falling.targetY
                this.fallingCells.splice(i, 1)
            }
        }
    }
}