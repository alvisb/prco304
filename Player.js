function Player(startX, startZ, startY){ 
		var x = startX;
		var z = startZ;
		var y = startY;
		var xRot, yRot, zRot;
		var matrix;
		var id;
		var health;
		var lives;
	
	var setX = function(newX){
		x = newX;
	}
	var setZ = function(newZ){
		z = newZ;
	}
	var setY = function(newY){
		y = newY;
	}
	var getX = function(){
		return x;
	}
	var getZ = function(){
		return z;
	}
	var getY = function(){
		return y;
	}
	var setRotation = function(newXrot, newYrot, newZrot){
		this.xRot = newXrot;
		this.yRot = newYrot;
		this.zRot = newZrot;
	}
    var getMatrix = function(){
		return this.matrix;
	}

	var setMatrix = function(newMatrix){
		this.matrix = newMatrix;
	}

	
	return {
        getX: getX,
		getZ: getZ,
		getY: getY,
        setX: setX,
		setZ: setZ,
		setY: setY,
		getMatrix: getMatrix,
		setMatrix: setMatrix,
        id: id
    }
};

exports.Player = Player;