var	_ 				= require('underscore'),
	FailureDetector = require('./failure_detector.js')

function State() {
	this.heartbeat_version = 0
	this.max_version = 0
	this.isAlive = true
	this.fd = new FailureDetector()
	this.content = {}
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

State.prototype.getMaxVersion = function() {
	return this.max_version
};

State.prototype.setContent = function(content) {
	this.content = content
};

State.prototype.updateContent = function(contents) {
	_.each(contents, function(value){
		this.content.add(value)
	});
};

State.prototype.getUpdatedContentAfterVersion = function(version) {
	request = []
	_.each(this.content, function(value, key) {
		if(key>version){
			request.add(value)
		}
	})
	return request
};

module.exports = State
