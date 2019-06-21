import {Sprite} from './sprite';
import {Renderer} from '../renderer';
import {BoundingBox} from '../boundingBox';

export abstract class Threat extends Sprite {

	public isAlive: boolean;
	public opacity: number;

	protected abstract texture: HTMLImageElement;

	public constructor({
		x = 0,
		y = 0,
		isAlive = true,
		opacity = 1
	}: Threat.Options = {}) {
		super({
			x,
			y,

			offsetX: -1,
			offsetY: -1.8,

			width: 2,
			height: 2,

			boundingBox: new BoundingBox()
		});

		this.isAlive = isAlive;
		this.opacity = opacity;
	}

	public render(renderer: Renderer): void {
		this.renderTexture(renderer, this.texture, {
			x: 0,
			y: 0,

			width: 32,
			height: 32
		});
	}
	
	public updateBoundingBox(): void {
		const box = this.boundingBox;

		box.x = this.x - 2;
		box.y = this.y - 0.9 - 2;

		box.width = 4;
		box.height = 4;
	}

}

export namespace Threat {

	export interface Options {
		x?: number;
		y?: number;
		opacity?: number;
		isAlive?: boolean;
	}

}