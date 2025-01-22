import {PerspectiveCamera, WebGLRenderer} from 'three'

export default class UI {
    container: HTMLDivElement
    canvas: HTMLCanvasElement
    spinner: HTMLDivElement
    instructions: HTMLDivElement
    turnText: HTMLSpanElement
    roundText: HTMLButtonElement
    scoreText: HTMLSpanElement
    totalScoreWrapper: HTMLDivElement
    endText: HTMLSpanElement
    mobileBtn: HTMLSpanElement;
    isMobile: boolean = false;
    // 추후 고정 카메라 세팅을 위해 추가
    renderer: WebGLRenderer
    camera: PerspectiveCamera

    constructor(renderer: WebGLRenderer, camera: PerspectiveCamera) {
        this.renderer = renderer
        this.camera = camera
        this.container = document.querySelector('.container') as HTMLDivElement;
        this.canvas = document.querySelector('canvas#gameCanvas') as HTMLCanvasElement;
        this.spinner = document.getElementById('spinner') as HTMLDivElement;
        this.instructions = document.getElementById('instructions') as HTMLDivElement;
        this.turnText = document.getElementById("turn") as HTMLSpanElement;
        this.roundText = document.getElementById('round-start') as HTMLButtonElement;
        this.scoreText = document.getElementById('total-score') as HTMLSpanElement;
        this.totalScoreWrapper = document.getElementById('final-score-wrapper') as HTMLDivElement;
        this.endText = document.getElementById('final-score') as HTMLSpanElement;
        this.mobileBtn = document.getElementById('roll') as HTMLSpanElement;
        const startButton = document.getElementById('startButton') as HTMLButtonElement
        startButton.addEventListener(
            'click',
            () => {
                this.instructHide();
            },
            false
        )
    }

    init() {
        this.resize();
        this.checkMobile();
        let resizeTimeout: number;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                this.resize();
                this.checkMobile();
            }, 250);
        });
    }

    resize() {
        const width = this.container.clientWidth;
        let height = this.container.clientHeight;

        this.canvas.width = width;
        if (width <= 700) {
            height -= 300;
        }
        this.canvas.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    instructHide() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'none'
        this.totalScoreWrapper.style.display = 'none'
    }

    instructShow() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'grid'
        this.totalScoreWrapper.style.display = 'none'
    }

    scoreShow() {
        this.spinner.style.display = 'none'
        this.instructions.style.display = 'none'
        this.totalScoreWrapper.style.display = 'flex'
    }

    setTurnText(turn: number) {
        this.turnText.textContent = `(${turn}/12)`;
    }

    setRoundText(round: number) {
        this.roundText.textContent = `Round (${round}/3)`;
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

    checkMobile() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (this.isMobile) {
            this.mobileBtn.classList.remove("hide");
            this.mobileBtn.classList.add("show");
        } else {
            this.mobileBtn.classList.remove("show");
            this.mobileBtn.classList.add("hide");
        }
    }
}