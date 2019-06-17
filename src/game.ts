import {Renderer} from './renderer';
import {Camera} from './camera';
import {Assets} from './assets';
import {Player} from './sprites/player';
import {Controller} from './controller';

declare global {
	class Stats {
		public dom: HTMLElement;
		public update(): void;
	}
}

export class Game {

	public static readonly DEBUG: boolean = true;

	public readonly renderer: Renderer;
	public readonly camera: Camera;
	public readonly assets: Assets;

	public player: Player;
	public controller: Controller;

	public state: Game.State;
	public stats: Stats;
	public showStats: boolean;

	public constructor() {
		this.state = Game.State.PLAYING;
		this.renderer = new Renderer(this);
		this.camera = new Camera();
		this.stats = new Stats();
		this.assets = new Assets({
			textures: {
				// player textures
				'player-front': 'assets/textures/player-front.png',
				'player-back': 'assets/textures/player-back.png',
				'player-left': 'assets/textures/player-left.png',
				'player-right': 'assets/textures/player-right.png',
				'player-idle': 'assets/textures/player-idle.png'
			}
		})

		this.start();
	}

	private async start(): Promise<void> {
		// add canvas to page
		document.body.appendChild(this.renderer.canvas);
		document.body.appendChild(this.stats.dom);

		if(Game.DEBUG) {
			this.showStats = true;
		}

		this.player = new Player();
		this.controller = new Controller(this.player);

		// start render loop
		this.assets.load()
			.then(() => this.loop())
			.catch(() => alert('Error loading textures!'));
	}

	private loop(): void {
		const renderer = this.renderer;
		const controller = this.controller;
		const camera = this.camera;
		const stats = this.stats;
		const scope = this;

		// set to true to force a resize on start
		let hasResized = true;

		window.addEventListener('resize', function() {
			hasResized = true;
		});

		function run(): void {
			if(hasResized) {
				hasResized = false;

				// resize canvas
				renderer.resize(
					renderer.canvas.clientWidth,
					renderer.canvas.clientHeight
				);
			}

			// render canvas
			controller.update();
			camera.update();
			renderer.render(camera);

			if(scope.showStats) {
				stats.update();
				stats.dom.style.display = 'block';
			} else {
				stats.dom.style.display = 'none';
			}

			// request next render batch
			requestAnimationFrame(run);
		}

		run();
	}

}

export namespace Game {

	export enum State {
		MENU,
		PLAYING,
		DEAD
	}

}