exports.dynamicHelpers = {
    users: function(req, res) {
        if( req.isAuthenticated() ) {
            return {
                loggedIn: true,
                name: "Thomas",
            }
        }
        else {
            return {
                loggedIn: false
            }
        }
    }
};