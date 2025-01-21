import {WebGLRenderer} from 'three'

export default class UI {
    spinner: HTMLDivElement
    instructions: HTMLDivElement
    turnText: HTMLSpanElement
    roundText: HTMLButtonElement
    scoreText: HTMLSpanElement
    totalScoreWrapper: HTMLDivElement
    endText: HTMLSpanElement
    // 추후 고정 카메라 세팅을 위해 추가
    renderer: WebGLRenderer

    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.spinner = document.getElementById('spinner') as HTMLDivElement
        this.instructions = document.getElementById('instructions') as HTMLDivElement
        this.turnText = document.getElementById("turn") as HTMLSpanElement;
        this.roundText = document.getElementById('round-start') as HTMLButtonElement;
        this.scoreText = document.getElementById('total-score') as HTMLSpanElement;
        this.totalScoreWrapper = document.getElementById('final-score-wrapper') as HTMLDivElement;
        this.endText = document.getElementById('final-score') as HTMLSpanElement;
        const startButton = document.getElementById('startButton') as HTMLButtonElement
        startButton.addEventListener(
            'click',
            () => {
                this.instructions.style.display = 'none'
            },
            false
        )
    }

    instructHide() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'none'
        this.totalScoreWrapper.style.display = 'none'
    }

    instructShow() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'block'
        this.totalScoreWrapper.style.display = 'none'
    }

    scoreShow() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'none'
        this.totalScoreWrapper.style.display = 'block'
    }

    setTurnText(turn: number) {
        this.turnText.textContent = `(${turn}/12)`;
    }

    setRoundText(round: number) {
        this.roundText.textContent = `라운드 시작 (${round}/3)`;
    }

    resetRoundText() {
        this.roundText.textContent = "0";
    }

    setScoreText(score: number) {
        this.scoreText.textContent = score + "";
    }

    setEndText(score: number) {
        this.endText.textContent = score + "";
    }
}