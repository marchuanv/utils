function Cache(cacheJsonString) {
	var cache = this;
	this._keys=[]
	if (cacheJsonString){
		const parsedObj =JSON.parse(cacheJsonString, function(key, value) {
		  if (typeof value === "string" &&
		      value.startsWith("/Function(") &&
		      value.endsWith(")/")) {
		    value = value.substring(10, value.length - 2);
		    return eval("(" + value + ")");
		  }
		  return value;
		});
		Object.assign(cache, parsedObj);
	}
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
		if (typeof instance === 'function'){
			throw `instance passed for cache key ${key} can't be a function`;
		}
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

	this.stringify=function(){
		return JSON.stringify(this, function(key, value) {
		  if (typeof value === "function") {
		    return "/Function(" + value.toString() + ")/";
		  }
		  return value;
		});
	};
};
module.exports=Cache;