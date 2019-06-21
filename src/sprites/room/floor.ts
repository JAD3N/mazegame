import {Sprite} from '../sprite';
import {Renderer} from '../../renderer';
import {BoundingBox} from '../../boundingBox';

export class Floor extends Sprite {

	public constructor({width, height}: Floor.Options) {
		super({
			width,
			height,

			boundingBox: new BoundingBox({width, height})
		});
	}

	public render(renderer: Renderer): void {
		const ctx = renderer.ctx;
		ctx.fillStyle = '#3a242f';
		ctx.fillRect(
			this.x + this.offsetX,
			this.y + this.offsetY,
			this.width,
			this.height
		);
	}

}

export namespace Floor {

	export interface Options {
		width: number;
		height: number;
	}

}
