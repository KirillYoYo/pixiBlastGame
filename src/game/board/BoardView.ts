import { Container } from 'pixi.js'
import { BoardModel } from './BoardModel'
import { CellView } from './CellView'

export class BoardView extends Container {
    private board: BoardModel
    private cellSize: number
    private gap: number = 6

    private cellViews = new Map<number, CellView>()

    constructor(board: BoardModel, cellSize: number) {
        super()

        this.board = board
        this.cellSize = cellSize

        this.build()
    }

    private build() {
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const cell = this.board.getCell(r, c)
                if (!cell) continue

                const view = new CellView(cell, this.cellSize)
                view.x = c * (this.cellSize + this.gap)
                view.y = r * (this.cellSize + this.gap)

                this.cellViews.set(cell.id, view)
                this.addChild(view)
            }
        }
    }
}