var State = function () {
	this.heartbeat_version = 0
	this.max_version = 0
	this.isAlive = true
	this.fd = new FailureDetector()
}

State.prototype.hearbeat = function() {
	this.heartbeat_version +=1
	if(this.max_version<this.heartbeat_version){
		this.max_version = this.heartbeat_version
	}
};

State.prototype.checkState = function(current_time) {
	isAlive = this.fd.check(current_time)
	this.isAlive = isAlive
};