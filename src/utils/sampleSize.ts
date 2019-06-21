import * as _ from 'lodash';

export function sampleSize<T>(arr: T[], n: number = 1, random: seedrandom.prng | (() => number) = Math.random): T[] {
	const length = arr == null ? 0 : arr.length;

	if(!length || n < 1) {
		return [];
	}

	n = n > length ? length : n;

	let index = -1;

	const lastIndex = length - 1;
	const result = _.clone(arr);

	while(++index < n) {
		const rand = index + Math.floor(random() * (lastIndex - index + 1));
		const value = result[index];

		result[rand] = result[index];
		result[index] = value;
	}

	return _.slice(result, 0, n);
}