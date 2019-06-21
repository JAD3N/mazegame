import {Renderer} from './renderer';
import {Camera} from './camera';
import {Assets} from './assets';
import {Player} from './sprites/player';
import {Controller} from './controller';
import {Room} from './room';
import {Direction} from './utils/direction';
import {RoomMap} from './map';

declare global {
	class Stats {
		public dom: HTMLElement;
		public update(): void;
	}
}

export class Game {

	public static DEBUG: boolean = true;
	public static SHOW_HITBOXES: boolean = false;

	public readonly renderer: Renderer;
	public readonly camera: Camera;
	public readonly assets: Assets;

	public player: Player;
	public controller: Controller;
	public map: RoomMap;

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
				'player-idle': 'assets/textures/player-idle.png',

				'treasure': 'assets/textures/treasure.png',
				'coin': 'assets/textures/coin.png'
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
	
		this.generateRooms();

		// start render loop
		this.assets.load()
			.then(() => this.loop())
			.catch(() => alert('Error loading textures.'));
	}

	private generateRooms(): void {
		this.map = new RoomMap('randomseed');
		this.map.generate();

		const starterRoom = this.map.starterRoom;
		const random = this.map.prng;

		this.player.room = starterRoom;
		this.player.x = random() * (starterRoom.width - 2) + 1;
		this.player.y = random() * (starterRoom.height - 2) + 1;
	}

	public get currentRoom(): Room {
		return this.player.room;
	}

	private loop(): void {
		console.log('Game started.');

		// set to true to force a resize on start
		let hasResized = true;

		window.addEventListener('resize', function() {
			hasResized = true;
		});

		try {
			const run: () => void = (): void => {
				if(hasResized) {
					hasResized = false;

					// resize canvas
					this.renderer.resize(
						this.renderer.canvas.clientWidth,
						this.renderer.canvas.clientHeight
					);
				}

				// render canvas
				this.controller.update();

				if(!this.camera.isPanning) {
					this.camera.x = this.player.x;
					this.camera.y = this.player.y;
				}

				this.camera.update();
				this.currentRoom.update(this.player);
				this.renderer.render(this.camera);

				this.updateGoldCounter();

				if(this.showStats) {
					this.stats.update();
					this.stats.dom.style.display = 'block';
				} else {
					this.stats.dom.style.display = 'none';
				}

				// request next render batch
				requestAnimationFrame(run);
			}

			run();
		} catch(err) {
			alert('Render error!');
		}
	}

	public updateGoldCounter(): void {
		const gold = this.player.gold;
		const el = document.body.querySelector('.gold-counter .qty');

		el.innerHTML = gold + '';
	}

}

export namespace Game {

	export enum State {
		MENU,
		PLAYING,
		DEAD
	}

}