var fbId= "167696906616095";
var fbSecret= "cc7a919fca15b42267ae674b2fc89bc9";
var fbCallbackAddress= "http://vpn.dubbe.se/auth/facebook"; 
/**
 * Module dependencies.
 */

var express = require('express'),
    assert = require('assert') ,
    connect = require('connect'),
    crypto = require('crypto'),
    auth= require('connect-auth'),
    oauth= require('oauth'),
    Task = require('./task').Task,
    Category = require('./category').Category,
    User = require('./user').User ;
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

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(app.router);

// Configuration

app.configure(function(){

  
  //app.use();
 
});

app.configure('development', function(){
  app.use(express.logger()) ;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.logger()) ;
  app.use(express.errorHandler()); 
});

app.configure('test', function() {
  app.use(express.logger()) ;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.dynamicHelpers(require('./helpers/helpers.js').dynamicHelpers);


// Models

var taskModel = new Task() ;
var category = new Category() ;
var userModel = new User() ;


// header

app.get("/", function(req, res, params){
    
    res.render('index', {
        locals: {
            info: req.params
        }
    }) ;
});

app.get('/auth/facebook', function(req,res) {
    
    var sess = req.session ;
    
    req.authenticate(['facebook'], function(error, authenticated) {
        if (authenticated) {
            userModel.create({
                name: req.getAuthDetails().user['name'],
                fbId: req.getAuthDetails().user['id'],
                email: req.getAuthDetails().user['email'], 
                type: "user",
                latestLogin: new Date() 
            }, function(error, task){
                if (!error) {
                    sess.userid = task['id'] ;
                    console.log(task) ;
                    res.redirect("http://vpn.dubbe.se/"); 
                }
                
            });
        }
        
    }) ;
});


// Routes

// Serve the pages
app.get('/dashboard', function(req, res){

    if( req.isAuthenticated() ) {
        res.render('index', {
        locals: {
            info: req.params
        }
    }) ;
    }
    else {
        res.redirect("http://vpn.dubbe.se/")
    } 


});

// API
// Get
app.get('/api/:model.:format?', function(req, res) {
    
    
    if(!req.params.format || req.params.format == "json") {
        if(req.params.model === "task") {

            taskModel.render("testar", function(error, task){
                var body = JSON.stringify(task) ;   
                
                res.writeHead(200, {
                    'Content-type': 'application/json',
                    'Content-length': body.length
                    
                })
                res.end(body) ;
            })
        } else {
            res.render('error', {
            locals: {
                msg: "Cannot give the requested model!"
            }
        })
        }
    } else {
        res.render('error', {
            locals: {
                msg: "Cannot give the requested format!"
            }
        })
    }

});

// Create 
app.post('/api/:model', function(req, res) {
    var sess = req.session ;
    console.log(sess.userid) ;
    taskModel.create({
        title: req.param('title'),
        info: req.param('info'),
        type: "task",
        user: sess.userid,
        created: new Date()
    }, function(error, task) {

        res.writeHead(200, {
            'Content-type': 'application/json',
            'Content-length': JSON.stringify(task).length
        })
    
        res.end(JSON.stringify(task)) ;
        
        
    });

    return ;
   
});
/*

// Update
app.put('/api/:model/:id.:format?', function(req, res) {
}); 

// Delete
app.del('/api/:model/:id.:format?', function(req, res) {
}); */

// Only listen on $ node app.js



if (!module.parent) {
  app.listen(80);
  
  console.log("Express server listening on port %d", app.address().port)
}

