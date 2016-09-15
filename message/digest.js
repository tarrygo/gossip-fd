var Digest = function (name, state) {
	this.name = name
	this.version = state.getMaxVersion()
}