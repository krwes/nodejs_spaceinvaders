var AudioHandler = function() {
	this.$body			= jQuery("body");
	this.context = new window.AudioContext();
	this.analyser = this.context.createAnalyser();
//	this.canvas = document.getElementById('geluid');
//	this.canvas3d = document.getElementById('geluid3d');
//	this.ctx = this.canvas.getContext("2d");
	this.analyser.minDecibels = -140;
	this.analyser.maxDecibels = 0;
	this.freqs = null;

	this.isListening = false;
	
//	this.plotter = new Plotter(this.canvas3d);
//	this.webgl = new WebGLEngine(this.canvas3d);
//	this.webgl.onready();
};

AudioHandler.prototype = {
	init: function() {
		var self = this;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: true, video: false}, function(stream) {
				self.startListening(stream);
			}, function(error) {

			});
		}
	},
	
	startListening: function(stream) {
		if (this.isListening === false) {
			this.isListening = true;
			this.source = this.context.createMediaStreamSource(stream);
			this.source.connect(this.analyser);
			this.analyser.connect(this.context.destination);
			window.requestAnimationFrame(this.analyse.bind(this));
		}
	},
	analyse: function() {
		//setup an empty array of specific size
		this.freqs = new Float32Array(this.analyser.frequencyBinCount);
		//fill the array met current frequency data
		this.analyser.getFloatFrequencyData(this.freqs);
		//test of een bepaalde frequentie een hoge db heeft:
		if (this.getFrequencyValue(125) > -50) {
			console.log('Laag geluid gedetecteerd');
			this.$body.trigger("fire");
		}
//		var space = Math.floor((this.analyser.frequencyBinCount / this.canvas.width) * 2);
//		this.ctx.clearRect(0,0,800,600);
//		this.ctx.fillStyle = "#ffffff";
//		this.ctx.fillRect(0,0,800,400);
//		this.ctx.fillStyle = "#000000";
//		this.ctx.beginPath();
		
//		this.webgl.drawScene(to3d);
//		this.plotter.render(this.freqs);
		window.requestAnimationFrame(this.analyse.bind(this));
	},
	getFrequencyValue: function(freq) {
		var nyquist = this.context.sampleRate/2;
		var index = Math.round(freq/nyquist * this.freqs.length);
		return this.freqs[index];
	}
};
