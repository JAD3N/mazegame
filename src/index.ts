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
	const id: number = window.setInterval(function() {
		if(document.readyState === 'complete') {
			run();
		}
	}, 100);

	// add event listener for page load
	document.addEventListener('DOMContentLoaded', run);
})(async function() {
	// check if user meant to close game
	window.addEventListener('beforeunload', function(event: BeforeUnloadEvent) {
		return event.returnValue = 'Are you sure you wish to leave the game?';
	});

	const game = window.MazeGame = new Game();

	// wait for game assets to load
	await game.load();

	// check if level hash provided in url
	if(location.hash) {
		const seed = location.hash.slice(1);

		if(seed && seed.length) {
			game.loadLevel(seed);
		}

		return;
	}

	// show main menu if not started already
	game.showMainMenu();
});
