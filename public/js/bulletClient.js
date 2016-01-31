function Bullet(){ 
    THREE.Mesh.apply(this,Array.prototype.slice.call(arguments));

	Bullet.prototype.describe = function(){
		THREE.Mesh.prototype.describe.call(this);
		var moveAmount = 0.5;
		var id;
	}

}

Bullet.prototype = new THREE.Mesh();
Bullet.prototype.constructor = THREE.Bullet;

Bullet.prototype.setX = function(newX){
	this.position.x = newX;
}
Bullet.prototype.setY = function(newY){
	this.position.y = newY;
}
Bullet.prototype.setZ = function(newZ){
	this.position.z = newZ;
}
Bullet.prototype.setMovement = function(moveX, moveY, moveZ){
	this.translateX(moveX);
	this.translateY(moveY);
	this.translateZ(moveZ);
}

Bullet.prototype.getX = function(){
	return this.position.x;
}
Bullet.prototype.getY = function(){
	return this.position.y;
}
Bullet.prototype.getZ = function(){
	return this.position.z;
}
Bullet.prototype.getRotation = function(){
	return this.rotation.y;
}
Bullet.prototype.getMatrix = function(){
	return this.matrix;
}
Bullet.prototype.setRotation = function(rotY){

	this.rotation.y = rotY;

}
Bullet.prototype.setMatrix = function(newMatrix){
	this.setRotationFromMatrix(newMatrix);
}