# gossip-fd
Gossip-fd is a nodejs library implementing gossip protocol along with accural phi failure detector. It is based on the implementation recommended in the following papers:
* https://www.cs.cornell.edu/home/rvr/papers/flowgossip.pdf
* http://fubica.lsd.ufcg.edu.br/hp/cursos/cfsc/papers/hayashibara04theaccrual.pdf

It is also influenced by cassandra implementation of gossip protocol.

#Usecase:
1. Creating self managing, sharded applications where each node wants to keep the updated status of other nodes in the same cluster.

#Usage
Each cluster will have some seeds which will be used to bootstrap the cluster. These seeds will get first gossip message from peers joinig the cluster.
### Creating and starting gossiper
```
var Gossiper = require('../lib/gossiper');
// create seed
var seed = new Gossiper('127.0.0.1', 9000, [])
seed.start()
for(var i =9001; i<9010; i++){
	//create new peers and attach then to above seed
	var peer = new Gossiper('127.0.0.1', i, ['127.0.0.1:9000'])
	peer.start()
	peer.on('new_peer_added', function(obj) {
		console.log("state updated " + util.inspect(obj))
	})
}
```
### Updating state contents
``` 
gossiper.updateState(name_of_server, key, value)
gossiper.updateState('127.0.0.1', 'hello', 'world')
```
### Getting alive and dead peers
```
gossiper.alivePeers()
gossiper.deadPeers()
```

###Adding logger to capture debug messages
```
gossiper.setLogger(logger)
// See examples for more details
```

### Events emitted to capture changes:
#### 'peer_alive'
A peer has been newly discovered or has been marked alive
event object: {'name': 'PeerAlive', peer: peer_gossiper}
```
gossiper.on('peer_alive', function(obj){
	console.log("peer marked alive: " + util.inspect(obj))
})
```
#### 'peer_died'
A peer has been dead
event object: {'name': 'PeerDied', peer: peer_gossiper}
```
gossiper.on('peer_died', function(obj){
	console.log("peer marked dead: " + util.inspect(obj))
})
```
#### "peer_state_updated"
Peers State has been updated.
event object: {'name': 'PeerStateUpdated', peer: peer_gossiper}
```
gossiper.on('peer_state_updated', function(obj){
	console.log("peer state changed: " + util.inspect(obj))
})
```
#### 'peer_alive'
New peer has been discovered.
event object: {'name': 'new_peer_added', peer: peer_gossiper}
```
gossiper.on('new_peer_added', function(obj){
	console.log("new peer discovered: " + util.inspect(obj))
})
```

#Documentation
### Gossip message
A message that gets shared between different nodes. By default it contains the version number of each node which keeps incrementing every second. You can include other information as well in this gossip message in the form of key value pair. Example: 'sharding_key': 1231231 For more information check the testcases.




