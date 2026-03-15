import { Assets, Graphics, ParticleContainer, Particle, TypedArray, Texture } from 'pixi.js'

import { Scene } from '@/core/RootContainer'
import { GAME_HEIGHT, GAME_WIDTH } from '@/core/Game'
import {
    bg_booster,
    bg_frame_moves,
    bg_frame_play,
    bg_moves,
    icon_booster_bomb,
    icon_booster_teleport,
    img_bg_game,
    slot_frame_moves,
} from '@/consts'

const PARTICLE_FIELDS = {
    X_SPEED: 0,
    Y_SPEED: 1,
    START_X: 2,
    START_Y: 3,
    vx: 4,
    vy: 5,
} as const

const RAIN_CONFIG = {
    MAX_PARTICLES: 10000,
    ALPHA_MIN: 0.8,
    ALPHA_MAX: 1.0,
    X_SPEED_MIN: 1,
    X_SPEED_MAX: 4,
    Y_SPEED_MIN: 3,
    Y_SPEED_MAX: 10,
    RESPAWN_OFFSET: 50,
    PARTICLE_SIZE: 5,
    PARTICLE_COLOR: 0x4f46e5,
    PARTICLE_ALPHA: 0.4,
} as const

export class PartSceneParticleContainer extends Scene {
    private rainContainer!: ParticleContainer
    private movementData!: TypedArray
    private fieldsLength = Object.keys(PARTICLE_FIELDS).length
    private windLife: number
    private windPause: number
    private wind: number[] = []

    public async onEnter(): Promise<void> {
        await this.loadAssets()

        const dropTexture = this.createDropTexture()
        this.createRainContainer()
        this.generateParticles(dropTexture)
        this.initializeMovementData()

        this.windDebug = new Graphics()
        this.addChild(this.windDebug)
    }

    private async loadAssets(): Promise<void> {
        await Assets.load([
            { alias: bg_frame_moves, src: './assets/bg_frame_moves.png' },
            { alias: img_bg_game, src: './assets/img_bg_game.png' },
            { alias: bg_frame_play, src: './assets/bg_frame_play.png' },
            { alias: bg_moves, src: './assets/bg_moves.png' },
            { alias: slot_frame_moves, src: './assets/slot_frame_moves.png' },
            { alias: bg_booster, src: './assets/bg_booster.png' },
            { alias: icon_booster_bomb, src: './assets/icon_booster_bomb.png' },
            { alias: icon_booster_teleport, src: './assets/icon_booster_teleport.png' },
        ])
    }

    private createDropTexture(): Texture {
        const round = new Graphics()
        round.roundRect(0, 0, RAIN_CONFIG.PARTICLE_SIZE, RAIN_CONFIG.PARTICLE_SIZE, 999)
        round.fill(RAIN_CONFIG.PARTICLE_COLOR)
        round.alpha = RAIN_CONFIG.PARTICLE_ALPHA

        const renderer = (window as any).__PIXI_APP__.renderer
        return renderer.generateTexture(round)
    }

    private createRainContainer(): void {
        this.rainContainer = new ParticleContainer({
            // properties: {
            //     position: true,
            //     scale: true,
            //     alpha: true,
            // },
            // autoSize: true,
        })

        this.addChild(this.rainContainer)
        console.log('[PartScene] Rain container created')
    }

    private generateParticles(texture: Texture): void {
        console.log('[PartScene] Generating particles...')

        for (let i = 0; i < RAIN_CONFIG.MAX_PARTICLES; i++) {
            const particle = new Particle({
                texture,
                x: randomInt(0, GAME_WIDTH),
                y: randomInt(0, GAME_HEIGHT),
                alpha: randomFloat(RAIN_CONFIG.ALPHA_MIN, RAIN_CONFIG.ALPHA_MAX),
                // xv: this.movementData[i * this.fieldsLength + 0],
                // yv: this.movementData[i * this.fieldsLength + 1],
            })

            this.rainContainer.addParticle(particle)
        }
    }

    private initializeMovementData(): void {
        const particles = this.rainContainer?.particleChildren

        if (!particles) {
            console.warn('[PartScene] No particles to initialize movement data')
            return
        }

        this.movementData = new Float32Array(particles.length * this.fieldsLength)

        particles.forEach((_, index) => {
            const baseIndex = index * this.fieldsLength

            // Лёгкий горизонтальный дрейф
            this.movementData[baseIndex + PARTICLE_FIELDS.X_SPEED] = randomInt(
                RAIN_CONFIG.X_SPEED_MIN,
                RAIN_CONFIG.X_SPEED_MAX
            )

            // Вертикальная скорость
            this.movementData[baseIndex + PARTICLE_FIELDS.Y_SPEED] = randomInt(
                RAIN_CONFIG.Y_SPEED_MIN,
                RAIN_CONFIG.Y_SPEED_MAX
            )

            // Начальная позиция X для респавна
            this.movementData[baseIndex + PARTICLE_FIELDS.START_X] = randomInt(0, GAME_WIDTH)

            // Начальная позиция Y для респавна
            this.movementData[baseIndex + PARTICLE_FIELDS.START_Y] = randomInt(0, GAME_HEIGHT)

            // Начальная позиция X для респавна
            this.movementData[baseIndex + PARTICLE_FIELDS.vx] = randomInt(2, 4)

            // Начальная позиция Y для респавна
            this.movementData[baseIndex + PARTICLE_FIELDS.vy] = randomInt(2, 4)
        })
    }

    getWind() {
        const windStartX = Math.random() * GAME_WIDTH
        const windStartY = Math.random() * GAME_HEIGHT
        const windEndX = Math.random() * GAME_WIDTH
        const windEndY = Math.random() * GAME_HEIGHT
        let windDirX = windEndX - windStartX
        let windDirY = windEndY - windStartY
        const length = Math.sqrt(windDirX * windDirX + windDirY * windDirY)
        windDirX /= length
        windDirY /= length
        const windStrength = 0.55 + Math.random() * 1.5
        windDirX *= windStrength
        windDirY *= windStrength

        this.wind = [windDirX, windDirY, windStartX, windStartY, windStrength]
        this.drawWindDebug()
    }

    public update(): void {
        const particles = this.rainContainer?.particleChildren

        if (!particles?.length) {
            return
        }

        const maxX = GAME_WIDTH + RAIN_CONFIG.RESPAWN_OFFSET
        const maxY = GAME_HEIGHT + RAIN_CONFIG.RESPAWN_OFFSET
        const minX = -RAIN_CONFIG.RESPAWN_OFFSET

        if (!this.windLife && !this.windPause) {
            this.getWind()
            this.windLife = randomInt(200, 580)
            console.log('start wind')
        }
        if (this.windLife && !this.windPause) {
            this.windLife--
        }
        if (this.windLife === 0 && !this.windPause) {
            console.log('stop wind')
            this.windPause = randomInt(60, 280)
            this.wind = [0, 0, 0, 0, 0]
            this.drawWindDebug()
        }
        if (this.windPause > 0) {
            this.windPause--
        }
        const windX = this.windLife ? this.wind[0] : add0
        const windY = this.windLife ? this.wind[1] : 0
        // console.log('windLife', this.windLife)
        const lessByLife = wind => {
            if (this.windLife < 100) {
                return wind * (0.1 * (this.windLife / 10))
            }
            return wind
        }

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i]
            const baseIndex = i * this.fieldsLength

            // текущая скорость
            let vx = this.movementData[baseIndex + PARTICLE_FIELDS.X_SPEED]
            let vy = this.movementData[baseIndex + PARTICLE_FIELDS.Y_SPEED]

            const windXTick = lessByLife(windX)
            const windYTick = lessByLife(windY)

            // проверяем направление движения относительно ветра
            const dot = vx * windXTick + vy * windYTick

            if (dot < 0) {
                // частица против ветра → гасим скорость
                vx *= 0.92
                // vy *= 0.92
            } else {
                // по ветру → ускоряем
                vx += windXTick * 0.2
                vy += windYTick * 0.2
            }

            // сопротивление воздуха
            vx *= 0.98
            // vy *= 0.98

            // сохраняем новую скорость
            this.movementData[baseIndex + PARTICLE_FIELDS.X_SPEED] = vx
            this.movementData[baseIndex + PARTICLE_FIELDS.Y_SPEED] = vy

            if (!this.windLife) {
                this.movementData[baseIndex + PARTICLE_FIELDS.X_SPEED] = randomInt(
                    RAIN_CONFIG.X_SPEED_MIN,
                    RAIN_CONFIG.X_SPEED_MAX
                )
                this.movementData[baseIndex + PARTICLE_FIELDS.Y_SPEED] = randomInt(
                    RAIN_CONFIG.Y_SPEED_MIN,
                    RAIN_CONFIG.Y_SPEED_MAX
                )
            }

            // обновляем позицию
            particle.x += vx
            particle.y += vy

            // респавн
            if (this.shouldRespawn(particle, maxX, maxY, minX)) {
                particle.x = randomInt(0, GAME_WIDTH)
                particle.y = randomInt(0, GAME_HEIGHT)
                /**/
                // Лёгкий горизонтальный дрейф
                this.movementData[baseIndex + PARTICLE_FIELDS.X_SPEED] = randomInt(
                    RAIN_CONFIG.X_SPEED_MIN,
                    RAIN_CONFIG.X_SPEED_MAX
                )

                // Вертикальная скорость
                this.movementData[baseIndex + PARTICLE_FIELDS.Y_SPEED] = randomInt(
                    RAIN_CONFIG.Y_SPEED_MIN,
                    RAIN_CONFIG.Y_SPEED_MAX
                )

                // Начальная позиция X для респавна
                this.movementData[baseIndex + PARTICLE_FIELDS.START_X] = randomInt(0, GAME_WIDTH)

                // Начальная позиция Y для респавна
                this.movementData[baseIndex + PARTICLE_FIELDS.START_Y] = randomInt(0, GAME_HEIGHT)

                // Начальная позиция X для респавна
                this.movementData[baseIndex + PARTICLE_FIELDS.vx] = randomInt(2, 4)

                // Начальная позиция Y для респавна
                this.movementData[baseIndex + PARTICLE_FIELDS.vy] = randomInt(2, 4)
            }
        }
    }

    private shouldRespawn(particle: Particle, maxX: number, maxY: number, minX: number): boolean {
        return particle.y > maxY || particle.x < minX || particle.x > maxX
    }

    private respawnParticle(particle: Particle, baseIndex: number): void {
        particle.x = this.movementData[baseIndex + PARTICLE_FIELDS.START_X]
        particle.y = this.movementData[baseIndex + PARTICLE_FIELDS.START_Y]
    }

    public onExit(): void {
        console.log('[PartScene] Exiting scene')

        if (this.rainContainer) {
            this.rainContainer.destroy({ children: true })
        }
    }

    drawWindDebug() {
        if (!this.wind) return

        const [dirX, dirY, startX, startY, stretch] = this.wind
        console.log('stretch', stretch)

        const scale = 120 // масштаб силы ветра

        const endX = startX + dirX * scale
        const endY = startY + dirY * scale

        const g = this.windDebug
        g.clear()

        g.moveTo(startX, startY)
        g.lineTo(endX, endY)

        // наконечник стрелки
        const angle = Math.atan2(endY - startY, endX - startX)

        const arrowSize = 10

        g.moveTo(endX, endY)
        g.lineTo(
            endX - Math.cos(angle - Math.PI / 6) * arrowSize,
            endY - Math.sin(angle - Math.PI / 6) * arrowSize
        )

        g.moveTo(endX, endY)
        g.lineTo(
            endX - Math.cos(angle + Math.PI / 6) * arrowSize,
            endY - Math.sin(angle + Math.PI / 6) * arrowSize
        )

        g.stroke({ width: 3, color: 0xff0000 })
    }
}

// Вспомогательные функции
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
}