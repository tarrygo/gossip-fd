var net = require('net'),
	event_emitter = require('events').EventEmitter,
	util = require('util'),
	msgpack = require('msgpack');
	shuffle = require('shuffle-array'),
	_ = require('underscore'),
	State = require('./state.js'),
	GossipMessageUtil = require('./message/gossip_message_util.js'),
	Digest = require('./message/digest.js')
	Events = require('./events.js')
var requestType = {
	1: 'GOSSIP_MESSAGE',
	2: 'GOSSIP_ACK',
	3: 'GOSSIP_ACK2'
}

function Gossiper(host, port, seeds){
	this.host = host
	this.port = port
	this.name = host + ':' + port
	this.seeds = seeds
	this.stateMap = {}
	this.deadPeers = {}
	this.alivePeers = {}
	this.gossipMessageUtil = new GossipMessageUtil()
	this.logger
}

util.inherits(Gossiper, event_emitter);

Gossiper.prototype.start = function() {
	var self = this
	// create gossip server to exchange gossip messages.
	this.server = net.createServer(function(connection){
		var message_stream = new msgpack.Stream(connection);
		message_stream.on('msg', function(msg) { self.handleGossip(connection, message_stream, msg, 1)});
	})
	this.server.listen(this.port, this.host, function(){})
	this.server.on('listening', function(msg) {
		console.log('listen on address '+ util.inspect(self.server.address()))
	})

	this.createStateMap()
	// Start gossip timer at 1 sec interval
	this.startGossipTimer = setInterval(function() { self.gossip()}, 2000)
};

Gossiper.prototype.stop = function() {
	this.server.close()
	clearTimeout(this.startGossipTimer)
};

Gossiper.prototype.gossip = function() {
	this.stateMap[this.name].hearbeat()
	this.logger.debug('STATEMAP: for: ' + this.port +  util.inspect(this.stateMap))
	gdigests = this.generateGossipDigests()
	if(_.size(gdigests) > 0){
		gmsg = this.gossipMessageUtil.createDigestStartMsg(gdigests)
		wasSeed = this.gossipToLivePeer(gmsg)
		this.gossipToDeadPeerWithProb(gmsg)
		if(!wasSeed && _.size(this.alivePeers) < _.size(this.seeds)){
			this.gossipToSeedWithProb(gmsg)
		}
	}
	this.statusCheck()
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

Gossiper.prototype.alivePeers = function() {
	return this.alivePeers
};

Gossiper.prototype.handleGossip = function(connection, message_stream,  message, call) {
	//console.log('message_received on + '+ this.port + ' from: '+ connection.remotePort + util.inspect(message))
	request_type = message.type
	switch(requestType[request_type]){
		case 'GOSSIP_MESSAGE':
			gossipAck = this.gossipMessageUtil.createDigestAck1(message, this.stateMap)
			message_stream.send(gossipAck)
			this.logger.debug('RECEIVED GOSSIP on ' + this.port + ' from: ' + connection.remotePort + ' msg: '+ util.inspect(message))
			break;
		case 'GOSSIP_ACK':
			this.logger.debug('ACK RECEIVED on ' + this.port + ' from ' +  connection.remotePort + 'call: '+ call + 'msg: '+ util.inspect(message))
			gossipAck2 = this.gossipMessageUtil.createDigestAck2(message, this.stateMap)
			this.updateOnAck1(message)
			message_stream.send(gossipAck2)
			connection.end()
			break;
		case 'GOSSIP_ACK2':
			this.logger.debug('ACK2 RECEIVED on ' + this.port + ' from ' +  connection.remotePort + 'call: '+ call+ 'msg: '+ util.inspect(message))
			this.updateOnAck2(message)
			connection.end()
			break;
	}
};


Gossiper.prototype.createStateMap = function() {
	var self = this
	current_server_name = self.host + ':' + self.port
	self.stateMap[current_server_name] = new State()
	_.each(self.seeds, function(address){
		self.stateMap[address] = new State()
		self.alivePeers[address] = 1
	})
};

Gossiper.prototype.statusCheck = function() {
	var self = this
	date = new Date();
	current_time = date.getTime()
	_.each(this.stateMap, function (state, name) {
		isAlive = state.checkState(current_time)
		if(!isAlive){
			self.deadPeers[name] = current_time
			delete self.alivePeers[name]
			self.emit('peer_died', new Events.PeerDied(name))
		}
		else{
			self.alivePeers[name] = current_time
			delete self.deadPeers[name]
			self.emit('peer_alive', new Events.PeerAlive(name))
		}
	})
};

Gossiper.prototype.generateGossipDigests = function() {
	var self = this
	var digests = []
	endpoints = shuffle(_.keys(self.stateMap), { 'copy': true })
	_.each(endpoints, function(name){
		state = self.stateMap[name]
		digest = new Digest(name, state.getMaxVersion())
		digests.push(digest)
	})
	return digests
};
Gossiper.prototype.gossipToLivePeer = function(digests) {
	if(_.size(this.alivePeers) > 0){
		randomEndpoint = this.randomServer(_.keys(this.alivePeers))
		this.sendGossip(randomEndpoint, digests)
		//this.gossipToPeer(randomEndpoint, digests)
		wasSeed = _.contains(this.seeds, randomEndpoint)
		return wasSeed
	}
	else{
		return false
	}
};
Gossiper.prototype.gossipToDeadPeerWithProb = function(digests) {
	var gossipTodeadProbability = (_.size(this.deadPeers))/(_.size(this.alivePeers) + 1)
	if(Math.random < gossipTodeadProbability){
		randomEndpoint = this.randomServer(_.keys(this.deadPeers))
		this.sendGossip(randomEndpoint, digests)
	}
};
Gossiper.prototype.gossipToSeedWithProb = function(digests) {
	if(_.size(this.alivePeers) < _.size(this.seeds)){
		if(Math.random() < (_.size(this.seeds) / (_.size(this.deadPeers) + _.size(this.alivePeers)))) {
			randomEndpoint = this.randomServer(this.seeds)
			this.sendGossip(randomEndpoint, digests)
    	}
	}
};

Gossiper.prototype.randomServer = function(servers) {
  var i = Math.floor(Math.random()*1000) % servers.length;
  return servers[i];
}
Gossiper.prototype.sendGossip = function(endpoint, message) {
	var self = this
	this.logger.debug('sendGossip: from: ' + this.port + 'to: ' + endpoint)
	address = endpoint.split(':');
	var gosipee = new net.createConnection(address[1], address[0]);
	gosipee.on('connect', function(net_stream) {
		var message_stream = new msgpack.Stream(gosipee);
		message_stream.on('msg', function(msg) { self.handleGossip(gosipee, message_stream, msg, 2)});
		message_stream.send(message)
	})
};

Gossiper.prototype.updateOnAck1 = function(message) {
	deltas = message['content_deltas']
	this.updateStates(deltas)
};

Gossiper.prototype.updateOnAck2 = function(message) {
	deltas = message['content_deltas']
	this.updateStates(deltas)
};

Gossiper.prototype.updateStates = function(deltas) {
	var self = this
	_.each(deltas, function(delta){
		peer_name = delta['name']
		local_state = self.stateMap[peer_name]
		if(!_.isEmpty(local_state) && !_.isNull(local_state)){
			local_state.updateContent(delta['delta'])
			local_state.updateHearbeat(delta['version'])
			self.emit('peer_state_updated', new Events.PeerStateUpdated(peer_name))
		}
		else{
			local_state = self.stateMap[peer_name] = new State()
			self.alivePeers[peer_name] = 1
			local_state.setContent(delta['delta'])
			local_state.updateHearbeat(delta['version'])
			self.emit('new_peer_added', new Events.NewPeerAdded(peer_name))
		}
	})
};

Gossiper.prototype.setLogger = function(logger) {
	this.logger = logger
};

module.exports = Gossiper;


