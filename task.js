var cradle = require('cradle');

Task = function(host, port) {
    this.connection = new(cradle.Connection)(host, port, {
        cache: true,
        raw: false
    });
    this.db = this.connection.database('d-do') ;
} ;

Task.prototype.create = function(task, callback) {
    this.db.save(task, function(error, result) {
      if( error ) callback(error)
      else callback(null, task);
    });
}

Task.prototype.render = function(data, callback) {
    callback(null, data) ;
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
