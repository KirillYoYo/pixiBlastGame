export class MovesModel {
    left: number

    constructor(initial: number) {
        this.left = initial
    }

    spend() {
        this.left = Math.max(0, this.left - 1)
    }
}