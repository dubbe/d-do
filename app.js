
/**
 * Module dependencies.
 */

var express = require('express'),
    assert = require('assert'),
    //cradle = require('cradle'),
    Task = require('./task').Task,
    Category = require('./category').Category,
    User = require('./user').User ;
module.exports = express.createServer() ;
var app = module.exports ;

// Database
/*
var db = new(cradle.Connection)().database('d-do');

db.create();*/

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
 
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

var task = new Task() ;
var category = new Category() ;
var user = new User() ;

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

            task.render("testar", function(error, task){
                res.render('tasks/render', {
                  locals: {
                    title: "d-Do",
                    task: task
                  }
                });
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
app.get('/api/save/:model', function(req, res) {
    task.create({
        title: req.param('title'),
        body: req.param('body'),
        type: "task"
    }, function(error, task) {
        res.partial('tasks/render', {
          collection: {
            title: task.title,
            task: task.body
          }
        });
    });
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
  app.listen(8080);
  console.log("Express server listening on port %d", app.address().port)
}
