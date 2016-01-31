function Bullet(startX, startZ){ 
		var x = startX;
		var z = startZ;
		var xRot, yRot, zRot;
		var matrix;
		var id;
		var rotation;
	
	var setX = function(newX){
		x = newX;
	}
	var setZ = function(newZ){
		z = newZ;
	}
	var getX = function(){
		return x;
	}
	var getZ = function(){
		return z;
	}
	var getRotation = function(){
		return this.yRot;
	}

	var setRotation = function(newYrot){

		this.yRot = newYrot;

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
        setX: setX,
		setZ: setZ,
		getRotation: getRotation,
		setRotation: setRotation,
		getMatrix: getMatrix,
		setMatrix: setMatrix,
        id: id
    }
};

exports.Bullet = Bullet;