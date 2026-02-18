import { Container, Graphics } from 'pixi.js'
import { CellModel } from './CellModel'
import { CellType } from '../types/CellType'

const COLORS: Record<CellType, number> = {
    red: 0xff4d4d,
    blue: 0x4d79ff,
    green: 0x4dff88,
    yellow: 0xffeb3b,
    purple: 0xb44dff,
}

export class CellView extends Container {
    readonly model: CellModel
    private gfx: Graphics

    constructor(model: CellModel, size: number) {
        super()

        this.model = model
        this.gfx = new Graphics()

        this.draw(size)
        this.addChild(this.gfx)
    }

    draw(size: number) {
        this.gfx.clear()
        this.gfx.beginFill(COLORS[this.model.type]).drawRoundedRect(0, 0, size, size, 12).endFill()
    }
}