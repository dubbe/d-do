exports.dynamicHelpers = {
    users: function(req, res) {
        if( req.isAuthenticated() ) {
            var sess = req.session ;
            userModel.get(sess.userid, function(error, result) {
                return result ;
            }) ;
           
        }
        else {
            return {
                loggedIn: false
            }
        }
    }
};