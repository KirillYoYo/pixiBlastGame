import { Assets, Container, NineSliceSprite, Sprite, Text } from 'pixi.js'
import {
    bg_booster,
    bg_moves,
    icon_booster_bomb,
    icon_booster_teleport,
    slot_frame_moves,
} from '@/consts'
import { Button } from '@/UI/Button'

export class Footer extends Container {
    constructor(height: number, width: number) {
        super()

        const bombButton = new Button({
            // width: 220,
            height: height * 0.9,
            bgTexture: bg_booster,
            iconTexture: icon_booster_bomb,
            label: '0',
            fontSize: 28,
            fontColor: 0xffffff,
            onClick: () => console.log('bomb'),
        })
        const teleportButton = new Button({
            // width: 220,
            height: height * 0.9,
            bgTexture: bg_booster,
            iconTexture: icon_booster_teleport,
            label: '0',
            fontSize: 28,
            fontColor: 0xffffff,
            onClick: () => console.log('teleport'),
        })

        this.addChild(bombButton as unknown as PIXI.Container)
        this.addChild(teleportButton as unknown as PIXI.Container)
        bombButton.y = height / 2 - bombButton.getBounds().height / 2
        teleportButton.y = height / 2 - teleportButton.getBounds().height / 2
        teleportButton.x = bombButton.x + bombButton.width
    }
}