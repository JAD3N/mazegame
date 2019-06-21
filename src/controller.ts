import {Direction} from './utils/direction';
import {Game} from './game';

const KEY_W = 87; // up
const KEY_A = 65; // left
const KEY_S = 83; // down
const KEY_D = 68; // right

const KEY_H = 72; // debug hitboxes
const KEY_M = 77; // debug map
const KEY_Q = 81; // drop coin

const KEY_ESC = 27; // show pause menu

const KEYS = [
	KEY_W,
	KEY_A,
	KEY_S,
	KEY_D,

	KEY_H,
	KEY_M,
	KEY_Q,

	KEY_ESC
];

export class Controller {

	public game: Game;
	public activeKeys: Set<number>;

	public constructor(game: Game) {
		this.game = game;
		this.activeKeys = new Set<number>();

		window.addEventListener('keydown', this.onKeyDown.bind(this));
		window.addEventListener('keypress', this.preventEvent.bind(this));
		window.addEventListener('keyup', this.onKeyUp.bind(this));
		window.addEventListener('blur', this.resetKeys.bind(this));
	}

	private resetKeys(): void {
		this.activeKeys.clear();
	}

	private preventEvent(event: KeyboardEvent): void {
		for(let key of KEYS) {
			if(event.keyCode === key) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	}

	private onKeyDown(event: KeyboardEvent): void {
		const activeKeys = this.activeKeys;
		const keyCode = event.keyCode;

		this.preventEvent(event);

		if(keyCode === KEY_W && !activeKeys.has(KEY_W)) activeKeys.add(KEY_W);
		if(keyCode === KEY_A && !activeKeys.has(KEY_A)) activeKeys.add(KEY_A);
		if(keyCode === KEY_S && !activeKeys.has(KEY_S)) activeKeys.add(KEY_S);
		if(keyCode === KEY_D && !activeKeys.has(KEY_D)) activeKeys.add(KEY_D);

		if(keyCode === KEY_H) Game.SHOW_HITBOXES = !Game.SHOW_HITBOXES;
		if(keyCode === KEY_M) Game.SHOW_MAP = !Game.SHOW_MAP;
		if(keyCode === KEY_Q) this.game.player.dropCoin();
		if(keyCode === KEY_ESC) this.game.showPauseMenu();
	}

	private onKeyUp(event: KeyboardEvent): void {
		const activeKeys = this.activeKeys;
		const keyCode = event.keyCode;

		this.preventEvent(event);

		if(keyCode === KEY_W && activeKeys.has(KEY_W)) activeKeys.delete(KEY_W);
		if(keyCode === KEY_A && activeKeys.has(KEY_A)) activeKeys.delete(KEY_A);
		if(keyCode === KEY_S && activeKeys.has(KEY_S)) activeKeys.delete(KEY_S);
		if(keyCode === KEY_D && activeKeys.has(KEY_D)) activeKeys.delete(KEY_D);
	}

	public update(): void {
		const activeKeys = this.activeKeys;
		const player = this.game.player;
		player.isMoving = false;

		if(activeKeys.has(KEY_W) && !activeKeys.has(KEY_S)) {
			player.direction = Direction.NORTH;
			player.isMoving = true;
		}

		if(activeKeys.has(KEY_A) && !activeKeys.has(KEY_D)) {
			player.direction = Direction.WEST;
			player.isMoving = true;
		}

		if(activeKeys.has(KEY_S) && !activeKeys.has(KEY_W)) {
			player.direction = Direction.SOUTH;
			player.isMoving = true;
		}

		if(activeKeys.has(KEY_D) && !activeKeys.has(KEY_A)) {
			player.direction = Direction.EAST;
			player.isMoving = true;
		}
	}

}
