var _ = require('underscore')

function FailureDetector() {
	this.arrival_intervals = []
	this.last_hearbeat = 0
	this.mean = 0
}

FailureDetector.prototype.report = function(arrival_time) {
	time_diff = arrival_time - this.last_hearbeat
	this.last_hearbeat = arrival_time
	if(_.isEmpty(arrival_intervals)){
		arrival_intervals.add(750)
	}
	else{
		arrival_intervals.add(time_diff)
		if(arrival_intervals.length = 1000){
			this.mean = (this.mean*1000 - arrival_intervals[0] + time_diff)/1000
			arrival_intervals.add(time_diff)
			arrival_intervals.shift()
		}
		else{
			size = arrival_intervals.length
			this.mean = (this.mean*size + time_diff)/(size +1)
			arrival_intervals.add(time_diff)
		}
	}
};

FailureDetector.prototype.check = function(current_time) {
	prob_later = -1 * Math.exp((current_time - this.last_hearbeat)/this.mean)
	phi = -1* Math.log10(prob_later)
	if(phi > this.phi_threshold){
		return true
	}
	else{
		return false
	}
};

module.exports = FailureDetector