var fbId= "167696906616095";
var fbSecret= "cc7a919fca15b42267ae674b2fc89bc9";
var fbCallbackAddress= "http://localhost:8080"; 
/**
 * Module dependencies.
 */

var express = require('express'),
    assert = require('assert') ,
    connect = require('connect'),
    crypto = require('crypto'),
    auth= require('connect-auth'),
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

// Models

var taskModel = new Task() ;
var category = new Category() ;
var user = new User() ;

app.get('/signin', function(req,res) {
  req.authenticate([req.param('method')], function(error, authenticated) { 
    // You might be able to get away with the referrer here... 
    res.redirect(req.param('redirectUrl'))
   });
});

app.get('/login', function(req, res){
  var sign_in_link= "/signin?method=facebook&redirectUrl=" + escape(req.url);
  if( req.isAuthenticated() ) {
    res.send('<html><body><h1>Signed in with Facebook</h1></body></html>')
  }
  else {
    res.send('<html><body><a href="'+ sign_in_link + '">Sign in with Facebook</a></body></html>')
  }
});

// Routes

// Serve the pages
app.get('/:page?', function(req, res){
    
    if (!req.params.page) {
        // The dashboard-view
        res.render('index', {
            locals: {
                info: req.params
            }
        })
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
    
    taskModel.create({
        title: req.param('title'),
        info: req.param('info'),
        type: "task"
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

