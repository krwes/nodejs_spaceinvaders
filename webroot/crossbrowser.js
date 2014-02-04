/* Setup cross-browser compatibility */
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

window.requestAnimationFrame = (function(){
	return window.requestAnimationFrame  ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

window.AudioContext = window.AudioContext ||
	window.webkitAudioContext;
