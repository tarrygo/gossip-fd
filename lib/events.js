function NewPeerAdded(peer) {
    this.name = this.constructor.name;
    this.peer = peer
}

function PeerStateUpdated(peer) {
    this.name = this.constructor.name;
    this.peer = peer;
}

function PeerDied(peer) {
    this.name = this.constructor.name;
    this.peer = peer
}

function PeerAlive(peer) {
    this.name = this.constructor.name;
    this.peer = peer
}

module.exports = {
    NewPeerAdded: NewPeerAdded,
    PeerStateUpdated: PeerStateUpdated,
    PeerDied: PeerDied,
    PeerAlive: PeerAlive
};