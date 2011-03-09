DUBBE.namespace("DUBBE.ddo") ;

DUBBE.ddo.user = {
    login: function() {
        
    },
    logout: function() {
        
    },
    validate: function() {
        
    }
}

DUBBE.ddo.task = {
    
    
    
    create: function(task) {
        
        var data = "" ;
        
        $.each(task, function(i, val) {
            data += i + "=" + $(val).val() + "&" ;
           
        }) ;
         
        var that = this ;
        $.ajax({
            type: "POST",
            url: "/api/task",
            data: data,
            success: function(msg) {
                that.render(msg) ;
            }
        })
    },
    render: function(task) {
        $("<div>").addClass("task").html("<p><b>"+task.title+"</b><br />"+task.info+"</p>").appendTo("body") ;
    },
    renderAll: function() {
        
        var that = this ;
        
        $.ajax({
            type: "GET",
            url: "/api/task",
            success: function(messages) {
                for (var i in messages) {
                    that.render(messages[i]) ;
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });
        
    },
    update: function() {
        
    }
    
    
}

DUBBE.ddo.category = {
    // some kind of crud
}

DUBBE.ddo.project = {
    create: function(project) {
        
        var data = "" ;
        
        $.each(project, function(i, val) {
            data += i + "=" + $(val).val() + "&" ;
           
        }) ;
         
        var that = this ;
        $.ajax({
            type: "POST",
            url: "/api/project",
            data: data,
            success: function(msg) {
                that.render(msg) ;
            }
        })
    }
} 

DUBBE.ddo.ajax = {
    create: function(object) {
        
        var data = "" ;
        
        $.each(object, function(i, val) {
            data += i + "=" + $(val).val() + "&" ;
           
        }) ;
         
        var that = this ;
        $.ajax({
            type: "POST",
            url: "/api",
            data: data,
            success: function(msg) {
                console.log(msg) ;
                //that.render(msg) ;
            }
        })
    }
}


$(document).ready(function() {

    /* $(document).click(function(e) {
        console.log(e.target) ;
    }) ; */
    
    DUBBE.ddo.task.renderAll() ;
    
    $("#createProject").click(function(e) {
        e.preventDefault() ;
        
        DUBBE.utils.popup({
            header: "Nyt projekt",
            obj: 
                DUBBE.form.create({
                    name: "form",
                    fields: [{
                        name: "title",
                        type: "input",
                        label: "Namn"   
                    }, {
                        name: "info",
                        type: "text",
                        label: "Information"
                    }],
                    submit: function(p) {
                        DUBBE.ddo.project.create(p) ;
                    },
                    submitText: "Spara"
                }) 
            
        }) ;
        
        
    }) ;

    $("#createTask").click(function(e) {
        e.preventDefault() ;
        
        DUBBE.utils.popup({
            header: "Ny task",
            obj: 
                DUBBE.form.create({
                    name: "form",
                    fields: [{
                        name: "title",
                        type: "input",
                        label: "Namn"   
                    }, {
                        name: "info",
                        type: "text",
                        label: "Information"
                    }, {
                        name: "prio",
                        type: "input",
                        label: "Prioritet"
                    }, {
                        name: "type",
                        type: "hidden",
                        value: "task"
                    }],
                    submit: function(p) {
                        DUBBE.ddo.ajax.create(p) ;
                    },
                    submitText: "Spara"
                }) 
            
        }) ;
        
        
    }) ;
    

});
