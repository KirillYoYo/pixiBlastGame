import { GAME_WIDTH } from '@/core/Game'
import { Container, Graphics } from 'pixi.js'

// :-)
export const setTransparentBg = (content: Container<any>, contentHeight: number) => {
    const contentBg: Graphics = new Graphics()

    contentBg.beginFill(0x000000, 0) // прозрачный
    contentBg.drawRect(0, 0, GAME_WIDTH, contentHeight)
    contentBg.endFill()

    content.addChild(contentBg)
}

/**
 * Создаёт экспоненциальную функцию с настраиваемой "силой"
 * @param strength - сила экспоненциального роста (1 = линейная, >1 = экспоненциальная)
 * @param maxInput - максимальное входное значение для нормализации
 * @returns функция, преобразующая входное значение
 */
function createExponentialMapper(
    strength: number = 1.5,
    maxInput: number = 17
): (x: number) => number {
    return (x: number): number => {
        // Нормализуем входное значение от 0 до 1
        const t = x / maxInput

        // Применяем экспоненциальное преобразование
        // strength = 1: линейный рост (t)
        // strength > 1: экспоненциальный рост (t^strength)
        const expT = Math.pow(t, strength)

        // Возвращаем в исходный масштаб (0-maxInput)
        return expT * maxInput
    }
}

const weakMapper = createExponentialMapper(1.2, 17)

const mediumMapper = createExponentialMapper(1.5, 17)

const strongMapper = createExponentialMapper(2.0, 17)

export const exponentFn = strongMapper