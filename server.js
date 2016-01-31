var util = require("util"),
    io = require("socket.io"),
	Player = require("./Player").Player;
	Bullet = require("./Bullet").Bullet;
	
var socket,
    players,
	bullets;

var spawnTaken = false;
var triggerLose = false;
	
function init() {
    players = [];
	bullets = [];
	socket = io.listen(8000);
	
	socket.configure(function() {
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2);
	
	
	});
setEventHandlers();
};

var setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("update player", onUpdatePlayer);
	client.on("new bullet", onNewBullet);
	client.on("check lose", onCheckLose);
	client.on("check spawn", onCheckSpawn);
	//client.on("move bullet", onMoveBullet);
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);
	
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		util.log("Player not found: remove(server)"+this.id);
		return;
	};

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("reupdate player", {id: this.id});
};


function onNewPlayer(data) {
	var newPlayer = new Player(data.x, data.z);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), z: newPlayer.getZ(), playerMatrix: newPlayer.getMatrix()});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), z: existingPlayer.getZ(), playerMatrix: existingPlayer.getMatrix()});
		this.broadcast.emit("check spawn", {spawn: spawnTaken});
	};
	players.push(newPlayer);
};

function onUpdatePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		util.log("Player not found move(server): "+this.id);
		return;
	};
	movePlayer.setX(data.x);
	movePlayer.setZ(data.z);
	movePlayer.setMatrix(data.playerMatrix);
	this.broadcast.emit("update player", {id: movePlayer.id, x: movePlayer.getX(), z: movePlayer.getZ(), playerMatrix: movePlayer.getMatrix()});
};

function onCheckLose(data){
	triggerLose = true;
	this.broadcast.emit("check lose", {lose: triggerLose});
}

function onCheckSpawn(data){
	spawnTaken = data.spawn;
	util.log("spawn taken: " + spawnTaken);
}

function onNewBullet(data) {
	var newBullet = new Bullet(data.xBul, data.zBul);
	newBullet.id = this.id;
	this.broadcast.emit("new bullet", {idBul: newBullet.id, xBul: newBullet.getX(), zBul: newBullet.getZ(), bulRot: newBullet.getRotation()});
	
	if(bullets.length < 8){
		bullets.push(newBullet);
	}
};

/* function onMoveBullet(data) {
	var moveBullet = bulletById(this.id);

	//if (!moveBullet) {
		util.log("Bullet id: "+this.id);
		//return;
	//};
	moveBullet.setX(data.xBul);
	moveBullet.setZ(data.zBul);

	this.broadcast.emit("move bullet", {idBul: moveBullet.id, xBul: moveBullet.getX(), zBul: moveBullet.getZ()});
};
 */
function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};

function bulletById(idBul) {
    var i;
    for (i = 0; i < bullets.length; i++) {
        if (bullets[i].id == idBul)
            return bullets[i];
    };

    return false;
};

init();