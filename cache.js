function Cache() {
	var cache = this;
	this._keys=[]
	
	this.getKeys=function(cbFound, cbNotFound, cbComplete){
		if (cache._keys.length==0){
			if (cbNotFound){
				cbNotFound.apply(this);
			}
		}else{
			for (var obj in cache){
				var key =obj.toString() 
				if (key.startsWith("_") && !key.startsWith("_keys")){
					cbFound.apply(this, [key.replace('_','')]); // this=calling context of the getKeys function
				}
			};
			if (cbComplete){
				cbComplete.apply(this);
			}
		}
	};

	this.set = function(key, instance, cbSet){
		if (cbSet && typeof cbSet !== 'function'){
			throw `cbSet is not a function`;
		}
		var newKey = "_"+key;
		if (cache._keys.indexOf(newKey) == -1){
			cache._keys.push(newKey);
		}
		cache[newKey] = {
			instance: instance
		};
		if (cbSet){
			cbSet.apply(this, [instance]);
		}
	};

	this.get = function(key, cbFound, cbNotFound){
		if (typeof cbFound !== 'function'){
			throw `cbFound is not a function`;
		}
		var newKey = "_"+key;
		var item = cache[newKey];
		if (item && item.instance){
			cbFound.apply(this, [item.instance]);
		}else{
			if (cbNotFound){
				cbNotFound.apply(this);
			}
		}
	};
	
	this.clear = function(){
		this.getKeys.apply(this, [function(key){
			delete cache[key];
			cache._keys.splice(cache._keys.indexOf(key),1);
		}]);
	};

};
module.exports=Cache;