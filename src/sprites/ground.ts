import {Sprite} from './sprite';
import {Renderer} from '../renderer';

let TEXTURE: HTMLImageElement;

export class Ground extends Sprite {

	public constructor(width: number = 1, height: number = 1) {
		super({
			x: 0,
			y: 0,
			
			offsetX: 0,
			offsetY: 0,
			
			width,
			height
		});
	}

	public render(renderer: Renderer): void {
		if(!TEXTURE) {
			TEXTURE = renderer.assets.getTexture('ground');
		}

		for(let x = 0; x < this.width; x++) {
			for(let y = 0; y < this.height; y++) {
				const frame = y > 0 ? 0 : 1 + (this.x + x) % 3;

				super.renderTexture(renderer, TEXTURE, {
					x: 16 * frame,
					y: 0,

					width: 16,
					height: 16
				}, this.x + x, this.y + y, 1, 1);
			}
		}
	}
	
}