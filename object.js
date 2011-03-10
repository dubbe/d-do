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


    var type = obj.type ;
    
    allFunction = function(doc){
       if (doc.type == type) {
           emit(null, doc);
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
            callback(null, doc)
        });
      }
          
    });
}
/**
 * Generic function to render object/objects from the database
 * @param {Object} obj
 * @param {Object} callback
 */
ObjectModel.prototype.render = function(obj, callback) {


    this.db.view(obj.model + '/all',function(error, result) {
        if( error ){
            callback(error)
        }else{
            var docs = [];

            result.forEach(function(row){
                if(obj.parent == row.parent || obj.parent === undefined) {                   
                    docs.push(row);
                }
                
            });

            callback(null, docs);
        } 
    });
}


exports.ObjectModel = ObjectModel ;