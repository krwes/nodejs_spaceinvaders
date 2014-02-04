var KeyboardHandler = function(socket) {
	this.keys = {
		spacebar: 32,
		left	: 37,
		right	: 39
	};
	this.socket		= socket;
	this.commands	= null;
	this.pressed	= [];
	this.keyloop	= null;
	this.startKeyloop();
};
KeyboardHandler.prototype = {
	setCommands: function(commands) {
		this.commands	= commands;
	},
	
	startKeyloop: function() {
		var self = this;
		this.keyloop	= setInterval(function() {
			for (var p in self.pressed) {
				self.onKeyPressed(self.pressed[p]);
			}
		}, 20);
	},
	
	onKeyPressed: function(keyCode) {
		if (this.socket && this.commands) {
			switch(keyCode) {
				case this.keys.spacebar:	return this.socket.send(JSON.stringify({cmd	: this.commands.fire}));
				case this.keys.left:		return this.socket.send(JSON.stringify({cmd	: this.commands.blasterLeft}));
				case this.keys.right:		return this.socket.send(JSON.stringify({cmd	: this.commands.blasterRight}));
			}
		}
	},

	onKeyDown: function(ev) {
		var handle = false;
		for (var k in this.keys) {
			if (this.keys[k] === ev.keyCode) {
				handle = true;
				break;
			}
		}
		if (handle) {
			ev.preventDefault();
			if (this.pressed.indexOf(ev.keyCode) === -1) {
				this.pressed.push(ev.keyCode);
			}
		}
	},
	
	onKeyUp: function(ev) {
		var i = this.pressed.indexOf(ev.keyCode);
		delete this.pressed[i];
	}
};
