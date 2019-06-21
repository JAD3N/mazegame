import {Game} from './game';

declare global {
	interface Window {
		MazeGame: Game;
	}
}

(function(callback: Function) {
	// check if page is already loaded
	if(document.readyState === 'complete') {
		callback();
		return;
	}

	function run() {
		// prevent future checks
		clearInterval(id);

		// execute callback function
		callback();
	}

	// manually check
	const id: number = setInterval(function() {
		if(document.readyState === 'complete') {
			run();
		}
	});

	// add event listener for page load
	document.addEventListener('DOMContentLoaded', run);
})(async function() {
	const game = window.MazeGame = new Game();

	await game.load();

	if(location.hash) {
		const seed = location.hash.slice(1);

		if(seed && seed.length) {
			game.loadLevel(seed);
		}

		return;
	}

	game.showMainMenu();
});
