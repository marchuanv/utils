function Cache() {
	
	var thisInstance;

	this.initialise=function(){
		thisInstance=this;
		thisInstance.keys=[]
		thisInstance.items={};
	};
	
	this.getKeys=function(cbFound, cbNotFound, cbComplete){
		if (thisInstance.keys.length==0){
			if (cbNotFound){
				cbNotFound.apply(thisInstance);
			}
		}else{
			for (var obj in his.items){
				var key =obj.toString() 
				if (key.startsWith("_") && !key.startsWith("keys")){
					cbFound.apply(thisInstance, [key.replace('_','')]); // this=calling context of the getKeys function
				}
			};
			if (cbComplete){
				cbComplete.apply(thisInstance);
			}
		}
	};

	this.set = function(key, instance, cbSet){
		if (cbSet && typeof cbSet !== 'function'){
			throw `cbSet is not a function`;
		}
		var newKey = "_"+key;
		if (thisInstance.keys.indexOf(newKey) == -1){
			thisInstance.keys.push(newKey);
		}
		thisInstance.items[newKey] = {
			instance: instance
		};
		if (cbSet){
			cbSet.apply(thisInstance, [instance]);
		}
	};

	this.get = function(key, cbFound, cbNotFound){
		if (typeof cbFound !== 'function'){
			throw `cbFound is not a function`;
		}
		var newKey = "_"+key;
		var item = thisInstance.items[newKey];
		if (item && item.instance){
			cbFound.apply(thisInstance, [item.instance]);
		}else{
			if (cbNotFound){
				cbNotFound.apply(thisInstance);
			}
		}
	};
	
	this.clear = function(){
		thisInstance.getKeys.apply(thisInstance, [function(key){
			delete thisInstance.items[key];
			thisInstance.keys.splice(thisInstance.keys.indexOf(key),1);
		}]);
	};

};
module.exports=Cache;