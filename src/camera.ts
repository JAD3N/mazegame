export type Ease = (start: number, end: number, progress: number) => number;

export class Camera {

	public x: number;
	public y: number;

	public startX: number;
	public startY: number;

	public targetX: number;
	public targetY: number;

	public panStart: number;
	public panTime: number;
	public panEase: Ease;

	public constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;

		this.targetX = null;
		this.targetY = null;

		this.panStart = null;
		this.panTime = null;
		this.panEase = null;
	}

	public panTo(x: number, y: number, time: number, ease: Ease = Camera.Ease.LINEAR): void {
		this.targetX = x;
		this.targetY = y;

		this.startX = this.x;
		this.startY = this.y;

		this.panStart = performance.now();
		this.panTime = time;
		this.panEase = ease;
	}

	public update(): void {
		if(!this.panStart || !this.panTime) {
			return;
		}

		let now = performance.now() - this.panStart;
		let progress = now / this.panTime;

		progress = Math.min(Math.max(progress, 0), 1);

		this.x = this.panEase(this.startX, this.targetX, progress);
		this.y = this.panEase(this.startY, this.targetY, progress);
	}

}

export namespace Camera {

	export const Ease = {
		LINEAR: function(start: number, end: number, progress: number): number {
			const delta: number = Math.abs(end - start);
			return start + (start > end ? delta * -progress : delta * progress);
		}
	};

}