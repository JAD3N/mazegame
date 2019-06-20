import {Sprite} from './sprite';
import {Direction} from '../utils/direction';
import {Renderer} from '../renderer';
import {Room} from '../room';
import {Treasure} from './treasure';

let TEXTURE_FRONT: HTMLImageElement;
let TEXTURE_BACK: HTMLImageElement;
let TEXTURE_LEFT: HTMLImageElement;
let TEXTURE_RIGHT: HTMLImageElement;
let TEXTURE_IDLE: HTMLImageElement;

export class Player extends Sprite {

	public static readonly SPEED: number = 6.5;

	public direction: Direction;
	public isMoving: boolean;
	public room: Room;
	public gold: number;
	public lastTeleport: number;

	public constructor({
		x = 0,
		y = 0,

		direction = Direction.SOUTH,
		isMoving = false,
		room = null,
		gold = 0
	}: Player.Options = {}) {
		super({
			x,
			y,

			offsetX: -0.5,
			offsetY: -1,
			
			width: 1,
			height: 1,

			boundingBox: true
		});

		this.direction = direction;
		this.isMoving = isMoving;
		this.room = room;
		this.gold = gold;
		this.lastTeleport = performance.now();
	}

	public update(deltaTime: number) {
		if(this.isMoving) {
			switch(this.direction) {
				case Direction.NORTH:
					this.velocityX = 0;
					this.velocityY = -Player.SPEED;
					break;
				case Direction.SOUTH:
					this.velocityX = 0;
					this.velocityY = Player.SPEED;
					break;
				case Direction.EAST:
					this.velocityX = Player.SPEED;
					this.velocityY = 0;
					break;
				case Direction.WEST:
					this.velocityX = -Player.SPEED;
					this.velocityY = 0;
					break;
			}
		} else {
			this.velocityX = 0;
			this.velocityY = 0;
		}

		if(this.room) {
			const oldX = this.x;
			const oldY = this.y;

			super.update(deltaTime);

			if(!this.room.contains(this)) {
				this.x = oldX;
				this.y = oldY;

				this.updateBoundingBox();
			}
		} else {
			super.update(deltaTime);
		}

		if(this.room) {
			this.room.treasure.forEach((treasure: Treasure) => {
				if(treasure.stage === Treasure.Stage.CLOSED && this.boundingBox.hits(treasure.boundingBox)) {
					treasure.open();
					this.gold++;
				}
			});
		}
	}

	public render(renderer: Renderer): void {
		const assets = renderer.assets;

		if(!TEXTURE_FRONT) TEXTURE_FRONT = assets.getTexture('player-front');
		if(!TEXTURE_BACK) TEXTURE_BACK = assets.getTexture('player-back');
		if(!TEXTURE_LEFT) TEXTURE_LEFT = assets.getTexture('player-left');
		if(!TEXTURE_RIGHT) TEXTURE_RIGHT = assets.getTexture('player-right');
		if(!TEXTURE_IDLE) TEXTURE_IDLE = assets.getTexture('player-idle');

		const frame = renderer.frame % 4;
		const textureOptions = {
			x: 16 * frame, 
			y: 0,

			width: 16,
			height: 16
		};

		if(this.isMoving) {
			switch(this.direction) {
				case Direction.NORTH:
					this.renderTexture(renderer, TEXTURE_BACK, textureOptions);
					break;
				case Direction.EAST:
					this.renderTexture(renderer, TEXTURE_RIGHT, textureOptions);
					break;
				case Direction.SOUTH:
					this.renderTexture(renderer, TEXTURE_FRONT, textureOptions);
					break;
				case Direction.WEST:
					this.renderTexture(renderer, TEXTURE_LEFT, textureOptions);
					break;
			}
		} else {
			this.renderTexture(renderer, TEXTURE_IDLE, textureOptions);
		}
	}

	public updateBoundingBox(): void {
		const box = this.boundingBox;

		box.x = this.x + this.offsetX + 2 / 16;
		box.y = this.y + this.offsetY;

		box.width = 12 / 16;
		box.height = 1;
	}

}

export namespace Player {

	export interface Options {
		x?: number;
		y?: number;
		direction?: Direction;
		room?: Room;
		isMoving?: boolean;
		gold?: number;
	}

}