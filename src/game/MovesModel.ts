import { EventBus, Events } from '@/game/store/EventBus'

export class MovesModel {
    left: number

    constructor(initial: number) {
        this.left = initial

        EventBus.on(Events.MOVE_SPEND, () => {
            this.spend()
            EventBus.emit(Events.SET_MOVES, this.left)
        })
    }

    spend() {
        this.left = Math.max(0, this.left - 1)
    }
}