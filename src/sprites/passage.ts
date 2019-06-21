import {Sprite} from './sprite';
import {Renderer} from '../renderer';
import {Direction} from '../utils/direction';
import {Room} from '../room';
import {BoundingBox} from '../boundingBox';

export class Passage extends Sprite {

	public static readonly TELEPORT_BOX_SIZE: number = 1;

	public room: Room;
	public direction: Direction;
	public teleportBox: BoundingBox;
	public isInside: boolean;

	private gradient: CanvasGradient;

	public constructor({room, direction}: Passage.Options) {
		const width = direction % 2 === 0 ? 2 : 3;
		const height = direction % 2 === 0 ? 3 : 2;
		
		let x = 0,
			y = 0,
			offsetX = 0,
			offsetY = 0,
			boundingBox = null,
			teleportBox = null;

		switch(direction) {
			case Direction.NORTH:
				x = room.floor.width / 2;

				offsetX = -1;
				offsetY = -3;

				boundingBox = new BoundingBox({
					x: x + offsetX,
					y: y + offsetY - Passage.TELEPORT_BOX_SIZE,

					width: width,
					height: height + room.height + Passage.TELEPORT_BOX_SIZE
				});

				teleportBox = new BoundingBox({
					x: boundingBox.x,
					y: boundingBox.y,
					
					width: boundingBox.width,
					height: Passage.TELEPORT_BOX_SIZE
				});
				break;
			case Direction.EAST:
				x = room.floor.width;
				y = room.floor.height / 2;

				offsetY = -1;

				boundingBox = new BoundingBox({
					x: x + offsetX - room.width,
					y: y + offsetY,

					width: width + room.width + Passage.TELEPORT_BOX_SIZE,
					height: height
				});

				teleportBox = new BoundingBox({
					x: x + width,
					y: boundingBox.y,

					width: Passage.TELEPORT_BOX_SIZE,
					height: boundingBox.height
				});
				break;
			case Direction.SOUTH:
				x = room.floor.width / 2;
				y = room.floor.height;

				offsetX = -1;

				boundingBox = new BoundingBox({
					x: x + offsetX,
					y: y + offsetY - room.height,

					width: width,
					height: height + room.height + Passage.TELEPORT_BOX_SIZE
				});

				teleportBox = new BoundingBox({
					x: boundingBox.x,
					y: y + height,

					width: boundingBox.width,
					height: Passage.TELEPORT_BOX_SIZE
				});
				break;
			case Direction.WEST:
				y = room.floor.height / 2;

				offsetX = -3;
				offsetY = -1;

				boundingBox = new BoundingBox({
					x: x + offsetX - Passage.TELEPORT_BOX_SIZE,
					y: y + offsetY,

					width: width + room.width + Passage.TELEPORT_BOX_SIZE,
					height: height
				});

				teleportBox = new BoundingBox({
					x: x - width - Passage.TELEPORT_BOX_SIZE,
					y: boundingBox.y,

					width: Passage.TELEPORT_BOX_SIZE,
					height: boundingBox.height
				});
				break;
		}

		super({
			x,
			y,
			
			offsetX,
			offsetY,
			
			width,
			height,

			boundingBox
		});

		this.direction = direction;
		this.teleportBox = teleportBox;
		this.room = room;
	}

	public render(renderer: Renderer): void {
		const ctx = renderer.ctx;
		
		if(!this.gradient) {
			let gradient;

			if(this.direction % 2 === 0) {
				gradient = ctx.createLinearGradient(
					this.x + this.offsetX,
					this.y + this.offsetY,
					this.x + this.offsetX,
					this.y + this.offsetY + this.height
				);
			} else {
				gradient = ctx.createLinearGradient(
					this.x + this.offsetX,
					this.y + this.offsetY,
					this.x + this.offsetX + this.width,
					this.y + this.offsetY
				);
			}

			switch(this.direction) {
				case Direction.NORTH:
					gradient.addColorStop(0, 'rgba(58, 36, 47, 0)');
					gradient.addColorStop(1, 'rgba(58, 36, 47, 1)');
					break;
				case Direction.SOUTH:
					gradient.addColorStop(0, 'rgba(58, 36, 47, 1)');
					gradient.addColorStop(1, 'rgba(58, 36, 47, 0)');
					break;
				case Direction.EAST:
					gradient.addColorStop(0, 'rgba(58, 36, 47, 1)');
					gradient.addColorStop(1, 'rgba(58, 36, 47, 0)');
					break;
				case Direction.WEST:
					gradient.addColorStop(0, 'rgba(58, 36, 47, 0)');
					gradient.addColorStop(1, 'rgba(58, 36, 47, 1)');
					break;
			}

			this.gradient = gradient;
		}

		ctx.fillStyle = this.gradient;
		ctx.fillRect(
			this.x + this.offsetX,
			this.y + this.offsetY,
			this.width,
			this.height
		);
	}
	
}

export namespace Passage {

	export interface Options {
		room: Room;
		direction: Direction;
	}

}