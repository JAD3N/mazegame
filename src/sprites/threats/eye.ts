import {Threat} from '../threat';
import {Renderer} from '../../renderer';
import EyeData from './data/eye.json';

export class Eye extends Threat {

	public static readonly SPAWN_CHANCE = EyeData.spawnChance;

	public alerts: Threat.Alert[] = EyeData.alerts;

	protected texture: HTMLImageElement;

	public render(renderer: Renderer): void {
		if(!this.texture) {
			this.texture = renderer.assets.getTexture('eye');
		}

		super.render(renderer);
	}

}
