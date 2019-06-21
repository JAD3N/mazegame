import {Threat} from '../threat';
import {Renderer} from '../../renderer';
import ParasiteData from './data/parasite.json';

export class Parasite extends Threat {

	public static readonly SPAWN_CHANCE = ParasiteData.spawnChance;

	public alerts: Threat.Alert[] = ParasiteData.alerts;

	protected texture: HTMLImageElement;

	public render(renderer: Renderer): void {
		if(!this.texture) {
			this.texture = renderer.assets.getTexture('parasite');
		}

		super.render(renderer);
	}

}
