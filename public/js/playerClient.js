function Player(){ 
    THREE.Mesh.apply(this,Array.prototype.slice.call(arguments));

	Player.prototype.describe = function(){
		THREE.Mesh.prototype.describe.call(this);
		var moveX = this.moveX;
		var moveY = this.moveY;
		var velocityY = 0.5;
		var id;
		var health = 100;
		var lives = 3;
	}

}

Player.prototype = new THREE.Mesh();
Player.prototype.constructor = THREE.Player;

Player.prototype.move = function(moveX, moveY){
	this.translateX(moveX);
	this.translateY(moveY);
}

Player.prototype.setX = function(newX){
	this.position.x = newX;
}
Player.prototype.setY = function(newY){
	this.position.y = newY;
}
Player.prototype.setZ = function(newZ){
	this.position.z = newZ;
}

Player.prototype.getX = function(){
	return this.position.x;
}
Player.prototype.getY = function(){
	return this.position.y;
}
Player.prototype.getZ = function(){
	return this.position.z;
}
Player.prototype.getRotation = function(){
	return this.rotation;
}
Player.prototype.getMatrix = function(){
	return this.matrix;
}
Player.prototype.setRotation = function(rotX, rotY, rotZ){
	this.rotation.x = rotX;
	this.rotation.y = rotY;
	this.rotation.z = rotZ;
}
Player.prototype.setMatrix = function(newMatrix){
	this.setRotationFromMatrix(newMatrix);
}

Player.prototype.setHealth = function(newHealth){
	this.health = newHealth;
}

Player.prototype.getHealth = function(){
	return this.health;
}
Player.prototype.setLives = function(newLives){
	this.lives = newLives;
}

Player.prototype.getLives = function(){
	return this.lives;
}

Player.prototype.increaseHealth = function(addHealth){
	this.health += addHealth;
}

Player.prototype.decreaseHealth = function(subHealth){
	this.health -= subHealth;
}