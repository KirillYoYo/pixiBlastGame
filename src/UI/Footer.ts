import { Assets, Container, NineSliceSprite, Sprite, Text } from 'pixi.js'
import {
    bg_booster,
    bg_moves,
    icon_booster_bomb,
    icon_booster_teleport,
    slot_frame_moves,
} from '@/consts'
import { Button } from '@/UI/Button'
import { EventBus, Events } from '@/game/store/EventBus'

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
            onClick: () => EventBus.emit(Events.SELECT_BOOSTER, 'bomb'),
        })
        const teleportButton = new Button({
            // width: 220,
            height: height * 0.9,
            bgTexture: bg_booster,
            iconTexture: icon_booster_teleport,
            label: '0',
            fontSize: 28,
            fontColor: 0xffffff,
            onClick: () => EventBus.emit(Events.SELECT_BOOSTER, 'teleport'),
        })

        this.addChild(bombButton as unknown as PIXI.Container)
        this.addChild(teleportButton as unknown as PIXI.Container)
        bombButton.y = height / 2 - bombButton.getBounds().height / 2
        teleportButton.y = height / 2 - teleportButton.getBounds().height / 2
        teleportButton.x = bombButton.x + bombButton.width

        EventBus.on(Events.BOOSTERS_UPDATED, value => {
            teleportButton.setLabel(value.teleport + '')
            bombButton.setLabel(value.bomb + '')
        })

        EventBus.on(Events.SELECT_BOOSTER, name => {
            bombButton.scale = 1
            teleportButton.scale = 1

            if (name === 'bomb') {
                bombButton.scale = 1.2
            }
            if (name === 'teleport') {
                teleportButton.scale = 1.2
            }
        })
    }
}