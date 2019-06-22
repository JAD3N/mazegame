import * as _ from 'lodash';
import {Sprite} from './sprite';
import {Direction} from '../utils/direction';
import {Renderer} from '../renderer';
import {Room} from '../room';
import {Treasure} from './room/treasure';
import {Coin} from './room/coin';
import {Threat} from './threat';
import {Game} from '../game';
import {shuffle} from '../utils/shuffle';

let TEXTURE_FRONT: HTMLImageElement;
let TEXTURE_BACK: HTMLImageElement;
let TEXTURE_LEFT: HTMLImageElement;
let TEXTURE_RIGHT: HTMLImageElement;
let TEXTURE_IDLE: HTMLImageElement;

export class Player extends Sprite {

	public static readonly SPEED: number = 6.5;

	public game: Game;
	public direction: Direction;
	public isMoving: boolean;
	public isPaused: boolean;
	public room: Room;
	public gold: number;
	public lastTeleport: number;

	public constructor({
		game,
		x = 0,
		y = 0,

		direction = Direction.SOUTH,
		isMoving = false,
		isPaused = false,

		room = null,
		gold = 0
	}: Player.Options) {
		super({
			x,
			y,

			offsetX: -0.5,
			offsetY: -1,

			width: 1,
			height: 1,

			boundingBox: true
		});

		this.game = game;
		this.direction = direction;
		this.isMoving = isMoving;
		this.isPaused = isPaused;
		this.room = room;
		this.gold = gold;
		this.lastTeleport = performance.now();
	}

	public update(deltaTime: number) {
		if(!this.isPaused) {
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
		}

		const game = this.game;
		const random = game.map.prng;

		if(this.room && !this.isPaused) {
			this.room.sprites.forEach((sprite: Sprite) => {
				if(sprite instanceof Treasure) {
					const treasure = sprite;

					if(treasure.stage === Treasure.Stage.CLOSED && this.boundingBox.hits(treasure.boundingBox)) {
						treasure.open();
						this.gold += Treasure.VALUE;
					}
				} else if(sprite instanceof Coin) {
					const coin = sprite;

					if(coin.canCollect && this.boundingBox.hits(coin.boundingBox)) {
						this.gold += coin.value;
						coin.collect();
					}
				} else if(sprite instanceof Threat) {
					const threat = sprite;

					if(threat.isAlive && this.boundingBox.hits(threat.boundingBox)) {
						const alertIndex = Math.floor(random() * threat.alerts.length);
						const alert = threat.alerts[alertIndex];
						const actions = shuffle(alert.actions, random);

						game.alert(
							alert.message,
							_.chain(actions)
								.map('text')
								.value()
						).then((result: string) => {
							this.isPaused = false;

							for(let action of actions) {
								if(action.text === result) {
									if(action.isCorrect) {
										game.alert('You were successful!', ['Close']);
										threat.kill();
									} else {
										const toll = Threat.TOLL;

										if(this.gold >= toll) {
											// apply toll to player
											this.gold -= toll;

											// show message
											game.alert(`You were incorrect and lost ${toll} gold!`, ['Close']);
										} else {
											game.showDeathMenu();
										}
									}
								}
							}
						});

						this.isPaused = true;
					}
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

		if(this.isMoving && !this.isPaused) {
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

	public dropCoin(): void {
		if(this.room && this.gold >= Coin.VALUE) {
			let velocityX = 0;
			let velocityY = 0;

			switch(this.direction) {
				case Direction.NORTH:
					velocityY--;
					break;
				case Direction.SOUTH:
					velocityY++;
					break;
				case Direction.EAST:
					velocityX++;
					break;
				case Direction.WEST:
					velocityX--;
					break;
			}

			const coin = new Coin({
				x: this.x,
				y: this.y
			});

			this.gold -= coin.value;
			this.room.sprites.add(coin);
		}
	}

}

export namespace Player {

	export interface Options {
		game: Game;
		x?: number;
		y?: number;
		direction?: Direction;
		room?: Room;
		isMoving?: boolean;
		isPaused?: boolean;
		gold?: number;
	}

}
