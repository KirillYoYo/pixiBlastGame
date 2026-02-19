import { Container, Sprite, Text, TextStyle, Assets } from 'pixi.js'

export interface ButtonOptions {
    onClick: (val: any) => void
    width?: number
    height?: number
    bgTexture?: string // alias для фона
    iconTexture?: string // alias для иконки
    label?: string
    fontSize?: number
    fontColor?: number
}

export class Button extends Container {
    private bg!: Sprite
    private icon?: Sprite
    label!: Text

    constructor(options: ButtonOptions) {
        super()

        const {
            onClick,
            width = 200,
            height = 60,
            bgTexture,
            iconTexture,
            label = '',
            fontSize = 24,
            fontColor = 0xffffff,
        } = options

        if (bgTexture) {
            const tex = Assets.get(bgTexture)
            if (!tex) throw new Error(`Texture ${bgTexture} not loaded!`)
            this.bg = new Sprite(tex)
            this.bg.width = width
            this.bg.height = height
            this.addChild(this.bg)
        }

        if (iconTexture) {
            const tex = Assets.get(iconTexture)
            if (!tex) throw new Error(`Texture ${iconTexture} not loaded!`)
            this.icon = new Sprite(tex)
            this.icon.anchor.set(0.5)
            this.icon.x = this.width / 2
            this.icon.y = height / 2
            this.addChild(this.icon)
        }

        this.label = new Text(
            label,
            new TextStyle({
                fontSize,
                fill: fontColor,
                fontWeight: 'bold',
            })
        )

        this.label.anchor.set(0.5, 0.5)

        this.label.x = this.icon ? width / 2 + 5 : width / 2
        this.label.y = height / 2

        this.addChild(this.label)

        this.interactive = true

        this.on('pointerdown', () => {
            onClick(null)
        })
    }

    setLabel(text: string) {
        this.label.text = text
    }

    // Метод для смены иконки
    setIcon(textureAlias: string) {
        if (this.icon) this.removeChild(this.icon)
        const tex = Assets.get(textureAlias)
        if (!tex) throw new Error(`Texture ${textureAlias} not loaded!`)
        this.icon = new Sprite(tex)
        this.icon.anchor.set(0.5)
        this.icon.x = 30
        this.icon.y = this.bg.height / 2
        this.addChild(this.icon)
    }
}