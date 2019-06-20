declare module 'generate-maze' {
	export default function(width: number, height?: number, open?: boolean): {
		x: number,
		y: number,
		top: boolean,
		left: boolean,
		bottom: boolean,
		right: boolean,
		set: number
	}[][];
}