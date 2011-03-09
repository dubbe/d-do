var cradle = require('cradle');

Project = function(host, port) {
    this.connection = new(cradle.Connection)(host, port, {
        cache: true,
        raw: false
    });
    this.db = this.connection.database('d-do') ;
    this.db.create() ;
} ;

Project.prototype.create = function(task, callback) {
   
    this.db.save('_design/tasks', {
        all: {
            map: function (doc) {
                if (doc.type == 'task') {
                    emit(null, doc);
                }
            } 
        }
    });
    
    this.db.save(task, function(error, result) {
      if (error) {
          callback(error)
      }
      else {
          callback(null, task);
      }
          
    });
}

Project.prototype.render = function(data, callback) {
    
    this.db.view('tasks/all',function(error, result) {
        if( error ){
            callback(error)
        }else{
            var docs = [];
            result.forEach(function (row){
                docs.push(row);
            });
            callback(null, docs);
        } 
    });
    
}
Project.prototype.update = function(task, data, callback) {
}
Project.prototype.assign = function(task, data, callback) {
}
Project.prototype.updateTimeLeft = function(task, data, callbak) {
}

exports.Project = Project ;