import {Game} from './game';
import {Camera} from './camera';
import {Assets} from './assets';

export class Renderer {

	public readonly game: Game;
	public readonly canvas: HTMLCanvasElement;
	public readonly ctx: CanvasRenderingContext2D;
	
	public lastRender: number;

	public constructor(game: Game) {
		this.game = game;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

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
		const deltaTime = now - lastRender;

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
		const tileSize = (minSize / 20) | 0;

		const offsetX = Math.floor((width - minSize) / 2);
		const offsetY = Math.floor((height - minSize) / 2);

		ctx.fillStyle = '#000';
		ctx.translate(offsetX, offsetY);
		ctx.scale(tileSize, tileSize);
		ctx.translate(camera.x, camera.y);

		for(let i = 0; i < 20; i++) {
			ctx.fillRect(i, i, 1, 1);
		}

		const player = this.game.player;
		player.update(deltaTime / 1000);
		player.render(this);

		ctx.restore();
	}

	public get assets(): Assets {
		return this.game.assets;
	}

	public get frame(): number {
		return Math.floor(performance.now() / 150);
	}

}