
/**
 * Module dependencies.
 */

var express = require('express'),
    assert = require('assert'),
    cradle = require('cradle'),
    Task = require('./task').Task,
    Category = require('./category').Category,
    User = require('./user').User ;
module.exports = express.createServer() ;
var app = module.exports ;



// Database

var db = new(cradle.Connection)().database('d-do');

db.create();

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

//res.send("testar") ;
// Models

var task = new Task() ;
var category = new Category() ;
var user = new User() ;

// Routes

// Dashboard
app.get('/', function(req, res){
    
    // The dashboard-view
    
    task.getAll(function(error, tasks){
        res.render('tasks/render', {
            locals: {
                title: "Tasks",
                tasks: tasks
                }
        })
    })
});


// List
app.get('/:model.:format', function(req, res) {
});

// Create 
app.post('/:model.:format?', function(req, res) {
});

// Read
app.get('/:model/:id.:format?', function(req, res) {
});

// Update
app.put('/:model/:id.:format?', function(req, res) {
});

// Delete
app.del('/:model/:id.:format?', function(req, res) {
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(8080);
  console.log("Express server listening on port %d", app.address().port)
}
