import {Renderer} from './renderer';
import {Camera} from './camera';
import {Assets} from './assets';
import {Player} from './sprites/player';
import {Controller} from './controller';
import {Room} from './room';
import {RoomMap} from './map';
import {humanTime} from './utils/time';

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

	public static DEBUG = false;
	public static SHOW_HITBOXES = false;
	public static SHOW_MAP = false;

	public readonly renderer: Renderer;
	public readonly camera: Camera;
	public readonly assets: Assets;

	public player: Player;
	public controller: Controller;
	public map: RoomMap;

	public state: Game.State;
	public stats: Stats;
	public isPaused: boolean;

	private callbackId: number;
	private time: number;

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
		});
	}

	public async load(): Promise<void> {
		await this.assets.load();

		// add canvas to page
		document.body.appendChild(this.renderer.canvas);
		document.body.appendChild(this.stats.dom);

		this.player = new Player({game: this});
		this.controller = new Controller(this);
	}

	public loadLevel(seed: string = undefined): void {
		if(seed === undefined) {
			seed = randomString(8);
		}

		if(this.state === Game.State.PLAYING) {
			cancelAnimationFrame(this.callbackId);
		}

		this.time = 0;
		this.isPaused = false;

		this.player.isPaused = false;
		this.player.gold = 0;

		this.generateRooms(seed);
		this.loop();
	}

	private generateRooms(seed: string): void {
		this.map = new RoomMap(this, seed);
		this.map.generate();

		const startRoom = this.map.startRoom;
		const random = this.map.prng;

		this.player.room = startRoom;
		this.player.isPaused = false;

		this.player.x = random() * (startRoom.width - 2) + 1;
		this.player.y = random() * (startRoom.height - 2) + 1;
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
				if(this.state !== Game.State.PLAYING) {
					return;
				}

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
					this.showWonMenu();
					return;
				}

				this.camera.update();
				this.currentRoom.update(this.player);

				const deltaTime = this.renderer.render(this.camera);

				if(!this.isPaused) {
					this.time += deltaTime;
				}

				this.updateStats();

				if(Game.DEBUG) {
					this.stats.update();
					this.stats.dom.style.display = 'block';
				} else {
					this.stats.dom.style.display = 'none';
				}

				// request next render batch
				this.callbackId = requestAnimationFrame(run);
			}

			requestAnimationFrame(run);
		} catch(err) {
			alert('Render error!');
		}
	}

	public updateStats(): void {
		const statsEl = document.body.querySelector('.stats');
		const goldEl = statsEl.querySelector('.gold');
		const timerEl = statsEl.querySelector('.timer');

		if(this.state === Game.State.PLAYING) {
			const gold = this.player.gold;
			const time = humanTime(this.time);

			const qtyEl = goldEl.querySelector('.qty');
			const timeEl = timerEl.querySelector('.time');

			qtyEl.textContent = gold + '';
			timeEl.textContent = time + '';

			if(statsEl.classList.contains('hidden')) {
				statsEl.classList.remove('hidden');
			}
		} else {
			if(!statsEl.classList.contains('hidden')) {
				statsEl.classList.add('hidden');
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

	public hideAlert(): void {
		const el = document.querySelector('.alert');

		if(!el.classList.contains('hidden')) {
			el.classList.add('hidden');
		}
	}

	public async showMainMenu(): Promise<void> {
		this.state = Game.State.MENU;
		this.endLevel();

		const action = await this.alert('Maze Game', [
			'Play New',
			'Load Level',
			'How To Play',
			'Credits'
		]);

		if(action === 'Play New') {
			this.loadLevel();
			return;
		} else if(action === 'Load Level') {
			const seed = prompt('Enter level seed:');

			if(seed !== null && seed.length) {
				this.loadLevel(seed);
				return;
			}
		} else if(action === 'How To Play') {
			await this.showInstructionsMenu();
		} else if(action === 'Credits') {
			await this.showCreditsMenu();
		}

		this.showMainMenu();
	}

	public async showPauseMenu(): Promise<void> {
		if(this.state !== Game.State.PLAYING) {
			return;
		}

		this.isPaused = true;
		this.player.isPaused = true;

		const action = await this.alert('Game Paused', [
			'Resume',
			'Restart Level',
			'New Level',
			'View Level Seed',
			'How To Play',
			'Main Menu'
		]);

		this.isPaused = false;
		this.player.isPaused = false;

		if(action === 'Restart Level') {
			this.loadLevel(this.map.seed);
		} else if(action === 'New Level') {
			this.loadLevel();
		} else if(action === 'View Level Seed') {
			prompt('Level Seed:', this.map.seed);
			this.showPauseMenu();
		} else if(action === 'How To Play') {
			await this.showInstructionsMenu();
			this.showPauseMenu();
		} else if(action === 'Main Menu') {
			this.showMainMenu();
		}
	}

	public async showWonMenu(): Promise<void> {
		this.state = Game.State.WON;
		this.endLevel();

		const action = await this.alert(`You Win! (${this.player.gold} gold, ${humanTime(this.time)})`, [
			'Restart Level',
			'New Level',
			'View Level Seed'
		]);

		if(action === 'Restart Level') {
			this.loadLevel(this.map.seed);
		} else if(action === 'New Level') {
			this.loadLevel();
		} else if(action === 'View Level Seed') {
			prompt('Level Seed:', this.map.seed);
			this.showWonMenu();
		}
	}

	public async showDeathMenu(): Promise<void> {
		this.state = Game.State.DEAD;
		this.endLevel();

		const action = await this.alert('You Lost!', [
			'Restart Level',
			'New Level',
			'View Level Seed'
		]);

		if(action === 'Restart Level') {
			this.loadLevel(this.map.seed);
		} else if(action === 'New Level') {
			this.loadLevel();
		} else if(action === 'View Level Seed') {
			prompt('Level Seed:', this.map.seed);
			this.showDeathMenu();
		}
	}

	public async showInstructionsMenu(stage: number = 0): Promise<void> {
		if(this.state === Game.State.PLAYING) {
			this.isPaused = true;
			this.player.isPaused = true;
		}

		// predefined actions
		const actions = [
			'Next',
			'Close'
		];

		let action;

		switch(stage) {
			case 0:
				action = await this.alert('You can use WASD to move your character in the room.', actions);
				break;
			case 1:
				action = await this.alert('You can drop gold by pressing Q on your keyboard.', actions);
				break;
			case 2:
				action = await this.alert('Threats can be defeated by certain choices.', actions);
				break;
			case 3:
				action = await this.alert('If you choose incorrectly, you will lose some gold or die if you don\'t have enough.', actions);
				break;
			case 4:
				action = await this.alert('You can pick up gold coins or loot treasure chests.', actions);
				break;
			case 5:
				action = await this.alert('The maze is beat when you find the escape passage. Have fun!', ['Close']);
				break;
		}

		if(action === 'Next') {
			await this.showInstructionsMenu(stage + 1);
		} else if(action === 'Close') {
			if(this.state === Game.State.PLAYING) {
				this.isPaused = false;
				this.player.isPaused = false;
			}
		}
	}

	public async showCreditsMenu(): Promise<void> {
		await this.alert('This game was created by Jaden Buchan.', ['Close']);
	}

	private endLevel(): void {
		if(this.callbackId) {
			cancelAnimationFrame(this.callbackId);
		}

		this.renderer.clear();
		this.updateStats();
		this.callbackId = null;
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
