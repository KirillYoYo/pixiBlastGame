export class ScoreModel {
    value: number = 0

    add(amount: number) {
        this.value += amount
    }

    reset() {
        this.value = 0
    }
}