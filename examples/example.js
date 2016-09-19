var Gossiper = require('../lib/gossiper');
var log4js = require('log4js');
var logger = log4js.getLogger();
var util = require('util')
var seed = new Gossiper('127.0.0.1', 9000, [])
seed.setLogger(logger)
seed.start()


for(var i =9001; i<9010; i++){
	var peers = new Gossiper('127.0.0.1', i, ['127.0.0.1:9000'])
	peers.setLogger(logger)
	peers.start()
	peers.on('new_peer_added', function(obj) {
		console.log("state updated " + util.inspect(obj))
	})
}