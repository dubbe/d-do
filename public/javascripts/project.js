DUBBE.namespace("DUBBE.ddo.project") ;

DUBBE.ddo.project = function(project) {
    
    this.tasks = [] ;
    this.users = [] ;
    
    this.getObject = function() {
        return project ;
    }
    
    this.getId = function() {
        return project._id ;
    }
    
    this.initAllTasks() ;
    this.initAllUsers() ;
    this.renderButton() ;
}

/**
 * Renders a div with the project in and adds it to the project-bar
 * 
 */
DUBBE.ddo.project.prototype.renderButton = function(){
    
    var that = this,
        parent = $("#projectBar") ;
    
    parent.append($("<li>").append($("<a>").attr("href", "#").text(this.getObject().title)).hover(function(){
        $(this).css('cursor', 'pointer');
    }).click(function(){
        //console.log(that) ;
        DUBBE.ddo.projects.render(that) ;
    }));
}

DUBBE.ddo.project.prototype.addTask = function(task){
    
    var nmbr = this.tasks.push(new DUBBE.ddo.task(task)) ;
    
    this.tasks[nmbr-1].render() ;
    
    
}

DUBBE.ddo.project.prototype.addUser = function(user) {
    this.users.push(new DUBBE.ddo.user(user)) ;
}
DUBBE.ddo.project.prototype.initAllTasks = function() {
    
    var that = this ;
    
   $.ajax({
        type: "GET",
        url: "/api/task/",
        data: "parent="+this.getId(),
        async: false,
        success: function(tasks) {
            for (var i in tasks) {
                that.tasks.push(new DUBBE.ddo.task(tasks[i])) ;
            }
        }
    });
}

DUBBE.ddo.project.prototype.initAllUsers = function(){
    var that = this ;
    
    for (i in this.getObject().teamMember) {
        $.ajax({
            type: "GET",
            url: "/api/user/"+this.getObject().teamMember[i],
            async: false,
            success: function(user) {
                that.users.push(new DUBBE.ddo.user(user)) ;
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });
    }
}