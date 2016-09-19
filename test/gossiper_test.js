var test = require('tape').test,
	Gossiper = require('../lib/gossiper.js'),
	State = require('../lib/state.js'),
	util = require('util'),
	gossip_util = require('./utils/gossiper_util.js')

test('gossip empty state', function (assert) {
	gossiper = gossip_util.createGossipper()
	var state = new State()
	var stateMap = {}
	stateMap['127.0.0.1:9000'] = state
	assert.deepEqual(stateMap, gossiper.stateMap, " shold be equal")
	assert.end()
})

test('gossip state with contents', function (assert) {
	gossiper = gossip_util.createGossipper()
	gossiper.updateState('127.0.0.1:9000', 'hello', 'world')
	var state = new State()
	state.updateContent({'hello': 'world'})
	assert.deepEqual(state, gossiper.getState('127.0.0.1:9000'), " shold be equal")
	assert.end()
	
})

test('gossip digest with multiple seeds and peers', function(assert) {
	var seeds = ['127.0.0.1:9000', '127.0.0.1:9001', '127.0.0.1:9003']
	gossipers = gossip_util.createGossipperWithMultipleSeeds(seeds)
	seeds.push('127.0.0.1:9002')
	digests = gossipers.generateGossipDigests()
	_.each(digests, function(digest, i) {
		expected = -1
		assert.ok(seeds.indexOf(digest.name) != -1, 'name exists')
		assert.equal(digest.version, 0, 'version is 0')
	})
	assert.end()
	
})


