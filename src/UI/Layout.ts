import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'
import { setTransparentBg } from '@/helpers'
import { Header } from '@/UI/Header'
import { Footer } from '@/UI/Footer'
import { bg_moves, img_bg_game } from '@/consts'

export class GameLayout extends Container {
    readonly header = new Container()
    readonly content = new Container()
    readonly footer = new Container()
    headerComponent = new Container()
    footerComponent = new Container()
    bgHeader: Graphics = new Graphics()
    bgFooter: Graphics = new Graphics()

    constructor() {
        super()
        const bg = new Sprite(Assets.get(img_bg_game))
        this.addChild(bg)
        this.addChild(this.content, this.footer, this.header)
        bg.height = GAME_HEIGHT
        bg.x = GAME_WIDTH / 2 - bg.width / 2
    }

    layout() {
        const headerHeight = 100
        const footerHeight = 120
        const contentHeight = GAME_HEIGHT - headerHeight - footerHeight

        this.header.height = headerHeight
        this.footer.height = footerHeight
        this.content.height = contentHeight

        this.header.y = 0
        this.header.x = 0
        this.content.y = headerHeight
        this.footer.y = GAME_HEIGHT - footerHeight

        this.headerComponent = new Header(headerHeight, GAME_WIDTH)
        this.footerComponent = new Footer(footerHeight, GAME_WIDTH)

        // this.bgHeader = new Graphics().rect(0, 0, GAME_WIDTH, headerHeight).fill('0x2c3e50')
        this.bgFooter = new Graphics().rect(0, 0, GAME_WIDTH, footerHeight).fill('0x1a252f')

        this.header.addChild(this.bgHeader)
        this.footer.addChild(this.bgFooter)
        this.header.addChild(this.headerComponent)
        this.footer.addChild(this.footerComponent)
        /**/
        setTransparentBg(this.content, contentHeight)
    }
}