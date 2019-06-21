import {Game} from './game';
import {Camera} from './camera';
import {Assets} from './assets';
import {Sprite} from './sprites/sprite';
import {Floor} from './sprites/floor';
import {RoomMap} from './map';
import { Direction } from './utils/direction';

export class Renderer {

	public static readonly VIEWPORT_TILES: number = 15;

	public readonly game: Game;
	public readonly canvas: HTMLCanvasElement;
	public readonly ctx: CanvasRenderingContext2D;
	
	public lastRender: number;

	public constructor(game: Game) {
		this.game = game;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d', {alpha: true});

		if(this.ctx === null) {
			throw new Error('Failed to create rendering context!');
		}
	}

	public resize(width: number, height: number): void {
		// ensure positive integers
		width = Math.abs(width | 0) || 1;
		height = Math.abs(height | 0) || 1;

		// adjust canvas width if different
		if(this.canvas.width !== width) {
			this.canvas.width = width;
		}

		// adjust canvas height if different
		if(this.canvas.height !== height) {
			this.canvas.height = height;
		}
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public render(camera: Camera): void {
		// calculate frame times
		const now = performance.now();
		const lastRender = this.lastRender || now;
		const deltaTime = (now - lastRender) / 1000;

		this.lastRender = now;

		// get required variables
		const ctx = this.ctx;
		const {
			width,
			height
		} = this.canvas;

		this.clear();

		ctx.imageSmoothingEnabled = false;
		ctx.save();
	
		const minSize = Math.min(width, height);
		const tileSize = minSize / Renderer.VIEWPORT_TILES | 0;

		const offsetX = width / 2 | 0;
		const offsetY = height / 2 | 0;

		ctx.fillStyle = '#000000';
		ctx.globalAlpha = 1;

		ctx.translate(offsetX, offsetY);
		ctx.scale(tileSize, tileSize);
		ctx.translate(-camera.x, -camera.y);

		// render floor
		const room = this.game.currentRoom;
		const player = this.game.player;
		const sprites: Sprite[] = [player];
		
		room.renderFloor(this);
		room.sprites.forEach(function(sprite: Sprite) {
			sprites.push(sprite);
		});

		sprites.sort(function(a: Sprite, b: Sprite) {
			if(a instanceof Floor) {
				return -1;
			}

			if(a.y < b.y) {
				return -1;
			} else if(a.y > b.y) {
				return 1;
			} else {
				return 0;
			}
		}).forEach((sprite: Sprite) => {
			sprite.update(deltaTime);

			if(sprite.needsRemoval) {
				room.sprites.delete(sprite);
				return;
			}

			sprite.render(this);
			
			if(Game.DEBUG && Game.SHOW_HITBOXES && sprite.boundingBox) {
				const box = sprite.boundingBox;

				ctx.fillStyle = undefined;
				ctx.strokeStyle = '#ff0000';
				ctx.lineWidth = 1 / tileSize;
				ctx.setLineDash([5 / tileSize]);

				ctx.strokeRect(box.x, box.y, box.width, box.height);
			}
		});

		ctx.restore();

		const mapSize = 15;
		const mapOffsetX = 50;
		const mapOffsetY = 100;
		const map = this.game.map;
		
		for(let x = 0; x < RoomMap.WIDTH; x++) {
			for(let y = 0; y < RoomMap.HEIGHT; y++) {
				const room = map.getRoom(x, y);
				const inRoom = this.game.currentRoom === room;

				if(inRoom) {
					ctx.fillStyle = '#ff0000';
				} else if(room.isEnd) {
					ctx.fillStyle = '#00ff00';
				} else {
					ctx.fillStyle = '#ffffff';
				}

				const tileX = x * mapSize;
				const tileY = y * mapSize;

				ctx.globalAlpha = 0.5;
				ctx.fillRect(
					tileX + mapOffsetX,
					tileY + mapOffsetY,
					mapSize,
					mapSize
				);
				
				if(!room.hasRoute(Direction.NORTH)) {
					ctx.fillRect(
						tileX + mapOffsetX,
						tileY + mapOffsetY,
						mapSize,
						2
					);
				}

				if(!room.hasRoute(Direction.WEST)) {
					ctx.fillRect(
						tileX + mapOffsetX,
						tileY + mapOffsetY,
						2,
						mapSize
					);
				}
			}
		}
	}

	public get assets(): Assets {
		return this.game.assets;
	}

	public get frame(): number {
		return Math.floor(performance.now() / 150);
	}

}