var cradle = require('cradle');

/**
 * Connects to the couch-db databse and creats the db d-do if it doesn't exists
 * 
 * @param {Object} host Standard is localhost
 * @param {Object} port
 */

ObjectModel = function(host, port) {
    this.connection = new(cradle.Connection)(host, port, {
        cache: true,
        raw: false
    });
    this.db = this.connection.database('d-do') ;
    this.db.create() ;
} ;

/**
 * Generic function to add an object to the couch-db database
 * @param {Object} obj
 * @param {Object} callback
 */

ObjectModel.prototype.create = function(obj, callback) {
   
    var allFunction,
        that = this
    
    if (obj.type == "project") {
        allFunction = function(doc){
            if (doc.type == "project") {
                emit(null, doc);
            }
        }
    } else if (obj.type == "task") {
        allFunction = function(doc){
            if (doc.type == "task") {
                emit(null, doc);
            }
        }
    }
   
   
    this.db.save('_design/'+obj.type, {
        all: {
            map: allFunction
        }
    });
    
    this.db.save(obj, function(error, result) {
      if (error) {
          callback(error)
      }
      else {
          that.db.get(result.id, function (err, doc) {
            doc._id = result.id ;
            callback(null, doc)
        });
      }
          
    });
}
/**
 * Generic function to render objects from the database
 * @param {Object} obj
 * @param {Object} callback
 */
ObjectModel.prototype.renderAll = function(obj, userId, callback) {

    this.db.view(obj.model + '/all',function(error, result) {
        if( error ){
            callback(error)
        }else{
            var docs = [];

            result.forEach(function(row){
                if (obj.model == "project") {
                    /* 
                     * If it's a project we have to see so we only get access to the projects we are members of
                     */
                    for(var i = 0; i < row.teamMember.length; i++) {
                        if(row.teamMember[i] == userId) {
                            docs.push(row)
                        } else { 
                        }
                    }
                }
                else {
                    if (obj.parent == row.parent || obj.parent === undefined) {
                        docs.push(row);
                    }
                }
                
            });

            callback(null, docs);
        } 
    });
}

/**
 * Generic function to render object from the database
 * @param {Object} obj
 * @param {Object} callback
 */
ObjectModel.prototype.render = function(id, callback) {
    

    this.db.get(id, function(error, result) {
        result._id = id ;
        if( error ){
            callback(error)
        }else{

            callback(null, result);
            
        } 
    });
}

ObjectModel.prototype.update = function(id, obj, callback){
    var that = this ;
    
    this.db.merge(id, obj, function(error, result){
        if (error) {
            callback(error)
        }
        else {
            that.db.get(result.id, function(error, res) {
                if (!error) {
                    res._id = result.id ;
                    callback(null, res);
                }
            });
        }
    });
}




exports.ObjectModel = ObjectModel ;