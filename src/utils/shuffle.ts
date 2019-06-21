import * as _ from 'lodash';
import seedrandom from 'seedrandom';

export function shuffle<T>(arr: T[], random: seedrandom.prng | (() => number) = Math.random): T[] {
	const length = arr == null ? 0 : arr.length;

	if(!length) {
		return [];
	}

	let index = -1;

	const lastIndex = length - 1;
	const result = _.clone(arr);

	while(++index < length) {
		const rand = index + Math.floor(random() * (lastIndex - index + 1));
		const value = result[rand];

		result[rand] = result[index];
		result[index] = value;
	}

	return result;
}

export function sortShuffle<T>(arr: T[], random: seedrandom.prng | (() => number) = Math.random): T[] {
	let numUndefined = 0;
	let result = _.chain(arr).filter(function(val: T) {
		if(val === undefined) {
			numUndefined++;
			return false;
		}

		return true;
	}).sort().value();

	for(let i = numUndefined; i > 0; i--) {
		result.push(undefined);
	}

	return shuffle(result);
}
