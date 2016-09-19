var test = require('tape').test,
	Gossiper = require('../lib/gossiper.js'),
	State = require('../lib/state.js'),
	GossipMessageUtil = require('../lib/message/gossip_message_util.js'),
	util = require('util'),
	_ = require('underscore'),
	gossip_util = require('./utils/gossiper_util.js')



test('verify gossip start message', function(assert) {
	gossiper = gossip_util.createGossipper()
	digest = gossiper.generateGossipDigests()
	gossipMessageUtil = new GossipMessageUtil()
	digest_message = gossipMessageUtil.createDigestStartMsg(digest)
	assert.equal(digest_message.type, 1, 'type should be equal to 1')
	assert.end()
})

 test('verify ack1 message with empty state map', function(assert) {
	var seeds = ['127.0.0.1:9000', '127.0.0.1:9001']
 	gossiper = gossip_util.createGossipperWithMultipleSeeds(seeds)
	seeds.push('127.0.0.1:9002')
	digest = gossiper.generateGossipDigests()
	gossipMessageUtil = new GossipMessageUtil()
	digest_message = gossipMessageUtil.createDigestStartMsg(digest)
	ack1 = gossipMessageUtil.createDigestAck1(digest_message, {})
	assert.equal(ack1['type'], 2, 'type should be 2')
	requests = ack1['requests']
	_.each(requests, function(digest , i) {
		assert.ok(seeds.indexOf(digest['name']) != -1, 'server should exists')
	})
	assert.end()
 })


