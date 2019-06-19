import {Sprite} from './sprite';
import {Renderer} from '../renderer';

let TEXTURE: HTMLImageElement;

export class Treasure extends Sprite {

	public static readonly FADE_TIME = 500;

	public stage: Treasure.Stage;
	public alpha: number = 0.5;

	private fadeStart: number;

	public constructor() {
		super({
			x: 0,
			y: 0,
			
			offsetX: 0,
			offsetY: -1,
			
			width: 1,
			height: 1
		});

		this.stage = Treasure.Stage.CLOSED;
		this.alpha = 1;
		this.fadeStart = null;
	}

	public render(renderer: Renderer): void {
		if(this.alpha === 0) {
			return;
		}
		
		if(!TEXTURE) {
			TEXTURE = renderer.assets.getTexture('treasure');
		}

		const ctx = renderer.ctx;
		ctx.save();

		if(this.stage === Treasure.Stage.HIDDEN && this.alpha > 0) {
			const now = performance.now();
			const delta = (now - this.fadeStart);

			this.alpha = 1 - Math.min(Math.max(delta / Treasure.FADE_TIME, 0), 1);

			ctx.globalAlpha = this.alpha;
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
			setTimeout(() => this.stage = Treasure.Stage.OPEN, 150);
			setTimeout(() => this.stage = Treasure.Stage.EMPTY, 300);
			setTimeout(() => {
				this.stage = Treasure.Stage.HIDDEN
				this.fadeStart = performance.now();
			}, 1000);
		}
	}
	
}

export namespace Treasure {

	export enum Stage {
		CLOSED,
		EMPTY,
		OPEN,
		HIDDEN
	}

}