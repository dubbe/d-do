DUBBE.namespace("DUBBE.ddo.project") ;

DUBBE.ddo.project = function(project) {
    
    this.tasks = []
    
    this.getObject = function() {
        return project ;
    }
    
    this.getId = function() {
        return project._id ;
    }
    
    this.getTasks() ;
    this.renderButton() ;
}

/**
 * Renders a div with the project in and adds it to the project-bar
 * 
 */
DUBBE.ddo.project.prototype.renderButton = function(){
    
    var that = this,
        parent = $("#projectBar") ;
    
    $("<li>").append($("<a>").addClass("project").text(this.getObject().title).appendTo(parent));
    
    parent.append($("<li>").append($("<a>").text(this.getObject().title)).hover(function(){
        $(this).css('cursor', 'pointer');
    }).click(function(){
        DUBBE.ddo.projects.render(that) ;
    }));
}
DUBBE.ddo.project.prototype.addTask = function(task){
    var nmbr = this.tasks.push(new DUBBE.ddo.task(task)) ;
    
    this.tasks[nmbr-1].render() ;
    
    
}
DUBBE.ddo.project.prototype.getTasks = function() {
    
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
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
            console.log(thrownError);
        }  
    });
}

