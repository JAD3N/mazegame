import {Renderer} from './renderer';
import {Camera} from './camera';
import {Assets} from './assets';
import {Player} from './sprites/player';
import {Controller} from './controller';
import {Room} from './room';
import {RoomMap} from './map';

declare global {
	class Stats {
		public dom: HTMLElement;
		public update(): void;
	}
}

function randomString(length: number = 8): string {
	let result = '';
	let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for(let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
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

	private callbackId: number;

	public constructor() {
		this.state = Game.State.MENU;
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

				// room
				'treasure': 'assets/textures/treasure.png',
				'coin': 'assets/textures/coin.png',

				// threats
				'troll': 'assets/textures/troll.png',
				'parasite': 'assets/textures/parasite.png',
				'eye': 'assets/textures/eye.png'
			}
		})

		this.start();
	}

	private async start(): Promise<void> {
		await this.assets.load();

		// add canvas to page
		document.body.appendChild(this.renderer.canvas);
		document.body.appendChild(this.stats.dom);

		if(Game.DEBUG) {
			this.showStats = true;
		}

		this.player = new Player();
		this.controller = new Controller(this);
	}

	public startLevel(seed: string = undefined): void {
		if(seed === undefined) {
			seed = randomString(8);
		}

		if(this.state === Game.State.PLAYING) {
			cancelAnimationFrame(this.callbackId);
		}
	
		this.generateRooms(seed);
		this.loop();
	}

	private generateRooms(seed: string): void {
		this.map = new RoomMap(seed);
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
		this.state = Game.State.PLAYING;

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

				if(this.player.room.isEnd) {
					this.state = Game.State.WON;
					
					this.showWonMenu();
					this.updateGoldCounter();
					this.renderer.clear();
					
					return;
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
				this.callbackId = requestAnimationFrame(run);
			}

			run();
		} catch(err) {
			alert('Render error!');
		}
	}

	public updateGoldCounter(): void {
		const el = document.body.querySelector('.gold-counter');

		if(this.state === Game.State.PLAYING) {
			const gold = this.player.gold;
			const qty = el.querySelector('.qty');

			qty.innerHTML = gold + '';

			if(el.classList.contains('hidden')) {
				el.classList.remove('hidden');
			}
		} else {
			if(!el.classList.contains('hidden')) {
				el.classList.add('hidden');
			}
		}
	}

	public alert(message: string, actions: string[]): Promise<string> {
		return new Promise((resolve: (action: string) => void, reject: () => void) => {
			if(this.state === Game.State.PLAYING) {
				this.player.isPaused = true;
			}

			const el = document.querySelector('.alert');
			const messageEl = el.querySelector('.alert-message');
			const actionsEl = el.querySelector('.alert-actions');

			el.classList.remove('hidden');
			messageEl.textContent = message;

			while(actionsEl.firstChild) {
				actionsEl.removeChild(actionsEl.firstChild);
			}
			
			for(let action of actions) {
				const actionEl = document.createElement('li');

				actionEl.textContent = '> ' + action;
				actionEl.addEventListener('click', () => {
					el.classList.add('hidden');
					this.player.isPaused = false;
					resolve(action);
				});

				actionsEl.appendChild(actionEl);
			}
		});
	}

	public async showMainMenu(): Promise<void> {
		this.state = Game.State.MENU;

		const action = await this.alert('Maze Game', [
			'Play New',
			'Load Level'
		]);

		if(action === 'Load Level') {
			this.startLevel(prompt('Enter level seed:'));
		} else if(action === 'Play New') {
			this.startLevel();
		}
	}

	public async showPauseMenu(): Promise<void> {
		if(this.state !== Game.State.PLAYING) {
			return;
		}

		this.player.isPaused = true;
		
		const action = await this.alert('Main Menu', [
			'Restart Level',
			'New Level',
			'View Level Seed',
			'Close'
		]);

		if(action === 'Restart Level') {
			this.startLevel(this.map.seed);
		} else if(action === 'New Level') {
			this.startLevel();
		} else if(action === 'View Level Seed') {
			prompt('Level Seed:', this.map.seed);
		}

		this.player.isPaused = false;
	}

	public async showWonMenu(): Promise<void> {
		const action = await this.alert('You Win!', [
			'Restart Level',
			'New Level',
			'View Level Seed'
		]);

		if(action === 'Restart Level') {
			this.startLevel(this.map.seed);
		} else if(action === 'New Level') {
			this.startLevel();
		} else if(action === 'View Level Seed') {
			prompt('Level Seed:', this.map.seed);
		}
	}

}

export namespace Game {

	export enum State {
		MENU,
		PLAYING,
		WON,
		DEAD
	}

}