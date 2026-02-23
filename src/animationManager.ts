import { EventEmitter, Ticker } from 'pixi.js'

interface SequenceStep {
    key: string
    duration: number
    easing?: (t: number) => number
    onProgress?: (progress: number) => void
}

interface ActiveAnimation {
    id: string
    key: string
    elapsed: number
    duration: number
    easing: (t: number) => number
    onProgress?: (progress: number) => void
    onComplete?: () => void
    sequence?: SequenceStep[]
    sequenceIndex: number
    sequenceKey: string
}

export class AdvancedAnimationManager extends EventEmitter {
    private ticker: Ticker
    private activeAnimations: Map<string, ActiveAnimation> = new Map()
    private isUpdating: boolean = false
    private nextId: number = 0

    constructor(ticker: Ticker = Ticker.shared) {
        super()
        this.ticker = ticker
        this.ticker.add(this.update, this)
    }

    // Генерирует уникальный ID для анимации
    private generateId(): string {
        return `anim_${Date.now()}_${this.nextId++}`
    }

    // Запускает последовательность анимаций
    playSequence(key: string, steps: SequenceStep[]): string {
        const animationId = this.generateId()

        const animation: ActiveAnimation = {
            id: animationId,
            key,
            elapsed: 0,
            duration: steps[0].duration,
            easing: steps[0].easing || ((t: number) => t),
            onProgress: steps[0].onProgress,
            sequence: steps,
            sequenceIndex: 0,
            sequenceKey: key,
        }

        this.activeAnimations.set(animationId, animation)
        this.emit(`${key}:sequenceStart`, { animationId })
        this.emit(`${key}:stepStart`, { animationId, stepKey: steps[0].key })
        this.emit(`${animationId}:end`, { animationId, stepKey: steps[0].key })

        return animationId // возвращаем ID, чтобы можно было управлять анимацией
    }

    // Запускает одиночную анимацию
    play(
        key: string,
        duration: number,
        options?: {
            easing?: (t: number) => number
            onProgress?: (progress: number) => void
            onComplete?: () => void
        }
    ): string {
        const animationId = this.generateId()

        const animation: ActiveAnimation = {
            id: animationId,
            key,
            elapsed: 0,
            duration,
            easing: options?.easing || ((t: number) => t),
            onProgress: options?.onProgress,
            onComplete: options?.onComplete,
            sequenceIndex: -1,
            sequenceKey: key,
        }

        this.activeAnimations.set(animationId, animation)
        this.emit(`${key}:start`, { animationId })

        return animationId
    }

    // Переход к следующему шагу в последовательности
    private advanceSequence(animation: ActiveAnimation) {
        if (!animation.sequence) return false

        animation.sequenceIndex++

        if (animation.sequenceIndex >= animation.sequence.length) {
            // Последовательность завершена
            this.emit(`${animation.sequenceKey}:sequenceComplete`, { animationId: animation.id })
            return true // завершено
        }

        const nextStep = animation.sequence[animation.sequenceIndex]

        // Обновляем параметры текущей анимации для нового шага
        animation.elapsed = 0
        animation.duration = nextStep.duration
        animation.easing = nextStep.easing || ((t: number) => t)
        animation.onProgress = nextStep.onProgress
        animation.key = nextStep.key

        this.emit(`${animation.sequenceKey}:stepStart`, {
            animationId: animation.id,
            stepKey: nextStep.key,
        })

        return false // не завершено, продолжаем
    }

    private update = () => {
        if (this.isUpdating) return
        this.isUpdating = true

        try {
            // Проходим по всем активным анимациям
            for (const [id, animation] of this.activeAnimations) {
                // Обновляем время
                animation.elapsed += this.ticker.deltaMS

                const progress = Math.min(animation.elapsed / animation.duration, 1)

                const easedProgress = animation.easing(progress)

                // Вызываем onProgress если есть
                if (animation.onProgress) {
                    animation.onProgress(easedProgress)
                }

                // Эмитим событие прогресса
                this.emit(`${animation.key}:progress`, {
                    animationId: id,
                    progress: easedProgress,
                })

                // Проверяем завершение текущего шага
                if (progress >= 1) {
                    if (animation.sequence) {
                        // Это последовательность - переходим к следующему шагу
                        const completed = this.advanceSequence(animation)

                        if (completed) {
                            // Последовательность полностью завершена
                            this.activeAnimations.delete(id)

                            if (animation.onComplete) {
                                animation.onComplete()
                            }
                            this.emit(`${animation.sequenceKey}:complete`, { animationId: id })
                            this.emit(`${id}:complete`)
                        }
                    } else {
                        // Одиночная анимация завершена
                        this.activeAnimations.delete(id)

                        if (animation.onComplete) {
                            animation.onComplete()
                        }
                        this.emit(`${animation.key}:complete`, { animationId: id })
                    }
                }
            }
        } catch (error) {
            console.error('Error in animation update:', error)
        } finally {
            this.isUpdating = false
        }
    }

    // Остановить конкретную анимацию по ID
    stop(animationId: string) {
        const animation = this.activeAnimations.get(animationId)
        if (animation) {
            this.emit(`${animation.key}:stopped`, { animationId })
            this.activeAnimations.delete(animationId)
        }
    }

    // Остановить все анимации с определённым ключом
    stopAllByKey(key: string) {
        for (const [id, animation] of this.activeAnimations) {
            if (animation.key === key || animation.sequenceKey === key) {
                this.stop(id)
            }
        }
    }

    // Остановить все анимации
    stopAll() {
        this.activeAnimations.clear()
        this.emit('allStopped')
    }

    // Проверить, активна ли анимация
    isActive(animationId: string): boolean {
        return this.activeAnimations.has(animationId)
    }

    // Получить количество активных анимаций
    get activeCount(): number {
        return this.activeAnimations.size
    }

    destroy() {
        this.stopAll()
        this.ticker.remove(this.update, this)
        this.removeAllListeners()
    }
}