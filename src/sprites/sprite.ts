import {Renderer} from '../renderer';
import {BoundingBox} from '../boundingBox';

export abstract class Sprite {

	public x: number;
	public y: number;

	public offsetX: number;
	public offsetY: number;

	public width: number;
	public height: number;

	public velocityX: number;
	public velocityY: number;

	public boundingBox: BoundingBox;

	public needsRemoval: boolean;

	public constructor({
		x = 0,
		y = 0,
		offsetX = 0,
		offsetY = 0,
		width,
		height,
		boundingBox = null
	}: Sprite.Options) {
		this.x = x;
		this.y = y;

		this.offsetX = offsetX || 0;
		this.offsetY = offsetY || 0;

		this.width = width;
		this.height = height;

		this.velocityX = 0;
		this.velocityY = 0;

		this.needsRemoval = false;

		if(boundingBox instanceof BoundingBox) {
			this.boundingBox = boundingBox;
		} else if(boundingBox === true) {
			this.boundingBox = new BoundingBox();
		}

		if(this.boundingBox) {
			this.updateBoundingBox();
		}
	}

	public renderTexture(renderer: Renderer, texture: CanvasImageSource, region?: Sprite.TextureRegion, x?: number, y?: number, width?: number, height?: number): void {
		const ctx = renderer.ctx;

		if(x === undefined) x = this.x + this.offsetX;
		if(y === undefined) y = this.y + this.offsetY;

		if(width === undefined) width = this.width;
		if(height === undefined) height = this.height;

		ctx.drawImage(
			// what to render
			texture,
			
			// where in the texture to render
			region.x, region.y,
			region.width, region.height,

			// where to render on screen
			x, y,
			width, height
		);
	}

	public update(deltaTime: number): void {
		const dx = this.velocityX;
		const dy = this.velocityY;

		this.x += dx * deltaTime;
		this.y += dy * deltaTime;

		if(this.boundingBox) {
			this.updateBoundingBox();
		}
	}

	public distanceTo(x: number, y: number): number {
		return Math.sqrt(
			((this.x - x) ** 2) +
			((this.y - y) ** 2)
		);
	}

	public updateBoundingBox(): void {
		// empty to allow override
	}

	public abstract render(renderer: Renderer): void;

}

export namespace Sprite {

	export interface Options {
		x?: number;
		y?: number;
		offsetX?: number;
		offsetY?: number;
		width: number;
		height: number;
		boundingBox?: BoundingBox | boolean;
	}

	export interface TextureRegion {
		x: number;
		y: number;
		width: number;
		height: number;
	}

}