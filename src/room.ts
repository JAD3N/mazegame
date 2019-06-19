import {Ground} from './sprites/ground';
import {Renderer} from './renderer';
import {Sprite} from './sprites/sprite';
import {Treasure} from './sprites/treasure';

export class Room {

	public width: number;
	public height: number;
	public floor: Ground;
	public treasure: Set<Treasure>;
	// public passages: Passage[];
	public needsUpdate: boolean;

	private _center: Room.Center;

	public constructor(width: number, height: number, treasureChance: number = 0.7) {
		this.width = width;
		this.height = height;

		this.floor = new Ground(width, height);
		this.treasure = new Set<Treasure>();

		if(Math.random() <= treasureChance) {
			const treasure = new Treasure();

			// update treasure position
			treasure.x = Math.random() * (width - 3) + 1;
			treasure.y = Math.random() * (height - 3) + 1;

			this.treasure.add(treasure);
		}
		
		this.needsUpdate = true;
		this._center = null;
	}

	public get center(): Room.Center {
		if(!this._center || this.needsUpdate) {
			this._center = {
				x: this.width / 2,
				y: this.height / 2
			}
		}

		return this._center;
	}

	public contains(sprite: Sprite): boolean {
		if(sprite.isInside(0, 0, this.width, this.height)) {
			return true;
		}

		// add passages later

		return false;
	}

}

export namespace Room {

	export interface Center {
		x: number;
		y: number;
	}

}