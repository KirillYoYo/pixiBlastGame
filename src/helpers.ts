import { GAME_WIDTH } from '@/core/Game'
import { Container, Graphics } from 'pixi.js'

// :-)
export const setTransparentBg = (content: Container<any>, contentHeight: number) => {
    const contentBg: Graphics = new Graphics()

    contentBg.beginFill(0x000000, 0) // прозрачный
    contentBg.drawRect(0, 0, GAME_WIDTH, contentHeight)
    contentBg.endFill()

    content.addChild(contentBg)
}