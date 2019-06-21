import {Threat} from '../threat';
import {Renderer} from '../../renderer';
import TrollData from './data/troll.json';

export class Troll extends Threat {

	public static readonly SPAWN_CHANCE = TrollData.spawnChance;

	public alerts: Threat.Alert[] = TrollData.alerts;

	protected texture: HTMLImageElement;

	public render(renderer: Renderer): void {
		if(!this.texture) {
			this.texture = renderer.assets.getTexture('troll');
		}

		super.render(renderer);
	}

}
