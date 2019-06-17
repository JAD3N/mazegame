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
})(function() {
	window.MazeGame = new Game();
});