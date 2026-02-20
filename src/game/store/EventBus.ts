import { EventEmitter } from 'pixi.js'
import { movedType, spawnedType } from '@/game/board/BoardModel'
import { CellModel } from '@/game/board/CellModel'

interface Events {
    [Events.BOARD_UPDATED]: ({
        removed,
        moved,
        spawned,
    }: {
        removed: CellModel[]
        moved: movedType[]
        spawned: spawnedType[]
    }) => void
    [Events.SCORE_CHANGED]: (val: number) => void
}

export const EventBus = new EventEmitter<Events>()

export const Events = {
    BOARD_UPDATED: 'boardUpdated',
    SCORE_CHANGED: 'scoreChanged',
    SCORE_RESET: 'scoreReset',
} as const