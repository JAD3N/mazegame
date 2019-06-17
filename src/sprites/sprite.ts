import {Renderer} from '../renderer';

export abstract class Sprite {

	public x: number;
	public y: number;

	public offsetX: number;
	public offsetY: number;

	public width: number;
	public height: number;

	public velocityX: number;
	public velocityY: number;

	public constructor({
		x = 0,
		y = 0,
		offsetX = 0,
		offsetY = 0,
		width,
		height
	}: Sprite.Options) {
		this.x = x;
		this.y = y;

		this.offsetX = offsetX || 0;
		this.offsetY = offsetY || 0;

		this.width = width;
		this.height = height;

		this.velocityX = 0;
		this.velocityY = 0;
	}

	public hits(x: number | Sprite, y?: number): boolean {
		if(x instanceof Sprite) {
			const sprite: Sprite = x;

			return this.hits(sprite.x, sprite.y)
				|| this.hits(sprite.x, sprite.y + sprite.height)
				|| this.hits(sprite.x + sprite.width, sprite.y)
				|| this.hits(sprite.x + sprite.width, sprite.y + sprite.height);
		} else {
			if(x < this.x + this.offsetX || x > this.x + this.width + this.offsetX) {
				return false;
			} else if(y < this.y + this.offsetY || y > this.y + this.height + this.offsetY) {
				return false;
			} else {
				return true;
			}
		}
	}
	
	public isInside(x: number, y: number, width: number, height: number): boolean {
		if(this.x + this.offsetX < x || this.x + this.width + this.offsetX > x + width) {
			return false;
		} else if(this.y + this.offsetY < y || this.y + this.height + this.offsetY > y + height) {
			return false;
		} else {
			return true;
		}
	}

	public renderTexture(renderer: Renderer, texture: CanvasImageSource, region?: Sprite.TextureRegion): void {
		const ctx = renderer.ctx;

		ctx.drawImage(
			// what to render
			texture,
			
			// where in the texture to render
			region.x, region.y,
			region.width, region.height,

			// where to render on screen
			this.x + this.offsetX,
			this.y + this.offsetY,
			this.width, this.height
		);
	}

	public update(deltaTime: number): void {
		const dx = this.velocityX;
		const dy = this.velocityY;

		const oldX = this.x;
		const oldY = this.y;

		this.x += dx * deltaTime;
		this.y += dy * deltaTime;

		/*if(!this.isInside(0, 0, 10, 10)) {
			this.x = oldX;
			this.y = oldY;
		}*/
	}

	public abstract render(renderer: Renderer): void;

}

export namespace Sprite {

	export interface Options {
		x: number;
		y: number;
		offsetX: number;
		offsetY: number;
		width: number;
		height: number;
	}

	export interface TextureRegion {
		x: number;
		y: number;
		width: number;
		height: number;
	}

}