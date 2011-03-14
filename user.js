var cradle = require('cradle');

/**
 * Connection to the couchdb-database and creating d-do if it doesn't exist
 * @param {Object} host
 * @param {Object} port
 */
User = function(host, port) {
    this.connection = new(cradle.Connection)(host, port, {
        cache: true,
        raw: false
    });
    this.db = this.connection.database('d-do') ;
    this.db.create() ;
} ;

/**
 * Writes the user into the couch-db. Creates a view to get all users as well.
 * 
 * @param {Object} user
 * @param {Function} callback
 * 
 * @return
 */
User.prototype.create = function(user, callback) {
    
    this.db.save('_design/user', {
        all: {
            map: function (doc) {
                if (doc.type == 'user') {
                    emit(null, doc);
                }
            }
        } 
    });
    
    var that = this ;
   
    this.db.view('user/all', function(err, res) {
        
        var id = false ;
        
        if(res) {
            res.forEach(function (row) {
                if(row['email'] == user['email']) {
                    id = row['_id'] ;
                }
            })
        }
        
        if (id === false) {
            that.db.save(user, function(error, result){
            if (error) {
                callback(error)
            }
            else {
                console.log(result) ;
                that.db.save('_design/'+result['id'], {
                    tasks: {
                        map: function (doc) {
                            if (doc.type == 'task' && doc.user == result['id']) {
                                emit(null, doc);
                            }
                        }
                    } 
                });
                callback(null, result);
            }

        });
        } else {
            that.db.merge(id, user, function(error, result){
                if (error) {
                    callback(error)
                }
                else {
                    callback(null, result);
                }
            });
        }
    
    }) ;
}
/**
 * Gets a user based on the id
 * @param {Object} id
 * 
 * @return the user-object
 */

User.prototype.get = function(id){
    
    return this.db.get(id, function (error, result) {
        result._id = id ;
        if(!error) {
            return result ;
        } 
    
    }); 
}

// CRUD

exports.User = User ;