var SpaceInvadersArena = function(param) {
	this.id			= new Date().getTime().toString();
	this.canvas		= null;
	this.ctx		= null;
	this.$ul_room	= null;
	this.invaders	= [];
	this.bullets	= [];
	this.blasters	= {};
	this.level		= 1;
	for (var i in param) {
		this[i] = param[i];
	}
};
SpaceInvadersArena.prototype.redraw = function() {
	//clear everything
	this.ctx.clearRect(0,0,800,600);
	this.ctx.fillStyle = "#000000";
	this.ctx.fillRect(0,0,800,600);
	//redraw invaders
	for (var i in this.invaders) {
		var o = this.invaders[i];
		this.ctx.fillStyle = o.c;
		this.ctx.fillRect(o.x,o.y,o.w,o.h);
		if (o.m === 2) {
			this.ctx.beginPath();
			this.ctx.moveTo(o.x,o.y+4);
			this.ctx.lineTo(o.x+o.w,o.y+4);
			this.ctx.stroke();
		}
	}
	//redraw blasters
	for (var i in this.blasters) {
		var o = this.blasters[i];
		this.ctx.fillStyle = o.c;
		this.ctx.fillRect(o.x,580,o.w,o.h);
		this.ctx.fillRect(o.x+o.w/2-2,576,4,4);
		this.ctx.font = 'normal 8pt Arial';
		this.ctx.fillStyle = "#000000";
		this.ctx.fillText(o.n,o.x+10,596);
		this.ctx.fillText(o.s.toString(),o.x+10,590);
	}
	//redraw bullets
	for (var i in this.bullets) {
		var o = this.bullets[i];
		this.ctx.fillStyle = o.c;
		this.ctx.fillRect(o.x,o.y,4,8);
	}

	this.ctx.font = 'italic 20pt Arial';
	this.ctx.fillStyle = "#00FF00";
	this.ctx.fillText("Level "+this.level, 360, 24);
};
SpaceInvadersArena.prototype.setupCanvas = function() {
	this.ctx = this.canvas.getContext("2d");
	this.redraw();
};
SpaceInvadersArena.prototype.setLevel = function(level) {
	this.level = level;
}
SpaceInvadersArena.prototype.setInvaders = function(invaders) {
	this.invaders = invaders;
};
SpaceInvadersArena.prototype.setBullets = function(bullets) {
	this.bullets = bullets;
};
SpaceInvadersArena.prototype.updateRooms = function(rooms) {
	var room;
	for (var r in rooms) {
		room = rooms[r];
		this.$ul_room.append($('<li><a href="#" data-id="'+room.id+'" class="room-select">'+room.name+' ('+(room.max_players - room.active_players)+' plaatsen vrij)</a></li>'));
	}
};
SpaceInvadersArena.prototype.updateInvaders = function(newy) {
	for (var i in this.invaders) {
		this.invaders[i].y = newy;
	}
	this.redraw();
};
SpaceInvadersArena.prototype.setBlasters = function(blasters) {
	this.blasters = blasters;
};
