import {Room} from './room';
import {generateMaze} from './generator';
import {Direction} from './utils/direction';
import seedrandom from 'seedrandom';

export class RoomMap {

	public static readonly WIDTH: number = 15;
	public static readonly HEIGHT: number = 15;

	public readonly seed: string;

	public prng: seedrandom.prng;
	public rooms: Room[];
	public starterRoom: Room;

	public constructor(seed: string) {
		this.rooms = [];
		this.seed = seed;
		this.prng = seedrandom(this.seed);
	}

	public generate(): void {
		this.rooms = [];

		const mazeWidth = RoomMap.WIDTH;
		const mazeHeight = RoomMap.HEIGHT;
		const random = this.prng;

		console.log(random());

		for(let x = 0; x < mazeWidth; x++) {
			for(let y = 0; y < mazeHeight; y++) {
				const room = new Room({
					map: this,
					width: random() * (Room.MAX_SIZE - Room.MIN_SIZE) + Room.MIN_SIZE,
					height: random() * (Room.MAX_SIZE - Room.MIN_SIZE) + Room.MIN_SIZE
				});

				this.setRoom(x, y, room);
			}
		}

		console.log(random());

		const maze = generateMaze(mazeWidth, mazeHeight, true, random);
		const scope = this;

		console.log(random());

		function addRoute(x: number, y: number, direction: Direction): void {
			let oppositeDirection = null;
			let offsetX = 0;
			let offsetY = 0;

			switch(direction) {
				case Direction.NORTH:
					oppositeDirection = Direction.SOUTH;
					offsetY--;
					break;
				case Direction.EAST:
					oppositeDirection = Direction.WEST;
					offsetX++;
					break;
				case Direction.SOUTH:
					oppositeDirection = Direction.NORTH;
					offsetY++;
					break;
				case Direction.WEST:
					oppositeDirection = Direction.EAST;
					offsetX--;
					break;
			}

			const room = scope.getRoom(x, y);
			const routeRoom = scope.getRoom(x + offsetX, y + offsetY);

			if(!routeRoom) {
				return;
			}

			room.addRoute(direction, routeRoom);
			routeRoom.addRoute(oppositeDirection, room);
		}

		for(let x = 0; x < mazeWidth; x++) {
			for(let y = 0; y < mazeHeight; y++) {
				const cell = maze[y][x];

				if(!cell.top) addRoute(x, y, Direction.NORTH);
				if(!cell.right) addRoute(x, y, Direction.EAST);
				if(!cell.bottom) addRoute(x, y, Direction.SOUTH);
				if(!cell.left) addRoute(x, y, Direction.WEST);
			}
		}

		const starterRoom = Math.ceil(random() * this.rooms.length);
		const endRoom = Math.ceil(random() * this.rooms.length);

		this.starterRoom = this.rooms[starterRoom];
		this.rooms[endRoom].isEnd = true;
	}

	public getRoom(x: number, y: number): Room {
		return this.rooms[x + y * RoomMap.HEIGHT];
	}

	public setRoom(x: number, y: number, room: Room): void {
		this.rooms[x + y * RoomMap.HEIGHT] = room;
	}

}