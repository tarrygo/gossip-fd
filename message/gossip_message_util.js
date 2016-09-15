var GossipMessageUtil = function(){}

GossipMessageUtil.prototype.createDigestStartMsg = function(payload) {
	return new GossipMessage(1, payload)
};

GossipMessageUtil.prototype.createDigestAck1 = function(message, stateMap) {
	digests = message.digests
	requests = []
	content_deltas = [] 
	_.each(digests, function (digest) {
		peer = digest.name
		remoteVersion = digest.version
		localVersion = stateMap[peer].getMaxVersion();
		if(localVersion<remoteVersion){
			digest_request = new Digest(peer, localVersion)
			requests.add(digest_request)
		}
		else if(localVersion> remoteVersion){
			content_delta = stateMap[peer].getUpdatedContentAfterVersion(remoteVersion)
			content_deltas.add(peer, delta)
		}
		else{
			// we already have updated information
		}
	})
	content_deltas.sort(function (a, b) {
		return b.delta.length - a.delta.length
	})

	gossipAck1 = {
		'type': 2,
		'requests': requests,
		'content_deltas': content_deltas
	}
	return gossipAck1
};

GossipMessageUtil.prototype.createDigestAck2 = function(message, stateMap) {

	requests = message.requests
	content_deltas = message.content_deltas
	_.each(content_deltas, function(content_delta){
		peer_name = content_delta.name
		this.stateMap[peer_name].updateContentWithDelta(content_delta.delta)
	})
	request_deltas = []
	_.each(requests, function(request) {
		peer_name = request.name
		delta = stateMap[peer_name].getUpdatedContentAfterVersion(request.version)
		request_deltas.add(createDeltaMessage(peer_name, delta))
	})
	request_deltas.sort(function(a, b) {
		return b.delta.length - a.delta.length
	})

	gossipAck2 = {
		'type': 3,
		'delta': request_deltas
	}
	return gossipAck2
};

GossipMessageUtil.prototype.createDeltaMessage = function(name, delta) {
	return {'name': name, 'delta': delta}
};
