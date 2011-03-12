/**
 * DUBBE.do will hold all functions specific to the ddo-application. Anything more general will be found in dubbe.js
 * 
 * @namespace
 */
DUBBE.namespace("DUBBE.ddo") ;

/**
 * DUBBE.ddo.user will hold things to do with the user
 */

DUBBE.ddo.projectsArray = [] ;

DUBBE.ddo.user = {
    /**
     * A getter so you can get the user from the couchDb with help of the userId
     * 
     * @param {Object} userId the userId
     * 
     * @returns a user-object
     */
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
    /**
     * Gets all users from db
     * 
     * @returns all users
     */
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
 */

DUBBE.ddo.tasks = {
    
    /**
     * Receivs all task for a project from the db, loops through them and render them with the help of DUBBE.ddo.task.render
     * 
     * @param {Object} param Object with the settings
     * @param {Object} param.parentElement The element in which the task should be appended to
     * @param {String} param.parent The id for the parent-project.
     * 
     */
    renderAll: function(param) {

        var that = this ;
        
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
    
    /**
     * When a task is droped on a ul (either one of the user, unassigned or done) this function updates the db with correct ownership
     * @param {Object} param the object that includes parameters
     * @param {string} param.userId the user id
     * @param {string} param.taskId the id of the task
     * 
     */

    assign: function(param) {
        
        console.log(param.tasks) ;
        
        $(param.tasks).each(function(i) {
            if(param.tasks[i].getId() == param.taskId) {
                param.tasks[i].assign(param.userId) ;
            }
        })
        


    }
    
    
}

/**
 * Functions for projects specifically
 */

DUBBE.ddo.projects = {
    
    getAll: function() {
        $.ajax({
            type: "GET",
            url: "/api/project",
            async: false,
            success: function(projects) {
                for (var i in projects) {
                    DUBBE.ddo.projectsArray.push(new DUBBE.ddo.project(projects[i])) ;
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        }); 
    },
    /**
     * Renders the projects tasks and users
     * @param {Object} project
     */
    
    render: function(project) {
        
        var users, unassigned, done, i, userList,
            that = this ;
        
        /*
         * We have to empty the two divs that contains tasks
         */
        
        $("#users").empty() ;
        $("#tasks").empty() ;
        
        /*
         * Renders the user-ul's where each user store there tasks
         */
        for (i in project.getObject().teamMember) {
            
            $("#users").append(
                $("<h2>").text(DUBBE.ddo.user.get(project.getObject().teamMember[i]).name)
            ).append(
                $("<ul>").addClass("sortable").attr("id", project.getObject().teamMember[i])
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
                                type: "select",
                                label: "Prioritet",
                                options: {
                                    "1": "1",
                                    "2": "2",
                                    "3": "3",
                                    "4": "4",
                                    "5": "5"
                                }
                            }],
                            submit: function(p) {
                                DUBBE.ddo.ajax.create({
                                    data: p,
                                    model: "task",
                                    parent: project.getId(),
                                    parentElem: project
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
                                    projectId: project.getId()
                                }) ;
                            },    
                            submitText: "Spara"
                        }) 
                })
            } 
        }) ;
        
        /* 
         * And render all tasks
         */
        
        $(project.tasks).each(function(i) {
            project.tasks[i].render() ;
        })
        
        /*
         * Adding jquerys sortable to the ul's in which we have tasks
         * 
         */
        $(".sortable").sortable({
            connectWith: ".sortable",
            receive: function(event, ui) {      
                DUBBE.ddo.tasks.assign({
                    tasks: project.tasks,
                    taskId: $(ui.item).attr("id"),
                    userId: $(this).attr("id")
                }) 
            
            }
        }).disableSelection();
               
        
    },
    
    /**
     * The ajax-function to add a new teamMember to a project
     * 
     * @param {Object} param The object holding the parameters
     * @param {String} param.userId The id of the user to add
     * @param {String} param.projectId The id of the project the user should be added to
     */
    addUser: function(param) {
        
        data = "userId="+param.userId ;
        
        $.ajax({
            type: "PUT",
            url: "/api/addTeamMember/"+param.projectId,
            data: data,
            success: function(msg) {
            }
        }) 
    }
} 

/**
 * menuBar is the div in which we add the menu-button such as "add project", "add task" and so forth
 */

DUBBE.ddo.menuBar = {
    /**
     * init the menuBar by adding the create project button
     */
    render: function() {
        
        // Start by empty the div
        $("#menu").empty() ;
        
        DUBBE.utils.createButton({
            text: "Skapa projekt",
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
            DUBBE.ddo.projectsArray.push(new DUBBE.ddo.project(msg)) ;
        }
        else 
        if (msg.type == "task") {
            console.log(parent) ;
            parent.addTask(msg) ;
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
        
        if(param.model == "task"){
            data += "parent="+param.parentElem.getId()+"&" ;
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
    },
    update: function(param) {
        
        var object = param.data ;
        var model = (param.model) ? param.model : "" ;
        
        var data = "" ;
        
        
        
        $.each(object, function(i, val) {
            data += i + "=" + $(val).val() + "&" ; 
        }) ;
        
        // Remove the last &
        data = data.substring(0, data.length-1) ;
        
        $.ajax({
            type: "PUT",
            url: "/api/task/"+param.id,
            data: data,
            success: function(msg) {
                DUBBE.ddo.task.render(msg) ;
            },
            error: function(msg) {
                console.log(msg)
            }
        })
    }
}


$(document).ready(function() {
    
   
   DUBBE.ddo.projects.getAll() ;
   DUBBE.ddo.menuBar.render() ;

});
