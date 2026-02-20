import { EventEmitter, Ticker } from 'pixi.js'

interface SequenceStep {
    key: string
    duration: number
    easing?: (t: number) => number
    onProgress?: (progress: number) => void
}

export class AdvancedAnimationManager extends EventEmitter {
    private ticker: Ticker
    private currentAnimation: {
        key: string
        elapsed: number
        duration: number
        easing: (t: number) => number
        onProgress?: (progress: number) => void
        onComplete?: () => void
    } | null = null

    private sequence: SequenceStep[] | null = null
    private sequenceIndex: number = 0
    private sequenceKey: string = ''
    private isUpdating: boolean = false

    constructor(ticker: Ticker = Ticker.shared) {
        super()
        this.ticker = ticker
        this.ticker.add(this.update, this)
    }

    playSequence(key: string, steps: SequenceStep[]) {
        this.stop()

        this.sequence = steps
        this.sequenceIndex = 0
        this.sequenceKey = key
        this.emit(`${key}:sequenceStart`)

        this.startSequenceStep()
    }

    private startSequenceStep() {
        if (!this.sequence || this.sequenceIndex >= this.sequence.length) {
            this.emit(`${this.sequenceKey}:sequenceComplete`)
            this.sequence = null
            this.sequenceKey = ''
            return
        }

        const step = this.sequence[this.sequenceIndex]

        // Важно: сохраняем ссылку на onProgress и onComplete из шага
        const stepOnProgress = step.onProgress
        const stepKey = step.key

        this.currentAnimation = {
            key: stepKey,
            elapsed: 0,
            duration: step.duration,
            easing: step.easing || ((t: number) => t),
            onProgress: (progress: number) => {
                if (this.currentAnimation?.key === stepKey) {
                    stepOnProgress?.(progress)
                }
            },
            onComplete: () => {
                this.emit(`${this.sequenceKey}:stepComplete`, stepKey)

                this.currentAnimation = null

                this.sequenceIndex++
                this.startSequenceStep()
            },
        }

        this.emit(`${this.sequenceKey}:stepStart`, stepKey)
    }

    private update = () => {
        if (this.isUpdating) return
        this.isUpdating = true

        try {
            if (!this.currentAnimation) {
                return
            }

            this.currentAnimation.elapsed += this.ticker.deltaMS

            const progress = Math.min(
                this.currentAnimation.elapsed / this.currentAnimation.duration,
                1
            )

            const easedProgress = this.currentAnimation.easing(progress)

            if (this.currentAnimation.onProgress) {
                this.currentAnimation.onProgress(easedProgress)
            }

            this.emit(`${this.currentAnimation.key}:progress`, easedProgress)

            if (progress >= 1) {
                // Сохраняем onComplete перед тем как обнулить currentAnimation
                const onComplete = this.currentAnimation.onComplete

                this.emit(`${this.currentAnimation.key}:complete`)

                if (onComplete) {
                    onComplete()
                }
            }
        } catch (error) {
            console.error('Error in animation update:', error)
        } finally {
            this.isUpdating = false
        }
    }

    stop() {
        this.currentAnimation = null
        this.sequence = null
        this.sequenceIndex = 0
        this.sequenceKey = ''
    }

    destroy() {
        this.ticker.remove(this.update, this)
        this.removeAllListeners()
    }
}