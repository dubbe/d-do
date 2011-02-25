Task = function() {} ;

Task.prototype.create = function(data, callback) {
    
}
Task.prototype.render = function(task, callback) {
    callback(null, this.dummyData[task]) ;
}
Task.prototype.update = function(task, data, callback) {
}
Task.prototype.assign = function(task, data, callback) {
}
Task.prototype.updateTimeLeft = function(task, data, callbak) {
}
Task.prototype.getAll = function(callback) {
}

exports.Task = Task ;
