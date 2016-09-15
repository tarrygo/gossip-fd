var net = require('net'),
	event_emitter = require('events').EventEmitter,
	util = require('util'),
	msgpack = require('msgpack');
	shuffle = require('shuffle-array'),



var Gossiper = function(host, port, seeds){
	this.host = host
	this.port = port
	this.name = host + ':' + port
	this.seeds = seeds
	this.stateMap = {}
	this.deadPeers = {}
	this.alivePeers = {}
	this.gossipMessageUtil = new GossipMessageUtil()
}

Gossiper.prototype.start = function() {
	// create gossip server to exchange gossip messages.
	this.server = net.createServer(function(connection){
		var message_stream = new msgpack.Stream(connection);
		message_stream.addListener('msg', function(msg) { handleGossip(msg)});
	})
	this.server.listen(this.port, this.host, function(){})

	this.createStateMap()
	// Start gossip timer at 1 sec interval
	this.startGossipTimer = setInterval(function() { this.gossip()}, 1000)
};

Gossiper.prototype.stop = function(first_argument) {
	this.server.close()
	clearTimeout(this.startGossipTimer)
};

Gossiper.prototype.gossip = function(first_argument) {
	this.stateMap[name].hearbeat()
	gdigests = this.generateGossipDigests()
	if(gdigests.length > 0){
		gmsg = gossipMessageUtil.createDigestStartMsg(gdigests)
		wasSeed = gossipToLivePeer(gmsg)
		gossipToDeadPeerWithProb(gmsg)
		if(!wasSeed && livePeers.length < this.seeds.length){
			gossipToSeedWithProb(gmsg)
		}
	}
	statusCheck()
};

Gossiper.prototype.updateState = function(peer_name, key, value) {
	stateMap = this.stateMap[peer_name]
	stateMap[key] = value
};

Gossiper.prototype.getState = function(peer_name) {
	return this.stateMap[peer_name]
};

Gossiper.prototype.deadPeers = function() {
	return this.deadPeers
};

Gossiper.prototype.alivePeers = function(first_argument) {
	return this.alivePeers
};

Gossiper.prototype.handleGossip = function(message) {

	
};


Gossiper.prototype.createStateMap = function() {
	current_server_name = this.host + ':' + this.port
	this.stateMap[current_server_name] = new State()
	for(var name in this.seeds){
		this.stateMap[name] = new State()
	}
};

Gossiper.prototype.statusCheck = function() {
	date = new Date();
	current_time = date.getTime()
	_.each(this.stateMap, function (state, name) {
		state.checkState(current_time)
	})
};

Gossiper.prototype.generateGossipDigests = function() {
	var digests = []
	endpoints = shuffle(_.keys(this.stateMap), { 'copy': true })
	_.each(endpoints, function(name){
		state = stateMap[name]
		digest = new Digest(name, state)
		digests.push(digest)
	})
	return digests
};
Gossiper.prototype.gossipToLivePeer = function(digests) {
	if(this.livePeers.length > 0){
		randomEndpoint = randomServer(this.livePeers)
		sendGossip(randomEndpoint, digests)
		wasSeed = _.contains(this.seeds, randomEndpoint)
		return wasSeed
	}
	else{
		return false
	}
};
Gossiper.prototype.gossipToDeadPeerWithProb = function(digests) {
	gossipTodeadProbability = (this.deadPeers.length)/(this.livePeers.length + 1)
	if(Math.random < gossipToDeadProbability){
		randomEndpoint = randomServer(this.deadPeers)
		sendGossip(randomEndpoint, digests)
	}
};
Gossiper.prototype.gossipToSeedWithProb = function(digests) {
	if(this.livePeers.length < this.seeds.length){
		if(Math.random() < (this.seeds.length / (this.deadPeers.length + this.alivePeers.length))) {
			randomEndpoint = randomServer(this.seeds)
			sendGossip(randomEndpoint, digests)
    	}
	}
};

Gossiper.prototype.randomServer = function(servers) {
  var i = Math.floor(Math.random()*1000) % servers.length;
  return servers[i];
}
Gossiper.prototype.sendGossip = function(endpoint, message) {
	address = endpoint.split(':')
	connection = net.createConnection(address[1], address[0], function(){
		var message_stream = new msgpack.Stream(connection);
		message_stream.send(message)
	})
};




