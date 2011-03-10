var cradle = require('cradle');

Task = function(host, port) {
    this.connection = new(cradle.Connection)(host, port, {
        cache: true,
        raw: false
    });
    this.db = this.connection.database('d-do') ;
    this.db.create() ;
}

Task.prototype.update = function(task, data, callback) {
}
Task.prototype.assign = function(task, data, callback) {
}
Task.prototype.updateTimeLeft = function(task, data, callbak) {
}

exports.Task = Task ;
