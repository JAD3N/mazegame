import {Floor} from './sprites/room/floor';
import {Renderer} from './renderer';
import {Sprite} from './sprites/sprite';
import {Treasure} from './sprites/room/treasure';
import {Passage} from './sprites/room/passage';
import {Direction} from './utils/direction';
import {Player} from './sprites/player';
import {RoomMap} from './map';
import {Troll} from './sprites/threats/troll';
import {Parasite} from './sprites/threats/parasite';
import {Eye} from './sprites/threats/eye';
import {Threat} from './sprites/threat';
import {distance} from './utils/math';

export class Room {

	public static readonly MIN_SIZE = 5;
	public static readonly MAX_SIZE = 10;

	public isEnd: boolean;
	public isLocked: boolean;
	public map: RoomMap;

	public width: number;
	public height: number;

	public floor: Floor;
	public routes: Set<Room.Route>;
	public sprites: Set<Sprite>;

	public needsUpdate: boolean;
	private _center: Room.Center;

	public constructor({
		map,
		width,
		height,
		treasureChance = 0.7,
		routes = {},
		isEnd = false
	}: Room.Options) {
		this.width = width;
		this.height = height;
		this.isEnd = isEnd;
		this.map = map;

		this.floor = new Floor({width, height});
		this.routes = new Set<Room.Route>();
		this.sprites = new Set<Sprite>();

		const numTreasure = Math.min(Math.floor(width * height) / (5 * 5), 3);
		const random = map.prng;

		for(let i = 1, tries = 0; i <= numTreasure; i++) {
			if(random() <= treasureChance) {
				let x = random() * (width - 3) + 1;
				let y = random() * (height - 3) + 1;
				let skip = false;

				this.sprites.forEach((sprite: Sprite) => {
					if(sprite instanceof Treasure) {
						const treasure = sprite;

						if(distance(treasure.x, treasure.y, x, y) <= 3) {
							skip = true;
							tries++;

							if(tries > 4) {
								i--;
							}
						}
					}
				});

				if(!skip) {
					this.sprites.add(new Treasure({x, y, room: this}));
					tries = 0;
				}
			}
		}

		if(random() <= Troll.SPAWN_CHANCE){
			this.isLocked = true;
			this.sprites.add(new Troll({
				room: this,
				x: this.center.x,
				y: this.center.y + 0.9
			}));
		} else if(random() <= Parasite.SPAWN_CHANCE) {
			this.isLocked = true;
			this.sprites.add(new Parasite({
				room: this,
				x: this.center.x,
				y: this.center.y + 0.9
			}));
		} else if(random() <= Eye.SPAWN_CHANCE) {
			this.isLocked = true;
			this.sprites.add(new Eye({
				room: this,
				x: this.center.x,
				y: this.center.y + 0.9
			}));
		}

		if(routes.north) this.addRoute(Direction.NORTH, routes.north);
		if(routes.east) this.addRoute(Direction.EAST, routes.east);
		if(routes.south) this.addRoute(Direction.SOUTH, routes.south);
		if(routes.west) this.addRoute(Direction.WEST, routes.west);

		this.needsUpdate = true;
		this._center = null;
	}

	public addRoute(direction: Direction, room: Room): void {
		let alreadyExists = false;

		this.routes.forEach(function(route: Room.Route) {
			if(route.sprite.direction === direction) {
				alreadyExists = true;
			}
		});

		if(alreadyExists) {
			return;
		}

		this.routes.add({
			sprite: new Passage({
				direction: direction,
				room: this
			}),
			destination: room
		});
	}

	public hasRoute(direction: Direction): boolean {
		let exists = false;

		this.routes.forEach(function(route: Room.Route) {
			if(route.sprite.direction === direction) {
				exists = true;
			}
		});

		return exists;
	}

	public renderFloor(renderer: Renderer): void {
		this.floor.render(renderer);

		this.routes.forEach(function(route: Room.Route) {
			route.sprite.render(renderer);
		});
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
		if(!sprite.boundingBox) {
			return false;
		}

		const box = sprite.boundingBox;

		if(box.inside(this.floor.boundingBox)) {
			return true;
		}

		let inside = false;

		this.routes.forEach((route: Room.Route) => {
			if(box.inside(route.sprite.boundingBox)) {
				inside = true;
			}
		});

		return inside;
	}

	public update(player: Player): void {
		const now = performance.now();

		if(now - player.lastTeleport < 1000) {
			return;
		}

		this.routes.forEach((route: Room.Route) => {
			const passage = route.sprite;
			const box = passage.teleportBox;
			const room = route.destination;

			if(box.hits(player.boundingBox)) {
				if(this.isLocked) {
					if(!passage.isInside) {
						passage.isInside = true;

						const game = this.map.game;
						game.alert('You cannot leave until you have defeated the threat.', ['Close']);
					}

					return;
				}

				const oldRoom = player.room;
				player.room = room;
				player.lastTeleport = now;

				const dx = room.center.x - oldRoom.center.x;
				const dy = room.center.y - oldRoom.center.y;

				switch(route.sprite.direction) {
					case Direction.NORTH:
						player.x += dx;
						player.y = room.height + passage.height - 2;
						break;
					case Direction.SOUTH:
						player.x += dx;
						player.y = -passage.height + 2;
						break;
					case Direction.EAST:
						player.x = -passage.width + 2;
						player.y += dy;
						break;
					case Direction.WEST:
						player.x = room.width + passage.width - 2;
						player.y += dy;
						break;
				}
			} else {
				passage.isInside = false;
			}
		});
	}

	public removeThreats(): void {
		this.isLocked = false;
		this.sprites.forEach((sprite: Sprite) => {
			if(sprite instanceof Threat) {
				this.sprites.delete(sprite);
			}
		});
	}

}

export namespace Room {

	export interface Center {
		x: number;
		y: number;
	}

	export interface Route {
		sprite: Passage;
		destination: Room;
	}

}

export namespace Room {

	export interface Options {
		map: RoomMap;
		width: number;
		height: number;
		treasureChance?: number;
		routes?: {
			north?: Room,
			east?: Room,
			south?: Room,
			west?: Room
		};
		isEnd?: boolean;
	}

}
