export class BoundingBox {

	public x: number;
	public y: number;

	public width: number;
	public height: number;

	public constructor({
		x = 0,
		y = 0,

		width = 0,
		height = 0
	}: BoundingBox.Options = {}) {
		this.x = x;
		this.y = y;

		this.width = width;
		this.height = height;
	}

	public hits(box: BoundingBox): boolean {
		// check if any box corners intersect
		return this.hitsPoint(box.x, box.y)
			|| this.hitsPoint(box.x, box.y + box.height)
			|| this.hitsPoint(box.x + box.width, box.y)
			|| this.hitsPoint(box.x + box.width, box.y + box.height)

			// check if any our this boxes corners intersect
			|| box.hitsPoint(this.x, this.y)
			|| box.hitsPoint(this.x, this.y + this.height)
			|| box.hitsPoint(this.x + this.width, this.y)
			|| box.hitsPoint(this.x + this.width, this.y + this.height);
	}

	public hitsPoint(x: number, y: number): boolean {
		return x > this.x && x < this.x + this.width
			&& y > this.y && y < this.y + this.height; 
	}

	public contains(box: BoundingBox): boolean {
		return box.inside(this);
	}

	public inside(box: BoundingBox): boolean {
		return this.x >= box.x && this.x + this.width <= box.x + box.width
			&& this.y >= box.y && this.y + this.height <= box.y + box.height;
	}

}

export namespace BoundingBox {

	export interface Options {
		x?: number;
		y?: number;

		width?: number;
		height?: number;
	}

}
