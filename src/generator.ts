/**
 * This code is originally from https://github.com/bestguy/generate-maze/blob/master/src/generate-maze.js
 * 
 * I have made modified to allow for seeded random so maps can be saved and re-produced easily. The code now also has some typings to make it easier to understand.
 * 
 */

import * as _ from 'lodash';
import seedrandom from 'seedrandom';
import {sortShuffle, shuffle} from './utils/shuffle';
import {sampleSize} from './utils/sampleSize';

interface Box {
	x?: number;
	y?: number;

	top?: boolean;
	left?: boolean;
	bottom: boolean;
	right?: boolean;

	set?: number;
}

function mergeSetWith(row: Box[], oldSet: number, newSet: number): void {
	const setToMerge = _.filter(row, {set: oldSet});

	setToMerge.forEach((box) => {
		box.set = newSet;
	});
}

function populateMissingSets(row: Box[], random: seedrandom.prng | (() => number) = Math.random): void {
	const noSets = <Box[]> _.reject(row, (box) => box.set);
	const setsInUse = sortShuffle(_.chain(row).map('set').uniq().value(), random);

	const allSets = _.range(1, row.length + 1);
	const availableSets = shuffle(_.chain(allSets).difference(setsInUse).value(), random);

	noSets.forEach((box: Box, i: number) => box.set = availableSets[i]);
}

function mergeRandomSetsIn(row: Box[], probability: number, random: seedrandom.prng | (() => number) = Math.random): void {
	const allBoxesButLast = _.initial(row);

	allBoxesButLast.forEach((current: Box, x: number) => {
		const next = row[x + 1];
		const differentSets = current.set !== next.set;
		const shouldMerge = random() <= probability;

		if(differentSets && shouldMerge) {
			mergeSetWith(row, next.set, current.set);
			current.right = false;
			next.left = false;
		}
	});
}

function addSetExits(row: Box[], nextRow: Box[], random: seedrandom.prng | (() => number) = Math.random): void {	
	const setsInRow = _.chain(row)
		.groupBy('set')
		.values()
		.value();

	setsInRow.forEach((set: Box[]) => {
		const exits = sampleSize(set, Math.ceil(random() * set.length), random);
		exits.forEach((exit: Box) => {
			if(exit) {
				const below = nextRow[exit.x];
				exit.bottom = false;
				below.top = false;
				below.set = exit.set;
			}
		});
	});
}

export function generateMaze(width: number = 8, height: number = width, closed: boolean = true, random: seedrandom.prng | (() => number) = Math.random): Box[][] {
	const maze: Box[][] = [];
	const range = _.range(width);

	for(let y = 0; y < height; y++) {
		const row = range.map((x: number) => {
			return {
				x,
				y,

				top: closed || y > 0,
				left: closed || x > 0,
				bottom: closed || y < (height - 1),
				right: closed || x < (width - 1)
			};
		});

		maze.push(row);
	}

	_.initial(maze).forEach((row: Box[], y: number) => {
		populateMissingSets(row, random);
		mergeRandomSetsIn(row, 0.5, random);
		addSetExits(row, maze[y + 1], random);
	});

	const lastRow = _.last(maze);

	populateMissingSets(lastRow, random);
	mergeRandomSetsIn(lastRow, 1, random);

	return maze;
}
