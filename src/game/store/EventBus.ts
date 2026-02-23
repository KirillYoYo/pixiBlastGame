import { EventEmitter } from 'pixi.js'
import { movedType, spawnedType } from '@/game/board/BoardModel'
import { CellModel } from '@/game/board/CellModel'
import { LevelData } from '@/game/level/LevelData'

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
    [Events.SELECT_BOOSTER]: (name: string) => void
    [Events.BOOSTERS_UPDATED]: (val: LevelData['boosters']) => void
    [Events.CELLS_UPDATED]: (cells: CellModel[][]) => void
}

export const EventBus = new EventEmitter<Events>()

export const Events = {
    BOARD_UPDATED: 'boardUpdated',
    SCORE_CHANGED: 'scoreChanged',
    SCORE_RESET: 'scoreReset',
    SELECT_BOOSTER: 'selectBooster',
    BOOSTERS_UPDATED: 'boostersUpdated',
    CELLS_UPDATED: 'cellsUpdated',
} as const