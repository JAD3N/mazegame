import {Sprite} from './sprite';
import {Renderer} from '../renderer';
import {BoundingBox} from '../boundingBox';

let TEXTURE: HTMLImageElement;

export class Coin extends Sprite {

	public static readonly FADE_TIME = 250;
	public static readonly COLLECT_COOLDOWN = 1000;
	public static readonly VALUE = 5;

	public value: number;
	public stage: number;
	public spawnTime: number;
	public opacity: number;

	private fadeStart: number;

	public constructor({
		x = 0,
		y = 0,
		stage = Math.round(Math.random() * 2),
		spawnTime = performance.now(),
		value = Coin.VALUE
	}: Coin.Options = {}) {
		super({
			x,
			y,

			offsetX: -0.5,
			offsetY: -0.5,

			width: 1,
			height: 1,

			boundingBox: new BoundingBox()
		});

		this.stage = stage;
		this.spawnTime = spawnTime;
		this.opacity = 1;
		this.fadeStart = null;
		this.value = value;
	}

	public render(renderer: Renderer): void {
		if(this.opacity === 0) {
			return;
		}

		if(!TEXTURE) {
			TEXTURE = renderer.assets.getTexture('coin');
		}

		const ctx = renderer.ctx;
		ctx.save();

		if(this.fadeStart !== null) {
			const now = performance.now();
			const delta = (now - this.fadeStart);

			this.opacity = 1 - Math.min(Math.max(delta / Coin.FADE_TIME, 0), 1);
		}

		ctx.globalAlpha = this.opacity;

		this.renderTexture(renderer, TEXTURE, {
			x: 16 * this.stage,
			y: 0,

			width: 16,
			height: 16
		});

		ctx.restore();
	}
	
	public updateBoundingBox(): void {
		const box = this.boundingBox;

		box.x = this.x - 0.25;
		box.y = this.y - 0.25;

		box.width = 0.5;
		box.height = 0.5;
	}

	public collect(): void {
		if(this.canCollect) {
			this.fadeStart = performance.now();
		}
	}

	public get canCollect(): boolean {
		if(performance.now() - this.spawnTime < Coin.COLLECT_COOLDOWN) {
			return false;
		}

		return this.fadeStart === null;
	}

	public update(deltaTime: number): void {
		this.velocityX *= 1 - (0.8 * deltaTime);

		super.update(deltaTime);

		if(!this.canCollect && this.opacity === 0) {
			this.needsRemoval = true;
		}
	}

}

export namespace Coin {

	export interface Options {
		stage?: number,
		x?: number,
		y?: number,
		spawnTime?: number,
		value?: number
	}

}