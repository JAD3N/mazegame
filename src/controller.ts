import {Player} from './sprites/player';
import {Direction} from './utils/direction';

const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

export class Controller {

	public player: Player;
	public activeKeys: Set<number>;

	public constructor(player: Player) {
		this.player = player;
		this.activeKeys = new Set<number>();

		window.addEventListener('keydown', this.onKeyDown.bind(this));
		window.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	private onKeyDown(event: KeyboardEvent): void {
		const activeKeys = this.activeKeys;
		const keyCode = event.keyCode;

		if(keyCode === KEY_W && !activeKeys.has(KEY_W)) activeKeys.add(KEY_W);
		if(keyCode === KEY_A && !activeKeys.has(KEY_A)) activeKeys.add(KEY_A);
		if(keyCode === KEY_S && !activeKeys.has(KEY_S)) activeKeys.add(KEY_S);
		if(keyCode === KEY_D && !activeKeys.has(KEY_D)) activeKeys.add(KEY_D);
	}

	private onKeyUp(event: KeyboardEvent): void {
		const activeKeys = this.activeKeys;
		const keyCode = event.keyCode;

		if(keyCode === KEY_W && activeKeys.has(KEY_W)) activeKeys.delete(KEY_W);
		if(keyCode === KEY_A && activeKeys.has(KEY_A)) activeKeys.delete(KEY_A);
		if(keyCode === KEY_S && activeKeys.has(KEY_S)) activeKeys.delete(KEY_S);
		if(keyCode === KEY_D && activeKeys.has(KEY_D)) activeKeys.delete(KEY_D);
	}

	public update(): void {
		const activeKeys = this.activeKeys;
		const player = this.player;
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