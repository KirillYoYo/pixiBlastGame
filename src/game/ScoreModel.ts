import { EventEmitter } from 'pixi.js'

import { EventBus, Events } from '@/game/store/EventBus'

export class ScoreModel extends EventEmitter {
    value: number = 0
    constructor() {
        super()

        EventBus.on(Events.BOARD_UPDATED, ({ removed }) => {
            this.add(removed.length)
        })
    }

    add(amount: number) {
        this.value += amount
        EventBus.emit(Events.SCORE_CHANGED, this.value)
    }

    reset() {
        this.value = 0
    }
}
