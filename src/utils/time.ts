export function humanTime(time: number): string{
	// truncate floating number to integer
	time |= time;

	// get individual time components
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor(time / 60) % 60;
	const seconds = time % 60;

	return `${hours > 0 ? hours + 'h ' : ''}${(hours > 0 || minutes > 0) ? minutes + 'm ' : ''}${seconds + 's'}`;
}
