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
    },
    
    getAll: function() {
        var that = this ;
        var resp ;
        
        $.ajax({
            type: "GET",
            url: "/api/user",
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
        
        $("<li>").attr("id", task._id).appendTo(parent).html("<h3>"+task.title+"</h3><p>"+task.info+"</p>") ;
    
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
            }
        })
    }
    
    
}

DUBBE.ddo.projectBar = {
    /**
     * Loops through all projects and renders them using render
     */
    render: function(){
        
        var that = this ;

        $.ajax({
            type: "GET",
            url: "/api/project",
            success: function(projects) {
                for (var i in projects) {
                    that.renderButton(projects[i]) ;
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        }); 
        
        DUBBE.ddo.menuBar.render() ;
    },
    /**
     * Renders a div with the project in and adds it to the projectbar
     * @param {Object} project
     */
    renderButton: function(project) {
        var that = this ;
        $("<li>").append(
            $("<a>").addClass("project").text(project.title).appendTo($("#projectBar"))
        ) ;
        
        $("#projectBar").append(
            $("<li>").append(
                $("<a>").text(project.title)
            ).hover(function() {
                $(this).css('cursor','pointer') ;
            }).click(function() {
                DUBBE.ddo.project.render(project)
            })
         );
         
    }
}

/**
 * Functions for projects specifically
 * @param {Object} project
 */

DUBBE.ddo.project = {
    
    /**
     * Renders the projects tasks and users
     * @param {Object} project
     */
    
    render: function(project) {
        
        var users, unassigned, done, i, userList,
            that = this ;
        
        $("#users").empty() ;
        $("#tasks").empty() ;
        
        /*
         * Renders the user-ul's where each user store there tasks
         */
        for (i in project.teamMember) {
            
            $("#users").append(
                $("<h2>").text(DUBBE.ddo.user.get(project.teamMember[i]).name)
            ).append(
                $("<ul>").addClass("sortable").attr("id", project.teamMember[i])
            )
        }
        
        /*
         * Renders containers for done and unassigned tasks
         */
        
        unassigned = $("<ul>").attr("id", "unassigned").appendTo("#tasks").addClass("sortable") ;
        done = $("<ul>").attr("id", "done").appendTo("#tasks").addClass("sortable") ;
        
        
        // re-render the menuBar so we don't have a lot of unused buttons
        DUBBE.ddo.menuBar.render() ;
        
        // Add create a task to the menuBar
        DUBBE.utils.createButton({
            text: "Skapa task",
            parent: $("#menu"),
            fn: function() {
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
                                    parentElem: unassigned
                                }) ;
                            },    
                            submitText: "Spara"
                        }) 
                })
            } 
        }) ;
        
        // Add user-management to menuBar
        
        users = DUBBE.ddo.user.getAll() ;
        userList = {} ;
        
        $(users).each(function(i) {
            userList[users[i]._id] = users[i].name  ;
        });
        
        DUBBE.utils.createButton({
            text: "Lägg till användare",
            parent: $("#menu"),
            fn: function() {
                DUBBE.utils.popup({
                    header: "Lägg till användare",
                    obj: 
                        DUBBE.form.create({
                            name: "form",
                            fields: [{
                                name: "user",
                                type: "select",
                                label: "Användare",
                                options: userList
                            }],
                            submit: function(p) {
                                that.addUser({
                                    userId: p.user.val(),
                                    projectId: project._id
                                }) ;
                            },    
                            submitText: "Spara"
                        }) 
                })
            } 
        }) ;
        
        DUBBE.ddo.task.renderAll({
            parentElem: unassigned,
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
        
    },
    addUser: function(param) {
        
        data = "userId="+param.userId ;
        
        console.log(data) ;
        
        $.ajax({
            type: "PUT",
            url: "/api/addTeamMember/"+param.projectId,
            data: data,
            success: function(msg) {
            }
        }) 
    }
} 

DUBBE.ddo.menuBar = {
    render: function() {
        
        $("#menu").empty() ;
        
        DUBBE.utils.createButton({
            text: "Skapa project",
            parent: $("#menu"),
            fn: function(){
                DUBBE.utils.popup({
                    header: "Nytt projekt",
                    obj: DUBBE.form.create({
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
                        submit: function(p){
                        
                            DUBBE.ddo.ajax.create({
                                data: p,
                                model: "project"
                            });
                        },
                        submitText: "Spara"
                    })
                });
            }
        }) ;
    
    
    
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
            console.log("render button" + msg) ;
            DUBBE.ddo.projectBar.renderButton(msg)
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
    
    
    
    DUBBE.ddo.projectBar.render() ;
    
    /**
     * Adds the onclick function to the createProject link
     */
    

    

    

});
