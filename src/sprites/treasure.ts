import {Sprite} from './sprite';
import {Renderer} from '../renderer';
import { BoundingBox } from '../boundingBox';

let TEXTURE: HTMLImageElement;

export class Treasure extends Sprite {

	public static readonly FADE_TIME = 500;

	public stage: Treasure.Stage;
	public opacity: number = 0.5;

	private fadeStart: number;

	public constructor({
		x = 0,
		y = 0,
		opacity = 1,
		stage = Treasure.Stage.CLOSED
	}: Treasure.Options = {}) {
		super({
			x,
			y,
			
			offsetX: 0,
			offsetY: -1,
			
			width: 1,
			height: 1,

			boundingBox: true
		});

		this.opacity = opacity;
		this.stage = stage;
		this.fadeStart = null;
	}

	public render(renderer: Renderer): void {
		if(this.opacity === 0) {
			return;
		}
		
		if(!TEXTURE) {
			TEXTURE = renderer.assets.getTexture('treasure');
		}

		const ctx = renderer.ctx;
		ctx.save();

		if(this.stage === Treasure.Stage.HIDDEN && this.opacity > 0) {
			const now = performance.now();
			const delta = (now - this.fadeStart);

			this.opacity = 1 - Math.min(Math.max(delta / Treasure.FADE_TIME, 0), 1);

			ctx.globalAlpha = this.opacity;
		}

		let frame = this.stage;
		if(frame === Treasure.Stage.HIDDEN) {
			frame = Treasure.Stage.EMPTY;
		}

		super.renderTexture(renderer, TEXTURE, {
			x: frame * 16,
			y: 0,

			width: 16,
			height: 16
		});

		ctx.restore();
	}


	public open(): void {
		if(this.stage === Treasure.Stage.CLOSED) {
			this.stage = Treasure.Stage.OPEN;

			setTimeout(() => this.stage = Treasure.Stage.EMPTY, 300);
			setTimeout(() => {
				this.stage = Treasure.Stage.HIDDEN
				this.fadeStart = performance.now();
			}, 1000);
		}
	}

	public updateBoundingBox(): void {
		const box = this.boundingBox;

		box.x = this.x + this.offsetX;
		box.y = this.y + this.offsetY + 0.5;

		box.width = 1;
		box.height = 0.5;
	}
	
}

export namespace Treasure {

	export enum Stage {
		CLOSED,
		EMPTY,
		OPEN,
		HIDDEN
	}

	export interface Options {
		x?: number;
		y?: number;
		opacity?: number;
		stage?: Treasure.Stage;
	}

}