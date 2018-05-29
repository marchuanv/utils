function Cache() {
	
	this.keys=[];
	this.items=[];
	
	this.getKeys=function(cbFound, cbNotFound, cbComplete) {
		if (this.keys.length==0) {
			
			if (cbNotFound){
				cbNotFound();
			}

		} else {
			
			for (var obj in this.items){
				var key =obj.toString() 
				if (key.startsWith("_") && !key.startsWith("keys")){
					cbFound(key.replace('_',''));
				}
			};

			if (cbComplete){
				cbComplete();
			}
		}
	}

	this.set = function(key, instance, cbSet) {
		
		if (cbSet && typeof cbSet !== 'function'){
			throw `cbSet is not a function`;
		}
		
		var newKey = "_"+key;
		if (this.keys.indexOf(newKey) == -1){
			this.keys.push(newKey);
		}
		
		this.items[newKey]={
			instance: instance
		}

		if (cbSet) {
			cbSet(instance);
		}
	}

	this.get = function(key, cbFound, cbNotFound) {
		if (typeof cbFound !== 'function'){
			throw `cbFound is not a function`;
		}
		var newKey = "_"+key;
		var item = this.items[newKey];
		if (item && item.instance) {
			cbFound(item.instance);
		} else {
			if (cbNotFound){
				cbNotFound();
			}
		}
	}
	
	this.clear = function(){
		this.getKeys(function(key){
			delete this.items[key];
			this.keys.splice(this.keys.indexOf(key),1);
		});
	}
}