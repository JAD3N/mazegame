import {Sprite} from './sprite';
import {Renderer} from '../renderer';
import {BoundingBox} from '../boundingBox';
import { Room } from '../room';
import { Coin } from './room/coin';

export abstract class Threat extends Sprite {

	public static readonly FADE_TIME = 1000;
	public static readonly TOLL = 20;

	public room: Room;
	public isAlive: boolean;
	public opacity: number;

	public abstract alerts: Threat.Alert[];

	protected abstract texture: HTMLImageElement;

	private fadeStart: number;

	public constructor({
		room,
		x = 0,
		y = 0,
		isAlive = true,
		opacity = 1
	}: Threat.Options) {
		super({
			x,
			y,

			offsetX: -1,
			offsetY: -1.8,

			width: 2,
			height: 2,

			boundingBox: new BoundingBox()
		});

		this.room = room;
		this.isAlive = isAlive;
		this.opacity = opacity;
	}

	public render(renderer: Renderer): void {
		const ctx = renderer.ctx;
		ctx.save();

		if(this.fadeStart !== null) {
			const now = performance.now();
			const delta = (now - this.fadeStart);

			this.opacity = 1 - Math.min(Math.max(delta / Threat.FADE_TIME, 0), 1);
		}

		ctx.globalAlpha = this.opacity;

		this.renderTexture(renderer, this.texture, {
			x: 0,
			y: 0,

			width: 32,
			height: 32
		});

		ctx.restore();
	}

	public updateBoundingBox(): void {
		const box = this.boundingBox;

		box.x = this.x - 2;
		box.y = this.y - 0.9 - 2;

		box.width = 4;
		box.height = 4;
	}

	public kill(): void {
		if(this.isAlive) {
			this.fadeStart = performance.now();
			this.isAlive = false;
			this.room.isLocked = false;

			this.room.sprites.add(new Coin({
				value: 10,
				x: this.x,
				y: this.y - 0.5,
				stage: 2
			}));
		}
	}

}

export namespace Threat {

	export interface Options {
		room: Room;
		x?: number;
		y?: number;
		opacity?: number;
		isAlive?: boolean;
	}

	export interface Alert {
		message: string;
		actions: {
			text: string,
			isCorrect: boolean
		}[];
	}

}
