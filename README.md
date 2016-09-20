# gossip-fd
Gossip-fd is a nodejs library implementing gossip protocol along with accural phi failure detector. It is based on the implementation recommended in the following papers:

It is also influenced by cassandra implementation of gossip protocol.

#Usecase:
1. Creating sharded applications where each node wants to keep the updated status of other nodes in the same cluster.

#Gossip message
Gossip message is the message that gets shared between different nodes. By default it contains the version number of each node which keeps incrementing every second. 
You can include other information as well in this gossip message in the form of key value pair.
  Example: 'sharding_key': 1231231
For more information check the testcases.

#Usage:
Each cluster will have some seeds which will be used to bootstrap the cluster. These seeds will get first gossip message from peers joinig the cluster.

  var Gossiper = require('../lib/gossiper');
  var seed = new Gossiper('127.0.0.1', 9000, [])
  seed.start()
  for(var i =9001; i<9010; i++){
	  var peer = new Gossiper('127.0.0.1', i, ['127.0.0.1:9000'])
	  peer.start()
	  peer.on('new_peer_added', function(obj) {
		console.log("state updated " + util.inspect(obj))
	})
}





