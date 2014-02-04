var Commands = {
	registerYourself : 999,
	registerArena	: 1,
	setObjects		: 9,
	blasterLeft		: 10,
	blasterRight	: 11,
	fire			: 12,
	message			: 20,
	setBlasterName	: 21,
	updateLevel		: 22,
	listRooms		: 30,
	joinRoom		: 31,
	leaveRoom		: 32,
	availableRooms	: 33
};
var Invader = function(param) {
	this.id			= null;
	this.c			= null;
	this.x			= null;
	this.y			= 0;
	this.w			= 26;
	this.h			= 8;
	this.m			= 1;		//mode: 1: normaal, 2special
	for (var i in param) {
		this[i] = param[i];
	}
};
var Blaster = function(param) {
	this.i			= null;		//id
	this.s			= 0;		//score
	this.n			= null;		//name
	this.c			= "#FFFFFF";//color
	this.x			= 385;		//positie x
	this.w			= 60;		//width
	this.h			= 20;		//height
	this.m			= 1;		//mode
	for (var i in param) {
		this[i] = param[i];
	}
};
var Bullet = function(x,i,c,dx) {
	this.c			= c;
	this.b			= i;		//id_blaster
	this.x			= x;
	this.y			= 580;
	this.dx			= dx;
};
Blaster.prototype.fire = function(game) {
	game.bullets.push(new Bullet(
		this.x + Math.round(this.w / 2) - 2,
		this.i,
		this.c,
		0
	));
	if (this.m === 2) {
		game.bullets.push(new Bullet(
			this.x + Math.round(this.w / 2) - 2,
			this.i,
			this.c,
			0.5
		));
		game.bullets.push(new Bullet(
			this.x + Math.round(this.w / 2) - 2,
			this.i,
			this.c,
			-0.5
		));
	}
};
//pendulum
var Swing = function(delta, init, step) {
	this.dir	= 0;
	this.delta	= delta;
	this.cur	= init || 0;
	this.step	= step || 1;
	this.next = function() {
		if (this.dir === 0) { //rechts
			this.cur += this.step;
			if (this.cur > this.delta) {
				this.dir = 1;
				this.cur -= 2*this.step;
			}
		}
		else {
			this.cur -= this.step;
			if (this.cur < (-1*this.delta)) {
				this.dir = 0;
				this.cur += 2*this.step;
			}
		}
		return this.cur;
	};
};

var SpaceInvaders = function() {
	this.room			= null;
	this.status			= 0; //0 = stop, 1 = on
	this.loop			= null;
	this.invaders		= [];
	this.bullets		= [];
	this.blasters		= {};
	this.level			= 1;
	this.firing			= [];
	this.invaderswing	= new Swing(5);
	this.invaderwidth	= new Swing(4);
	this.numinvaders	= 15;
};
SpaceInvaders.prototype = {
	setRoom: function(room) {
		this.room = room;
	},
	addBlaster: function(blaster) {
		this.blasters[blaster.i] = blaster;
	},
	updateBlaster: function(id, name) {
		if (this.blasters[id]) {
			this.blasters[id].n = name;
		}
	},
	removeBlaster: function(id) {
		if (this.blasters[id]) {
			delete this.blasters[id];
		}
	},
	gameloop: function() {
		if (this.invaders.length === 0) {
			this.nextLevel();
			return;
		}
		var cury = this.invaders[0].y;
		if (cury > 580) {
			for (var i in this.invaders) {
				var checkx = this.invaders[i].x;
				var checkx2 = checkx + this.invaders[i].w;
				for (var b in this.blasters) {
					if (
						this.blasters[b] &&
						checkx < this.blasters[b].x + this.blasters[b].w &&
						checkx2 > this.blasters[b].x
					) {
						this.removeBlaster(b);
					}
				}
			}
		}
		if (
			Object.keys(this.blasters).length === 0
		) {
			this.stop();
			return;
		}
		if (
			this.invaders.length === 0
		) {
			this.nextLevel();
			return;
		}
		//verplaats de invaders naar beneden en horizontaal
		var ix = this.invaderswing.next();
		var iw = this.invaderwidth.next();
		for (var i in this.invaders) {
			this.invaders[i].w += iw;
			this.invaders[i].x += ix;
			this.invaders[i].y += this.level;
		}
		cury = this.invaders[0].y;
		if (cury > 600) {
			this.invaders = [];
			this.init();
			this.nextLevel();
		}
		for (var b in this.bullets) {
			this.bullets[b].y -= 20;
			this.bullets[b].x += this.bullets[b].dx;
			if (this.bullets[b].y < 0) {
				this.bullets.splice(b,1);
			}
			if (
				this.bullets[b] &&	
				this.bullets[b].y <= cury
			) {
				for (var i in this.invaders) {
					if (
						this.bullets[b].x >= this.invaders[i].x &&
						this.bullets[b].x <= this.invaders[i].x + this.invaders[i].w
					) {
						this.blasters[this.bullets[b].b].s += this.level;
						if (
							this.invaders[i].m === 2 &&
							this.blasters[this.bullets[b].b].m !== 2
						) {
							this.blasters[this.bullets[b].b].m = 2;
							setTimeout(function(game,id) {
								if (game.blasters[id]) {
									game.blasters[id].m = 1;
								}
							}, 5000, this, this.bullets[b].b);
						}
						this.invaders.splice(i,1);
						this.bullets.splice(b,1);
						break;
					}
				}
			}
		}
		this.room.broadcast({
			cmd		: Commands.setObjects,
			invaders: this.invaders,
			blasters: this.blasters,
			bullets	: this.bullets
		});
	},
	init: function() {
		if (this.invaders.length === 0) {
			var special = Math.floor(Math.random() * this.numinvaders);
			var xo		= 10 + Math.floor(Math.random() * 10);
			for (var i=0; i<this.numinvaders; i++) {
				var invader = new Invader({
					id		: i,
					c		: '#' + ('111111' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6),
					x		: xo + (i * 50),
					m		: i === special ? 2 : 1
				});
				this.invaders.push(invader);
			}
		}
	},
	nextLevel: function() {
		this.level++;
		this.bullets = [];
		wss.broadcast({
			cmd: Commands.updateLevel,
			level: this.level
		});
		this.invaders = [];
		this.init();
	},
	start: function() {
		if (this.status === 0) {
			this.status = 1;
			this.init();
			this.level = 1;
			var self = this;
			this.loop = setInterval(function() {
				self.gameloop();
			}, 100); //10 / sec
		}
	},
	stop: function() {
		if (this.status === 1) {
			this.status = 0;
			clearInterval(this.loop);
			for (var i in this.invaders) {
				this.invaders[i].y = 0;
			}
		}
	}
}

var Room = function(param) {
	this.id				= null;
	this.name			= 'Game room';
	this.game			= null;
	this.max_players	= 5;
	this.active_players	= 0;
	for (var i in param) {
		this[i] = param[i];
	}
	if (this.game) {
		this.game.setRoom(this);
	}
};
Room.prototype = {
	broadcast: function(data) {
		var client;
		for (var i in wss.clients) {
			client = wss.clients[i];
			if (
				client.readyState === 1 &&
				client.room_id === this.id
			) {
				client.send(JSON.stringify(data));
			}
		}
	},
	hasSlots: function() {
		return this.active_players < this.max_players;
	},
	removeBlaster: function(blaster_id) {
		this.game.removeBlaster(blaster_id);
		this.active_players--;
		this.active_players = Math.max(0, this.active_players);
		var client;
		for (var i in wss.clients) {
			client = wss.clients[i];
			if (
				client.readyState === 1 &&
				client.gamer_id === blaster_id
			) {
				client.room_id = null;
			}
		}
	},
	startGame: function(blaster) {
		this.active_players++;
		this.game.init();
		this.game.addBlaster(blaster);
		this.game.start();
	}
};

//available rooms
var House = function() {
	this.rooms	= [];
};
House.prototype = {
	createRoom: function(param) {
		param.id = this.rooms.length;
		this.rooms.push(new Room(param));
	},
	findRoomById: function(id) {
		return (typeof this.rooms[id] === "undefined" ? null : this.rooms[id]);
	},
	listRooms: function() {
		var ret = [];
		for (var i in this.rooms) {
			ret.push({
				id				: this.rooms[i].id,
				name			: this.rooms[i].name,
				max_players		: this.rooms[i].max_players,	
				active_players	: this.rooms[i].active_players
			});
		}
		return ret;
	}
};


/**
 * Setup our house
 * @type House
 */
var house = new House();
house.createRoom({name: 'Space Invaders Room 1', game: new SpaceInvaders(), max_players: 5});
house.createRoom({name: 'Space Invaders Room 2', game: new SpaceInvaders(), max_players: 2});
house.createRoom({name: 'Space Invaders Room 3', game: new SpaceInvaders(), max_players: 1});



var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 3000});
wss.broadcast = function(data) {
	for (var i in wss.clients) {
		if (wss.clients[i].readyState === 1) {
			wss.clients[i].send(data);
		}
	}
};
wss.on('connection', function(socket) {
	socket.send(JSON.stringify({
		cmd		: Commands.registerYourself,
		commands: Commands
	}));
    socket.on('message', function(message, flags) {
		var room_joined = null;
		if (typeof socket.room_id !== "undefined" && socket.room_id !== null) {
			room_joined = house.findRoomById(socket.room_id);
		}
		var data = JSON.parse(message);
		if (data.cmd) {
			if (data.cmd === Commands.listRooms) {
				wss.broadcast(JSON.stringify({
					cmd		: Commands.availableRooms,
					rooms	: house.listRooms()
				}));
			}
			else if (data.cmd === Commands.joinRoom) {
				//remove maybe from room where currently active
				if (room_joined && socket.gamer_id) {
					room_joined.removeBlaster(socket.gamer_id);
				}
				room_joined = house.findRoomById(data.room_id);
				if (room_joined && room_joined.hasSlots()) {
					var blaster = new Blaster({
						i	: data.gamer_id,
						n	: data.gamer_name,
						c	: data.gamer_color
					});
					socket.room_id	= data.room_id;
					socket.gamer_id = data.gamer_id;
					room_joined.startGame(blaster);
					wss.broadcast(JSON.stringify({
						cmd		: Commands.availableRooms,
						rooms	: house.listRooms()
					}));
				}
				else {
					//send geen beschikbare plaatsen
					console.log("no room or room full");
				}
			}
			else if (data.cmd === Commands.leaveRoom) {
				if (room_joined && socket.gamer_id) {
					room_joined.removeBlaster(socket.gamer_id);
					wss.broadcast(JSON.stringify({
						cmd		: Commands.availableRooms,
						rooms	: house.listRooms()
					}));
				}
			}
			else if (data.cmd === Commands.blasterLeft) {
				if (room_joined && socket.gamer_id) {
					if (room_joined.game.blasters[socket.gamer_id]) {
						var blaster = room_joined.game.blasters[socket.gamer_id];
						room_joined.game.blasters[socket.gamer_id].x = Math.max(0,blaster.x - 5);
					}
				}
			}
			else if (data.cmd === Commands.blasterRight) {
				if (room_joined && socket.gamer_id) {
					if (room_joined.game.blasters[socket.gamer_id]) {
						var blaster = room_joined.game.blasters[socket.gamer_id];
						room_joined.game.blasters[socket.gamer_id].x = Math.min(800 - blaster.w, blaster.x + 5);
					}
				}
			}
			else if (data.cmd === Commands.fire) {
				if (room_joined && socket.gamer_id) {
					var fi = room_joined.game.firing.indexOf(socket.gamer_id);
					if (fi === -1) {
						room_joined.game.firing.push(socket.gamer_id);
						setTimeout(function(id) {
							room_joined.game.firing.splice(room_joined.game.firing.indexOf(id),1);
						}, 300, socket.gamer_id );
						if (room_joined.game.blasters[socket.gamer_id]) {
							room_joined.game.blasters[socket.gamer_id].fire(room_joined.game);
						}
					}
				}
			}
			else if (data.cmd === Commands.setBlasterName) {
				if (room_joined && socket.gamer_id) {
					room_joined.game.updateBlaster(socket.gamer_id, data.name);
				}
			}
			else if (data.cmd === Commands.message) {
				wss.broadcast({
					cmd: Commands.addMessage,
					msg: data.msg
				});
			}
		}
    });
	socket.on('close', function() {
		if (socket.room_id && socket.gamer_id) {
			var room = house.findRoomById(socket.room_id);
			if (room) {
				room.removeBlaster(socket.gamer_id);
				wss.broadcast(JSON.stringify({
					cmd		: Commands.availableRooms,
					rooms	: house.listRooms()
				}));
			}
		}
	});
});


