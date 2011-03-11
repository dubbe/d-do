var fbId= "167696906616095";
var fbSecret= "cc7a919fca15b42267ae674b2fc89bc9";
var fbCallbackAddress= "http://vpn.dubbe.se/auth/facebook"; 
/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
    auth= require('connect-auth'),
    oauth= require('oauth'),
    ObjectModel = require('./object').ObjectModel,
    User = require('./user').User ;
    
/**
 * Creating the server
 */
var app = express.createServer(
    express.bodyDecoder(),
    express.staticProvider(__dirname + '/public'),
    express.methodOverride(),
    connect.cookieDecoder(),
    connect.session({ secret: 'testar' }),
    auth( [
        auth.Facebook({appId : fbId, appSecret: fbSecret, scope: "email", callback: fbCallbackAddress})
    ]) 
) ;

/**
 * Setting some configurations for views
 */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(app.router);


// Models

//var taskModel = new Task() ;
var objectModel = new ObjectModel() ;
var userModel = new User() ;

/**
 * Helpers, 
 * The user is neccisary to validate in the views
 */

app.dynamicHelpers({
    
    session: function(req, res){
        //console.log(req.session) ;
        return req.session ;
    },
    user: function(req, res) {
         return userModel.get(req.session.userid) ;
    }
});

/**
 * The first page, just loading the index-view for now.
 */

app.get("/", function(req, res, params){
    if(req.isAuthenticated()) {
        res.render('index', {
            locals: {
                info: req.params
            }
        });
    } else {
        res.render('login', {
            locals: {
                info: req.params
            }
        });
    }
});


/**
 * The pages for the API
 * GET
 * 
 * model is the typ of object (eg. task or project)
 * parent is the parent for the object (eg. a project for a task)
 * format could be if we wan't to send the response as something other then json
 * 
 */

app.get('/api/:model/:id?.:format?', function(req, res) {
   
   if(req.query.parent) {
       req.params.parent = req.query.parent ;
   }
   
    
    if(!req.params.format || req.params.format == "json") {
         if (req.params.id) {
             objectModel.render(req.params.id, function(error, task){
                 var body = JSON.stringify(task);
                 if (body) {
                     res.writeHead(200, {
                         'Content-type': 'application/json',
                         'Content-length': body.length
                     
                     })
                     res.end(body);
                 }
                 else {
                     res.writeHead(404, {
                         'Content-type': 'application/text'
                     
                     })
                     res.end("No information!");
                 }
             })
         } else {
         
             objectModel.renderAll(req.params, function(error, task){
                 var body = JSON.stringify(task);
                 if (body) {
                     res.writeHead(200, {
                         'Content-type': 'application/json',
                         'Content-length': body.length
                     
                     })
                     res.end(body);
                 }
                 else {
                     res.writeHead(404, {
                         'Content-type': 'application/text'
                     
                     })
                     res.end("No information!");
                 }
             })
         }
    } else {
        res.writeHead(400, {
            'Content-type': 'application/text'
        
        })
        res.end("Only json is supported.");
    }

});

/**
 * Create
 * 
 * Model is the type of object to be created
 * 
 */
app.post('/api/:model?', function(req, res) {
   
    req.body.createdBy = req.session.userid ;
    req.body.created = new Date() ;
    
    
    if(req.params.model) {
        req.body.type = req.params.model ;
    }
    if(req.body.type == "project") {
        req.body.teamMember = [req.session.userid] ;
    }
   
    objectModel.create(req.body, function(error, task){
    
        if (error) {
            
            res.writeHead(200, {
                'Content-type': 'application/json',
            })
            
            res.end(error);
            
            }
    
        if (task) {
            res.writeHead(200, {
                'Content-type': 'application/json',
                'Content-length': JSON.stringify(task).length
            })
            
            res.end(JSON.stringify(task));
        }
        
        
    });
  
});


// Update
app.put('/api/:model/:id.:format?', function(req, res) {
    console.log("update") ;
    
    objectModel.update(req.params.id, req.body, function(error, obj){
    
        if (obj) {
            res.writeHead(200, {
                'Content-type': 'application/json',
                'Content-length': JSON.stringify(obj).length
            })
            
            res.end(JSON.stringify(obj));
        } else {
            res.writeHead(404, {
                'Content-type': 'application/text'
            
            })
            res.end("No information!");
        }
        
        
    });
    
}); 
/*
// Delete
app.del('/api/:model/:id.:format?', function(req, res) {
}); */

// Only listen on $ node app.js

/**
 * Authentication, starting with facebook
 */
app.get('/auth/facebook', function(req,res) {

    req.authenticate(['facebook'], function(error, authenticated) {
        if (authenticated) {
            userModel.create({
                name: req.getAuthDetails().user['name'],
                fbId: req.getAuthDetails().user['id'],
                email: req.getAuthDetails().user['email'], 
                type: "user",
                latestLogin: new Date(),
                latestLoginType: "facebook" 
            }, function(error, task){
                if (!error) {
                    req.session.userid = task['id'] ;
                    res.redirect("http://vpn.dubbe.se/"); 
                }
                
            });
            console.log(req.getAuthDetails().user['name'] + " logged in") ;
        }
        
    }) ;
});

/**
 * Starting the server on port 80
 */

if (!module.parent) {
  app.listen(80);
  
  console.log("Express server listening on port %d", app.address().port)
}

