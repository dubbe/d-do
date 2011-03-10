DUBBE.namespace("DUBBE.ddo") ;

DUBBE.ddo.user = {
    get: function(userId) {
        
        var that = this ;
        var resp ;
        
        $.ajax({
            type: "GET",
            url: "/api/user/"+userId,
            async: false,
            success: function(user) {
               resp = user ;         
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });

    return resp ;
    }
}

/**
 * Functions for tasks specifically
 * @param {Object} task
 * @param {Object} parent
 */

DUBBE.ddo.task = {
 
    
    render: function(task, parent) {
        
        parent = (task.userId) ? $("#"+task.userId) : parent ;
        
        $("<li>").addClass("task").attr("id", task._id).appendTo(parent).html("<p><b>"+task.title+"</b><br />"+task.info+"</p>") ;
    
    },
    renderAll: function(param) {

        var that = this ;
        console.log(param) ;
        
        $.ajax({
            type: "GET",
            url: "/api/task/",
            data: "parent="+param.parent,
            success: function(tasks) {
                for (var i in tasks) {
                    that.render(tasks[i], param.parentElem) ;
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });

        
    },
    update: function() {
        
    },
    assign: function(param) {
        
        var data = "userId="+param.userId ;
        
        $.ajax({
            type: "PUT",
            url: "/api/task/"+param.taskId,
            data: data,
            success: function(msg) {
                console.log("yeah!") ;
            }
        })
    }
    
    
}

/**
 * Functions for projects specifically
 * @param {Object} project
 */

DUBBE.ddo.project = {
    /**
     * Renders a div with the project in and adds it to the body
     * @param {Object} project
     */
    render: function(project) {
        var that = this ;
        $("<li>").append(
            $("<a>").addClass("project").text(project.title).appendTo($("#projectList"))
        ) ;
        
        $("#projectList").append(
            $("<li>").append(
                $("<a>").text(project.title)
            ).hover(function() {
                $(this).css('cursor','pointer') ;
            }).click(function() {
                that.renderDashboard(project)
            })
         );
         
    },
    /**
     * Loops through all projects and renders them using render
     */
    renderAll: function(){
        
        var that = this ;
        
        $.ajax({
            type: "GET",
            url: "/api/project",
            success: function(projects) {
                for (var i in projects) {
                    that.render(projects[i]) ;
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        }); 
    },
    renderDashboard: function(project) {
        
        $("#users").empty() ;
        $("#tasks").empty() ;
        
        
        for (i in project.teamMember) {

            $("#users").append(
                $("<h2>").text(DUBBE.ddo.user.get(project.teamMember[i]).name)
            ).append(
                $("<ul>").addClass("sortable").attr("id", project.teamMember[i])
            )
        }
        
        var div = $("<ul>").appendTo("#tasks").addClass("sortable") ;
        
        var tasks = $("#tasks").append(
            $("<a>").click(function(e) {
                e.preventDefault() ;
        
                    // Creats the form in the popup
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
                                }],
                                submit: function(p) {
                                    DUBBE.ddo.ajax.create({
                                        data: p,
                                        model: "task",
                                        parent: project._id,
                                        parentElem: div
                                    }) ;
                                },    
                                submitText: "Spara"
                            }) 
                    }) 
            }).text("Skapa task").attr("href", "#")) ;
        
        DUBBE.ddo.task.renderAll({
            parentElem: div,
            parent: project._id
        })
        
        $(".sortable").sortable({
            connectWith: ".sortable",
            receive: function(event, ui) {
                DUBBE.ddo.task.assign({
                    taskId: $(ui.item).attr("id"),
                    userId: $(this).attr("id")
                })
            }
        }).disableSelection();        
        
    }
} 


/**
 * Some generic functions to be used with ajax. 
 * 
 */

DUBBE.ddo.ajax = {
    /**
     * A middle-layer so i can add the parent to task.render and not to project.render 
     */
    render: function(msg, parent) {
        if (msg.type == "project") {
            DUBBE.ddo.project.render(msg)
        }
        else 
        if (msg.type == "task") {
            DUBBE.ddo.task.render(msg, parent)
       }
    } ,
    /**
     * Function to take the output from the form and send it to the api
     */
    create: function(param) {
        
        var object = param.data ;
        var model = (param.model) ? param.model : "" ;
        
        var data = "" ;
        
        $.each(object, function(i, val) {
            data += i + "=" + $(val).val() + "&" ;  
        }) ;
        
        if(param.parent){
            data += "parent=" + param.parent + "&" ;
        }
        
        // Remove the last &
        data = data.substring(0, data.length-1) ;
         
        var that = this ;
        $.ajax({
            type: "POST",
            url: "/api/"+model,
            data: data,
            success: function(msg) {
                if (param.parentElem) {
                    
                    that.render(msg, param.parentElem) ;
                }
                else {
                    that.render(msg);
                }
            }
        })
    }
}


$(document).ready(function() {
    
    
    
    DUBBE.ddo.project.renderAll() ;
    
    /**
     * Adds the onclick function to the createProject link
     */
    
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
                        
                        DUBBE.ddo.ajax.create({
                            data: p,
                            model: "project"
                        }) ;
                    },
                    submitText: "Spara"
                }) 
            
        }) ;
        
        
    }) ;
    

});
