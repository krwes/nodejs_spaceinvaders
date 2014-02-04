
var CamHandler = function() {
	this.video			= document.getElementById('webcam');
	this.photo			= document.getElementById('photo');
	this.$body			= jQuery("body");
	this.feed			= document.getElementById('feed');
	this.feedContext	= this.feed.getContext('2d');
	this.display		= document.getElementById('display');
	this.displayContext = this.display.getContext('2d');
	this.dl,this.ave_l,this.ave_r,this.sum_l,this.sum_r,this.prev_l_s,this.prev_r_s,this.prev_l_ave,this.prev_r_ave,this.data_l,this.data_r;
	this.prev_l = [];
	this.prev_r = [];
	this.threshold = 3; //0 - 255
	this.winwidth = 3;
	this.rowlen = 320 * 4;
	this.halfway = 320 * 2;
	this.summer = function(a,b) {return a+b;};
	this.first = true;
	this.datas;

};
CamHandler.prototype = {
	init: function() {
		var self = this;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: false, video: true}, function(stream) {
				var videoSource;

				if (window.URL) {
					videoSource = window.URL.createObjectURL(stream);
				} else {
					videoSource  = stream;
				}
				self.video.autoplay = true; 
				self.video.src = videoSource;
				self.display.width = self.feed.width = 320;
				self.display.height = self.feed.height = 240;
				self.photo.width = self.display.width;
				self.photo.height = self.display.height;

				self.streamFeed();
			}, 
			function(error) {
				console.log(error);
			});
		} 
		else {
		  //geen video input
		}		
	},

	streamFeed: function() {
		requestAnimationFrame(this.streamFeed.bind(this));
		this.feedContext.drawImage(this.video, 0, 0, this.display.width, this.display.height);
        var imageData = this.feedContext.getImageData(0, 0, this.display.width, this.display.height);
		
		imageData.data = this.effects.checkForMovement.call(this, imageData.data);
        this.displayContext.putImageData(imageData, 0, 0);
	},
	
	effects: {
		checkForMovement: function(data) {
			this.sum_l = this.sum_r = 0;
			for(var i = 0, dl = data.length; i < dl; i+=4) {
				if ((i % this.rowlen) < this.halfway) {
					this.sum_l+=(data[i]+data[i+1]+data[i+2]); 
				}
				else {
					this.sum_r+=(data[i]+data[i+1]+data[i+2]); 
				}
			}
			this.ave_l = Math.floor(this.sum_l / (dl/8));
			this.ave_r = Math.floor(this.sum_r / (dl/8));
			for(var i = 0, dl = data.length; i < dl; i+=4) {
				if ((i % this.rowlen) < this.halfway) {
					data[i] = this.ave_l;
					data[i+1] = this.ave_l;
					data[i+2] = this.ave_l;
				}
				else {
					data[i] = this.ave_r;
					data[i+1] = this.ave_r;
					data[i+2] = this.ave_r;
				}
			}
			if (this.prev_l.length >= this.winwidth) {
				this.prev_l_s = this.prev_r_s = 0;
				for(var p = 0, l = this.prev_l.length; p < l; p++) {
					this.prev_l_s += this.prev_l[p];
					this.prev_r_s += this.prev_r[p];
				}

				this.prev_l_ave = Math.floor(this.prev_l_s / l);
				this.prev_r_ave = Math.floor(this.prev_r_s / l);
				if (Math.abs(this.ave_l - this.prev_l_ave) > this.threshold) {
					this.$body.trigger("go-right");
	//					console.log(
	//						'movement RECHTS:',
	//						ave_l,
	//						prev_l_ave,
	//						Math.abs(ave_l - prev_l_ave),
	//						threshold,
	//						ave_r,
	//						prev_r_ave,
	//						Math.abs(ave_r - prev_r_ave)
	//					);
				}
				if (Math.abs(this.ave_r - this.prev_r_ave) > this.threshold) {
					this.$body.trigger("go-left");
	//					console.log(
	//						'movement LINKS:',
	//						ave_l,
	//						prev_l_ave,
	//						Math.abs(ave_l - prev_l_ave),
	//						threshold,
	//						ave_r,
	//						prev_r_ave,
	//						Math.abs(ave_r - prev_r_ave)
	//					);
				}
			}
			this.prev_l.push(this.ave_l);
			this.prev_r.push(this.ave_r);
			if (this.prev_l.length > this.winwidth) {
				this.prev_l.shift();
				this.prev_r.shift();
			}
			return data;
		},

		inverse: function(data) {
			for (var i = 0, l = data.length; i < l; i += 4) {
				// do something
				data[i] = 255 - data[i]; // r
				data[i + 1] = 255 - data[i + 1]; // g
				data[i + 2] = 255 - data[i + 2]; // b
			}
			return data;
		},

		greyscale: function(data) {
			var ave = 0;
			for (var i = 0, l = data.length; i < l; i += 4) {
				ave			= Math.floor(data[i]+data[i+1]+data[i+2] / 3);
				data[i]		= ave;
				data[i+1]	= ave;
				data[i+2]	= ave;
			}
			return data;
		},

		linkszwart: function(data) {
			if (this.first) {
				this.first = false;
				console.log(data.length, data.length / 4, this.rowlen, this.halfway);
			}
			for(var i = 0, dl = data.length; i < dl; i+=4) {
				if ((i % this.rowlen) < this.halfway) {
					data[i] = 0;
					data[i+1] = 0;
					data[i+2] = 0;
				}
			}
			return data;
		}
	}
};


