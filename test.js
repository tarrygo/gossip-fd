var Gossiper = require('./lib/gossiper');
var log4js = require('log4js');
var logger = log4js.getLogger();

var seed = new Gossiper('192.168.1.4', 9000, [])
seed.setLogger(logger)
seed.start()


for(var i =9001; i<9003; i++){
	var peers = new Gossiper('192.168.1.4', i, ['192.168.1.4:9000'])
	peers.setLogger(logger)
	peers.start()
}

