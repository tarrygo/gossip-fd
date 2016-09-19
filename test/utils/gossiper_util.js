var	Gossiper = require('../../lib/gossiper.js'),
	State = require('../../lib/state.js'),
	util = require('util')

function createGossipper() {
	var gossiper = new Gossiper('127.0.0.1', 9000, [])
	gossiper.createStateMap()
	return gossiper
}

function createGossipperWithMultipleSeeds(seeds) {
	var gossiper = new Gossiper('127.0.0.1', 9002, seeds)
	gossiper.createStateMap()
	return gossiper
}


module.exports = {
	createGossipper: createGossipper,
	createGossipperWithMultipleSeeds: createGossipperWithMultipleSeeds
}
