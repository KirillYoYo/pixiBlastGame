import { Container, Ticker, Graphics } from 'pixi.js'
import { BoardModel } from './BoardModel'
import { CellView } from './CellView'
import { CellModel } from './CellModel'
import { EventBus, Events } from '@/game/store/EventBus'
import { AdvancedAnimationManager } from '@/animationManager'
import { exponentFn } from '@/helpers'

const FALL_DURATION = 0.2

interface FlyingParticle {
    graphics: Graphics
    x: number
    y: number
    vx: number
    vy: number
    targetX: number
    targetY: number
    stage: 'scatter' | 'gather'
    alpha: number
    id: string
    progress: number
}

export class BoardView extends Container {
    private board: BoardModel
    private cellSize: number
    private gap: number = 6

    private cellViews = new Map<number, CellView>()
    private fallingCells: {
        view: CellView
        targetY: number
        progress: number
        startY: number
    }[] = []

    private animator: AdvancedAnimationManager

    private particles: FlyingParticle[] = []
    private readonly SCATTER_FORCE = 8
    private readonly GATHER_SPEED = 5
    private readonly PARTICLE_SIZE = 15
    private gatherCompleteCallback?: () => void

    constructor(board: BoardModel, cellSize: number) {
        super()
        this.board = board
        this.cellSize = cellSize

        this.animator = new AdvancedAnimationManager(Ticker.shared)

        this.build()
        Ticker.shared.add(this.update, this)
    }

    private build() {
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const cell = this.board.getCell(r, c)
                if (!cell) continue
                this.createCellView(cell, r, c)
            }
        }

        EventBus.on(Events.BOARD_UPDATED, ({ removed, moved, spawned }) => {
            // Создаём частицы из удалённых клеток
            if (removed.length > 0) {
                this.createParticlesFromRemoved(removed)
            }

            // удаляем клетки
            removed.forEach(cell => {
                const view = this.cellViews.get(cell.id)
                if (view) {
                    view.destroy()
                    this.cellViews.delete(cell.id)
                }
            })

            // падаем существующие
            moved.forEach(({ cell, toRow }) => {
                const view = this.cellViews.get(cell.id)
                if (!view) return
                const targetY = toRow * (this.cellSize + this.gap)
                this.fallingCells.push({ view, targetY, progress: 0, startY: view.y })
            })

            // создаём новые
            spawned.forEach(({ cell, row, col, spawnRow }) => {
                const view = new CellView(cell, this.cellSize)
                view.x = col * (this.cellSize + this.gap)
                view.y = this.cellSize * (spawnRow + 1)
                this.cellViews.set(cell.id, view)
                this.addChild(view)
                this.fallingCells.push({
                    view,
                    targetY: row * (this.cellSize + this.gap),
                    progress: 0,
                    startY: view.y,
                })

                view.eventMode = 'static'
                view.cursor = 'pointer'
                view.on('pointertap', () => this.board.onCellClick(cell.row, cell.col))
            })
        })

        // Подписываемся на события анимации частиц
        this.setupParticleAnimations()
    }

    private setupParticleAnimations() {
        // Анимация сбора частиц (gather)
        this.animator.on('particles:gather:start', () => {
            this.particles.forEach(p => {
                p.stage = 'gather'
            })
        })

        // Анимация очистки частиц
        this.animator.on('particles:clear:complete', () => {
            this.particles.forEach(p => {
                p.graphics.destroy()
            })
            this.particles = []
        })
    }

    private createParticlesFromRemoved(removed: CellModel[]) {
        const gatherX = this.width / 2
        const gatherY = -120

        let centerX = 0,
            centerY = 0
        removed.forEach(cell => {
            const view = this.cellViews.get(cell.id)
            if (view) {
                centerX += view.x
                centerY += view.y
            }
        })
        centerX /= removed.length
        centerY /= removed.length

        removed.forEach(cell => {
            const view = this.cellViews.get(cell.id)
            if (!view) return

            // Получаем позицию удалённой клетки
            const startX = view.x
            const startY = view.y

            // Создаём несколько частиц из каждой клетки
            const particlesCount = removed.length + exponentFn(removed.length)

            const dx = startX - centerX
            const dy = startY - centerY

            // Нормализуем вектор
            const length = Math.sqrt(dx * dx + dy * dy) || 1
            const dirX = dx / length
            const dirY = dy / length

            // Базовый угол от центра
            const baseAngle = Math.atan2(dirY, dirX)

            for (let i = 0; i < particlesCount; i++) {
                // Случайное направление разлёта
                const spread = (i - particlesCount / 2) * 0.3 // Разброс ±0.3 радиана
                const angle = baseAngle + spread + (Math.random() - 0.5) * 0.2

                const speed = this.SCATTER_FORCE * (0.8 + Math.random() * 0.7)

                const particle = new Graphics()
                particle.circle(0, 0, this.PARTICLE_SIZE / 2)
                particle.fill(cell.type)
                particle.stroke({ width: 1, color: 0xffffff })

                particle.x = startX
                particle.y = startY
                particle.alpha = 0.9

                this.addChild(particle)

                const particleId = `particle_${cell.id}_${i}`

                this.particles.push({
                    graphics: particle,
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    targetX: gatherX + (Math.random() - 0.5) * 20,
                    targetY: gatherY + (Math.random() - 0.5) * 30,
                    stage: 'scatter',
                    alpha: 1,
                    id: particleId,
                    progress: 0,
                })
            }
        })

        // Если есть частицы, запускаем анимацию через менеджер
        if (this.particles.length > 0) {
            this.animator.playSequence('particles', [
                {
                    key: 'scatter',
                    duration: 1000 + exponentFn(removed.length) * 50,
                    onProgress: progress => {
                        // мерцание
                        if (progress > 0.8) {
                            this.particles.forEach(p => {
                                if (p.graphics) {
                                    p.graphics.alpha = 0.9 + Math.sin(progress * 20) * 0.1
                                }
                            })
                        }
                    },
                },
                {
                    key: 'gather',
                    duration: 1500,
                    onProgress: progress => {
                        this.particles.forEach(p => {
                            if (p.stage !== 'gather') {
                                p.stage = 'gather'
                            }

                            const dx = p.targetX - p.x
                            const dy = p.targetY - p.y

                            p.x += dx * 0.05 * this.GATHER_SPEED * progress
                            p.y += dy * 0.05 * this.GATHER_SPEED * progress

                            // Уменьшаем прозрачность в конце пути
                            const distance = Math.sqrt(dx * dx + dy * dy)
                            if (distance < 50) {
                                p.alpha *= 0.95
                                p.graphics.alpha = p.alpha
                            }

                            // Плавное затухание в конце
                            if (progress > 0.7) {
                                const fadeProgress = (progress - 0.7) / 0.3
                                p.alpha = 1 - fadeProgress
                                p.graphics.alpha = p.alpha
                            }
                        })
                    },
                },
            ])

            this.animator.once('particles:sequenceComplete', () => {
                this.particles.forEach(p => {
                    p.graphics.destroy()
                })
                this.particles = []

                // EventBus.emit(Events.PARTICLE_ANIMATION_COMPLETE, {
                //     particlesCount: this.particles.length,
                // })
            })
        }
    }

    private createCellView(cell: CellModel, row: number, col: number) {
        const view = new CellView(cell, this.cellSize)
        view.x = col * (this.cellSize + this.gap)
        view.y = row * (this.cellSize + this.gap)

        view.eventMode = 'static'
        view.cursor = 'pointer'
        view.on('pointertap', () => {
            this.board.onCellClick(cell.row, cell.col)
        })

        this.cellViews.set(cell.id, view)
        this.addChild(view)
    }

    private update(delta: Ticker) {
        // Анимация падающих клеток
        const deltaSeconds = delta.deltaTime / 60 // примерно в секундах
        for (let i = this.fallingCells.length - 1; i >= 0; i--) {
            const falling = this.fallingCells[i]

            // Увеличиваем прогресс
            falling.progress += deltaSeconds / FALL_DURATION

            if (falling.progress >= 1) {
                falling.view.y = falling.targetY
                this.fallingCells.splice(i, 1)
            } else {
                // Квадратичная функция - медленно в начале, быстро в конце
                // progress^2 даёт ускорение к концу
                const easedProgress = Math.pow(falling.progress, 2)

                falling.view.y = falling.startY + (falling.targetY - falling.startY) * easedProgress
            }
        }

        // Анимация частиц
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]

            if (p.stage === 'scatter') {
                // Фаза разлёта
                p.x += p.vx * delta.deltaTime
                p.y += p.vy * delta.deltaTime

                // Замедление
                p.vx *= 0.98
                p.vy *= 0.98

                // Добавляем небольшую гравитацию
                p.vy += 0.1 * delta.deltaTime

                // Обновляем позицию графики
                p.graphics.x = p.x
                p.graphics.y = p.y

                // Добавляем вращение
                p.graphics.rotation += 0.05 * delta.deltaTime
            } else if (p.stage === 'gather') {
                const dx = p.targetX - p.x
                const dy = p.targetY - p.y

                p.x += dx * 0.05 * this.GATHER_SPEED * delta.deltaTime
                p.y += dy * 0.05 * this.GATHER_SPEED * delta.deltaTime

                p.graphics.x = p.x
                p.graphics.y = p.y
                p.graphics.rotation += 0.05 * delta.deltaTime
            }
        }
    }

    public destroy() {
        this.animator.stop()
        this.animator.destroy()
        Ticker.shared.remove(this.update, this)
        super.destroy()
    }
}