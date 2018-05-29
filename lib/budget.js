function Budget(require, path, dirname){
	this.expenses=[];
	this.savings=[];
	this.require=require;
	this.path=path;
	this.currentDir=dirname;
}

Budget.prototype.calculate=function(){
}

Budget.prototype.load=function(){
	const dataFile=this.path.join(this.currentDir,"lib","records.json");
	console.log("loading data file from ",dataFile);
	const records=this.require(dataFile);
	console.log('records: ',records);
}