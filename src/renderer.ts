import {Game} from './game';
import {Camera} from './camera';
import {Assets} from './assets';
import {Treasure} from './sprites/treasure';
import {Sprite} from './sprites/sprite';
import {Ground} from './sprites/ground';

export class Renderer {

	public static readonly VIEWPORT_TILES: number = 15;

	public readonly game: Game;
	public readonly canvas: HTMLCanvasElement;
	public readonly ctx: CanvasRenderingContext2D;
	
	public lastRender: number;

	public constructor(game: Game) {
		this.game = game;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d', {
			alpha: true
		});

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

		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, width, height);
		ctx.save();
	
		const minSize = Math.min(width, height);
		const tileSize = minSize / Renderer.VIEWPORT_TILES | 0;

		const offsetX = width / 2 | 0;
		const offsetY = height / 2 | 0;

		ctx.fillStyle = '#000000';
		ctx.translate(offsetX, offsetY);
		ctx.scale(tileSize, tileSize);
		ctx.translate(-camera.x, -camera.y);

		// render floor
		const room = this.game.currentRoom;
		const player = this.game.player;

		// update player
		player.update(deltaTime);

		const sprites: Sprite[] = [player, room.floor];
		
		room.treasure.forEach(function(treasure: Treasure) {
			sprites.push(treasure);
		});

		sprites.sort(function(a: Sprite, b: Sprite) {
			if(a instanceof Ground) {
				return -1;
			}

			if(a.y < b.y) {
				return -1;
			} else if(a.y > b.y) {
				return 1;
			} else {
				return 0;
			}
		}).forEach((sprite: Sprite) => sprite.render(this));

		ctx.restore();
	}

	public get assets(): Assets {
		return this.game.assets;
	}

	public get frame(): number {
		return Math.floor(performance.now() / 150);
	}

}