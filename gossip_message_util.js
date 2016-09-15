var GossipMessageUtil = function(){}

GossipMessageUtil.prototype.createDigestStartMsg = function(payload) {
	return new GossipMessage(1, payload)
};

GossipMessageUtil.prototype.createDigestAck1 = function(payload) {
	return new GossipMessage(2, payload)
};

GossipMessageUtil.prototype.createDigestAck2 = function(payload) {
	return new GossipMessage(3, payload)
};