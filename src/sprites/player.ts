import {Sprite} from './sprite';
import {Direction} from '../utils/direction';
import {Renderer} from '../renderer';

let TEXTURE_FRONT: HTMLImageElement;
let TEXTURE_BACK: HTMLImageElement;
let TEXTURE_LEFT: HTMLImageElement;
let TEXTURE_RIGHT: HTMLImageElement;
let TEXTURE_IDLE: HTMLImageElement;

let PLAYER_SPEED = 6.5;

export class Player extends Sprite {

	public direction: Direction;
	public isMoving: boolean;

	public constructor() {
		super({
			x: 0, y: 0,
			offsetX: -1, offsetY: -2,
			width: 2, height: 2
		});

		this.direction = Direction.SOUTH;
		this.isMoving = true;
	}

	public update(deltaTime: number) {
		if(this.isMoving) {
			switch(this.direction) {
				case Direction.NORTH:
					this.velocityX = 0;
					this.velocityY = -PLAYER_SPEED;
					break;
				case Direction.SOUTH:
					this.velocityX = 0;
					this.velocityY = PLAYER_SPEED;
					break;
				case Direction.EAST:
					this.velocityX = PLAYER_SPEED;
					this.velocityY = 0;
					break;
				case Direction.WEST:
					this.velocityX = -PLAYER_SPEED;
					this.velocityY = 0;
					break;
			}
		} else {
			this.velocityX = 0;
			this.velocityY = 0;
		}

		super.update(deltaTime);
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

}