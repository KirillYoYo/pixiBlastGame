import { CellType } from './types/CellType'

export type Goal = {
    type: CellType
    target: number
    current: number
}

export class GoalsModel {
    goals: Goal[]

    constructor(goals: Omit<Goal, 'current'>[]) {
        this.goals = goals.map(g => ({
            ...g,
            current: 0,
        }))
    }

    addProgress(type: CellType, amount: number) {
        const goal = this.goals.find(g => g.type === type)
        if (!goal) return

        goal.current = Math.min(goal.current + amount, goal.target)
    }

    isCompleted(): boolean {
        return this.goals.every(g => g.current >= g.target)
    }
}