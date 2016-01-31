// server stuff
var localPlayer,
	   remotePlayers,
	   socket;
	   
	   socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	   
//three js variables-----------------------------------------------------------------------
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xcccccc, 0.0002 );
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1,  1500 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

var lightGlobal = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.8);
scene.add( lightGlobal );

var light = new THREE.DirectionalLight(0xf6e86d, 1);
light.position.set(1, 3, 2);
scene.add(light);

var lightPoint = new THREE.PointLight( 0xff0000, 1, 100, 1 );
lightPoint.position.set( 5, 20, 5 );
scene.add( lightPoint );

camera.position.z = 20;
camera.position.y = 3;

var width = window.innerWidth;
var height = window.innerHeight;

var gravity = 0.5;
//objects----------------------------------------------------------------------------------

var geometry = new THREE.BoxGeometry( 3, 3, 3 );
var material = new THREE.MeshLambertMaterial({ color: "#" + Math.random().toString(16).slice(2, 8)} );
var materialRed = new THREE.MeshLambertMaterial( { color: 0xff3300 } );
var localPlayer = new Player( geometry, materialRed , 5, 6, 7);
localPlayer.position.x = 20;
localPlayer.position.y = 2;
localPlayer.position.z = 20;
localPlayer.receiveShadow = true;
localPlayer.castShadow = true;
localPlayer.setLives(3);
//scene.add( localPlayer );

var sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);

var sphere = new THREE.Mesh(sphereGeo, material); // Create a mesh based on the specified geometry (player) and material (blue skin).

var bullets = [];
var remoteBullets = [];
var triggerlose = false;
var spawnTaken = false;
var remoteSpawn = false;
remotePlayers = [];
var remotePlayerRot;
var remoteHealth;
var iterator = 0;
var collidableMeshList = [];
var collidableEnviroment = [];

//Skybox initialisation
THREE.ImageUtils.crossOrigin = '';
var texture = THREE.ImageUtils.loadTexture("http://i.imgur.com/DO5hZgG.jpg");
var skyGeo = new THREE.SphereGeometry(1000, 25, 25); 

var skyMaterial = new THREE.MeshPhongMaterial({ 
        map: texture,
});
var sky = new THREE.Mesh(skyGeo, skyMaterial);
    sky.material.side = THREE.BackSide;
    scene.add(sky);

var spawnPoints = [];
var debrisArray = [];


var spawnPoints = [];

//create the arena
	var map = 	"XXXXXXXXXXXXXXXXXXXX \n" +
						"X_S_X___________X__X \n" +
						"X___X_____X____XX__X \n" +
						"XXX_____XXX________X \n" +
						"X_____X______X__X__X \n" +
						"X_____X______XXXX__X \n" +
						"X__XXXX______X_____X \n" +
						"X__X__X______X_____X \n" +
						"X________XXX_____XXX \n" +
						"X_XX_____X_____X___X \n" +
						"X_X____________X_S_X \n" +
						"XXXXXXXXXXXXXXXXXXXX";
	map = map.split("\n");
	var horizontal_unit = 25,
	vertical_unit = 25,
	ZSIZE = map.length * vertical_unit,
	XSIZE = map[0].length * horizontal_unit;
	 
	 //iterate through the string array
	for (var i = 0, rows = map.length; i < rows; i++) {
		for (var j = 0, cols = map[i].length; j < cols; j++) {
			addPanel(map[i].charAt(j), i, j);
		}
	}

	//adds the appropriate panel to the scene based on the string
function addPanel(type, row, col) {
	 var z = (row+1) * vertical_unit - ZSIZE * 0.5,
	 x = (col+1) * horizontal_unit - XSIZE * 0.5;
	 switch(type) {
	 case ' ': 
		break;
	 case '_':
		var geo = new THREE.CubeGeometry(horizontal_unit,
		1, horizontal_unit);
		var material = new THREE.MeshLambertMaterial({
			color: 0x999999
		});
		 
		var mesh = new THREE.Mesh(geo, material);
		mesh.position.set(x, -0.5, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
		//collidableEnviroment.push(mesh);
		break;
	 case 'S':
	 var geo = new THREE.CubeGeometry(horizontal_unit,
		1, vertical_unit);
		var material = new THREE.MeshLambertMaterial({
			color: 0x000ff0
		});
		 
		var mesh = new THREE.Mesh(geo, material);
		mesh.position.set(x, -0.5, z);
		scene.add(mesh);
		spawnPoints.push(mesh);
		break;
	 case 'X':
		var geo = new THREE.CubeGeometry(horizontal_unit,
		vertical_unit, horizontal_unit);
		var material = new THREE.MeshLambertMaterial({
			color: 0xcccccc
		});
		 
		var mesh = new THREE.Mesh(geo, material);
		mesh.position.set(x, vertical_unit*0.5, z);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		scene.add(mesh);
		collidableEnviroment.push(mesh);
		break;
	}
}

//keyboard stuff---------------------------------------------------------------------------
var keysDown = [];

//globar variables etc.--------------------------------------------------------------------
generateDebris();
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var speed = 0.5;
var oldTime = 1, newTime;
var milliseconds;
var remotePlayerX;
var remotePlayerY;
var remotePlayerZ;
var gameState = true;
var won = 0, lost = 0;
var incrementScore = true;
//eventHandleers ------------------------------------------------------------------------


document.addEventListener("mousemove", function(e) {
		localPlayer.rotateY (e.movementX * 0.01 *(-1));
		localPlayer.rotateX (e.movementY * 0.01 *(-1));
})

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
});

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
});


function checkMouseClicked(e) {
	$( "body" ).mousedown(function() {	
		shoot();
	});
}

document.getElementsByTagName("canvas")[0].addEventListener("click", function() {
	this.requestPointerLock();
}, false);

socket.on("connect", onSocketConnected);
socket.on("disconnect", onSocketDisconnect);
socket.on("new player", onNewPlayer);
socket.on("update player", onUpdatePlayer);
socket.on("reupdate player", onRemovePlayer);
socket.on("new bullet", onNewBullet);
//socket.on("move bullet", onMoveBullet);
socket.on("remove bullet", onRemoveBullet);
socket.on("check lose", onCheckLose);
socket.on("check spawn", onCheckSpawn);


$(document).ready(function(){
        $("#yesButton").hide();
 });

//game logic-------------------------------------------------------------------------------
function render() {
	sky.position.x = localPlayer.position.x;
	sky.position.y = localPlayer.position.y;
	sky.position.z = localPlayer.position.z;
	lightPoint.position.set(localPlayer.position);
	handleDebris();
	updatePlayer();
	getInput();
	checkHealth();
	test();
	handleBullets();
	handleTime();
	checkCollision();
	checkCollisionWall();
	updateHUD();
	renderer.render( scene, camera );
	requestAnimationFrame( render );
}

function test(){
	if ("66" in keysDown){// SHIFT
		remoteSpawn = true;
		spawnPlayer();
	}
}

function spawnPlayer(){
	var spawn;
	
	if(remoteSpawn == true){
		spawn = spawnPoints[1];
	}
	else{
		spawn = spawnPoints[0];
	}
	
	localPlayer.position.x = 0;
	localPlayer.position.y = 2;
	localPlayer.position.z = 0
	localPlayer.setHealth(100);
	localPlayer.add(camera);
	scene.add(localPlayer);
	gameState = true;
	incrementScore = true;
}

function updatePlayer(){
	socket.emit("update player", {x: localPlayer.getX(), z: localPlayer.getZ(), playerMatrix: localPlayer.getMatrix()});
}

function updateHUD(){
	$("#healthText").text("Health: " + localPlayer.getHealth() + "%");
	$("#livesText").text("Lives: " + localPlayer.getLives());
	$("#won").text("Lives: " + localPlayer.getLives());
	$("#lost").text("Lost: " + lost);
	$("#won").text("Won: " + won);
}

function checkHealth(){
	if(localPlayer.getHealth() <= 0){
		spawnPlayer();
		localPlayer.setLives(localPlayer.getLives() -1);
	}
	if(localPlayer.getLives() <= 0){
		sendLose();
		showLoseMsg();
	}
}

function winMsg(){
	
}

function loseMsg(){
	$("#loseText").text("YOU LOSE");
}

function showLoseMsg(){
	//$("#yesButton").show();
	if(incrementScore == true){
			lost += 1;
			incrementScore = false;
		}
	document.exitPointerLock();
	localPlayer.setLives(3);
	spawnPlayer();
}

function onCheckLose(data){
	if(data.lose == true){
		//$("#yesButton").show();
		if(incrementScore == true){
			won += 1;
			incrementScore = false;
		}
		document.exitPointerLock();
	}
	localPlayer.setLives(3);
	spawnPlayer();
}

function resetGame(){
	spawnPlayer();
}


function checkCollision(){
	var localBox = new THREE.Box3().setFromObject(localPlayer);
	var bulletBox;
	var collision;
	var collisionWall;
	if(collidableMeshList.length > 0){
		for(var i = 0; i < collidableMeshList.length; i++){
			bulletBox = new THREE.Box3().setFromObject(collidableMeshList[i]);
			collision = localBox.isIntersectionBox(bulletBox);
			
				if (collision == true){
					localPlayer.decreaseHealth(10);
				}
		}
	}
}

function checkCollisionWall(){
	var localBox = new THREE.Box3().setFromObject(localPlayer);
	var wallBox;
	var collision;

	for(var i = 0; i < collidableEnviroment.length; i++){
		wallBox = new THREE.Box3().setFromObject(collidableEnviroment[i]);
		collision = localBox.isIntersectionBox(wallBox);
		
		if (collision == true){
			speed = speed * (-1) - 1;
		}
	}
}

function getInput(){
	if ("87" in keysDown){// W
		localPlayer.translateZ(speed * (-1));	
	}
	if ("65" in keysDown){// A
		localPlayer.translateX(speed * (-1));
	}
	if ("83" in keysDown){// S
		localPlayer.translateZ(speed);
	}
	if ("68" in keysDown){// D
		localPlayer.translateX(speed);
	}
	if ("16" in keysDown){// SHIFT
		speed = 1.5;
	}
	else{
		speed = 0.5;
	}

	checkMouseClicked(); // MOUSE CLICK
	
}

function generateDebris(){
	for(i = 0; i < 500; i++){
		var debrisGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
		var debrisMaterial = new THREE.MeshLambertMaterial( { color: "#" + Math.random().toString(16).slice(2, 8)} );
		
		var randomX = ( Math.random() - 0.5 ) * 500;
		var randomY = ( Math.random() - 0.5 ) * 500;
		var randomZ = ( Math.random() - 0.5 ) * 500;	
		
		var debris = new THREE.Mesh( debrisGeometry, debrisMaterial );
		debris.position.x = randomX;
		debris.position.y = randomY;
		debris.position.z = randomZ;
		debris.rotation.x += randomX;
		debris.rotation.y += randomY;
		debrisArray.push(debris);
		scene.add( debris );
	};
}

function handleDebris(){
	for(var i = 0; i < debrisArray.length; i++){
		debrisArray[i].rotation.x += 0.01;
		debrisArray[i].rotation.y += 0.01;
	}
}

function handleTime(){	
	var date = new Date();
	milliseconds = date.getTime();
}

function shoot(){
	if(newTime > oldTime + 50){
		oldTime = milliseconds;
		if(bullets.length > 9){
			scene.remove(bullets[0]); // stop rendering bullet
			bullets.shift(); //remove bullet from the array
		}
			var sphereMaterial = new THREE.MeshLambertMaterial( { color: "#" + Math.random().toString(16).slice(2, 8)} );
			var localBullet = new Bullet(sphereGeo, sphereMaterial);
			localBullet.setRotationFromMatrix(localPlayer.matrix);
			localBullet.position.x = localPlayer.position.x;
			localBullet.position.y = localPlayer.position.y - 1.5;
			localBullet.position.z = localPlayer.position.z;
			localBullet.castShadow = true;
			//localBullet.material.color.setRGB(255, 255, 255);
			bullets.push(localBullet);
			socket.emit("new bullet", {xBul: localBullet.getX(), zBul: localBullet.getZ(), bulRot: localBullet.getMatrix()});
		
	}
}

function handleBullets(){
	newTime = milliseconds;
	if(bullets.length > 0){
		for (var n = 0; n< bullets.length; n++){		
			bullets[n].setMovement(0, 0, -6);
		    scene.add(bullets[n]);
		}		
	}
	
	moveRemoteBullet();
}



function onSocketConnected() {
	socket.emit("new player", {x: localPlayer.getX(), z: localPlayer.getZ(), playerMatrix: localPlayer.getMatrix()});
}
function onSocketDisconnect(data) {
    console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	var newPlayer = new Player(geometry, material);
	
	newPlayer.id = data.id;
	newPlayer.setX(data.x);
	newPlayer.setY(2);
	newPlayer.setZ(data.z);

	scene.add(newPlayer);
	remotePlayers.push(newPlayer);
	collidableMeshList.push(newPlayer);
};

function onUpdatePlayer(data) {
	var movePlayer = playerById(data.id);


	movePlayer.setX(data.x);
	movePlayer.setZ(data.z);
	movePlayer.setMatrix(data.playerMatrix);
	remotePlayerRot = movePlayer;
};

function sendLose(){
	triggerlose = true;
	socket.emit("check lose", {lose: triggerlose});
}

function sendSpawn(){
	spawnTaken = true;
	socket.emit("check spawn", {spawn: spawnTaken});
}

function onCheckSpawn(data){
	remoteSpawn = data.spawn;
	console.log("spawn taken: " + remoteSpawn);
}

function playAgain(){
	
}

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	if (!removePlayer) {
		console.log("Player not found remove (client): "+data.id);
		return;
	};
	
	scene.remove(removePlayer);
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

function onNewBullet(data) {
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: "#" + Math.random().toString(16).slice(2, 8)} );
	var newBullet = new Bullet(sphereGeo, sphereMaterial);
	
	newBullet.id = data.idBul;
	newBullet.setX(data.xBul);
	newBullet.setY(2);
	//newBullet.setMatrix(data.rotBul);
	newBullet.setZ(data.zBul);
	newBullet.setRotationFromMatrix(remotePlayerRot.matrix);
	newBullet.updateMatrix();
	scene.add(newBullet);
	remoteBullets.push(newBullet);
	collidableMeshList.push(newBullet);
};


function moveRemoteBullet(){

	for(var i = 0; i < remoteBullets.length; i++){
		remoteBullets[i].setMovement(0, 0, -6);
	}
	
}

function onRemoveBullet(data) {
	
};


function playerById(id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
			console.log("SUCCESS");
            return remotePlayers[i];
    };
	console.log("FAILURE");
    return 0;
};

function bulletById(idBullet) {
    var i;
    for (i = 0; i < remoteBullets.length; i++) {
        if (remoteBullets[i].id == idBullet)
			console.log("SUCCESS");
            return remoteBullets[i];
    };
	console.log("FAILURE");
    return 0;
};

sendSpawn();
spawnPlayer();
render();

