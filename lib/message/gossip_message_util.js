var	_ 				= require('underscore'),
	GossipMessage 	= require('./gossip_message.js')
function GossipMessageUtil(){
	this.md = 1
}

GossipMessageUtil.prototype.createDigestStartMsg = function(payload) {
	return new GossipMessage(1, payload)
};

GossipMessageUtil.prototype.createDigestAck1 = function(message, stateMap) {
	digests = message.payload
	requests = []
	content_deltas = [] 
	_.each(digests, function (digest) {
		peer = digest.name
		remoteVersion = digest.version
		localState = stateMap[peer]
		if(_.isUndefined(localState)){
			digest_request = new Digest(peer, 0)
			requests.push(digest_request)
		}
		else{
			localVersion = stateMap[peer].getMaxVersion();
			if(localVersion<remoteVersion){
				digest_request = new Digest(peer, localVersion)
				requests.push(digest_request)
			}
			else if(localVersion> remoteVersion){
				content_delta = stateMap[peer].getUpdatedContentAfterVersion(remoteVersion)
				content_delta_obj ={}
				content_delta_obj[peer] = content_delta
				content_deltas.push(content_delta_obj)
			}
			else{
				// we already have updated information
			}
		}
	})
	content_deltas.sort(function (a, b) {
		return _.size(b.delta) - _.size(a.delta)
	})

	gossipAck1 = {
		'type': 2,
		'requests': requests,
		'content_deltas': content_deltas
	}
	return gossipAck1
};

GossipMessageUtil.prototype.createDigestAck2 = function(message, stateMap) {
	var self = this
	requests = message.requests
	content_deltas = message.content_deltas
	//console.log(content_deltas)
	_.each(content_deltas, function(content_delta){
		peer_name = _.keys(content_delta)[0]
		stateMap[peer_name].updateContent(content_delta.delta)
	})
	request_deltas = []
	_.each(requests, function(request) {
		peer_name = request['name']
		delta = stateMap[peer_name].getUpdatedContentAfterVersion(request['version'])
		request_deltas.push(self.createDeltaMessage(peer_name, delta))
	})
	request_deltas.sort(function(a, b) {
		return _.size(b.delta) - _.size(a.delta)
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

module.exports = GossipMessageUtil

