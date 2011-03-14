/**
 * DUBBE.do will hold all functions specific to the ddo-application. Anything more general will be found in dubbe.js
 * 
 * @namespace
 */
DUBBE.namespace("DUBBE.ddo") ;

/**
 * An array with all the projects (and the projects have an array in them with all the tasks)
 */

DUBBE.ddo.projectsArray = [] ;
DUBBE.ddo.usersArray = [] ;
DUBBE.ddo.currentUser ;


/**
 * DUBBE.ddo.user will hold things to do with the user
 */

DUBBE.ddo.users = {
    /**
     * Gets all users from db and adds them to a user-object
     */
    getAll: function() {
        
        $.ajax({
            type: "GET",
            url: "/api/user",
            async: false,
            success: function(user) {
               for (var i in user) {
                   DUBBE.ddo.usersArray.push(new DUBBE.ddo.user(user[i]));
               }           
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });
    },
     /**
     * Gets the currently logged in user, so we now who he is!
     */
    getCurrent: function() {
         $.ajax({
            type: "GET",
            url: "/api/user/current",
            async: false,
            success: function(user) {
                DUBBE.ddo.currentUser = user ;
            },
            error:function (xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }  
        });
    }
}

/**
 * Functions for tasks specifically
 */

DUBBE.ddo.tasks = {
    
    /**
     * When a task is droped on a ul (either one of the user, unassigned or done) this function updates the db with correct ownership
     * @param {Object} param the object that includes parameters
     * @param {string} param.userId the user id
     * @param {string} param.taskId the id of the task
     * 
     */

    assign: function(param) {
        
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
    
    /**
     * Gets all projects from the db and add's them to an object.
     */
    
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
        
        DUBBE.ddo.objects.tasksStart.empty() ;
        DUBBE.ddo.objects.tasksEnd.empty() ;
        DUBBE.ddo.objects.currentUser.empty() ;
        DUBBE.ddo.objects.otherMembers.empty() ;
        
        /*
         * Renders the user-ul's where each user store there tasks
         */
        for (i in project.users) {
            
            if (project.users[i].getId() == DUBBE.ddo.currentUser._id) {
                DUBBE.ddo.objects.currentUser.append(
                    $("<h2>").text("Mina tasks")
                ).append(
                    $("<ul>").addClass("sortable").attr("id", project.users[i].getId())) ;
            }
            else {
                DUBBE.ddo.objects.otherMembers.append(
                    $("<div>").append(
                        $("<h2>").text(project.users[i].getObject().name)
                    ).append(
                        $("<ul>").addClass("sortable").attr("id", project.users[i].getId())
                    )
                )
            }
        }
        
        /*
         * Renders containers for done and unassigned tasks
         */
        
        $("<h2>").text("Otilldelade").appendTo(DUBBE.ddo.objects.tasksStart) ;
        DUBBE.ddo.objects.tasksUnassigned = $("<ul>").attr("id", "unassigned").appendTo(DUBBE.ddo.objects.tasksStart).addClass("sortable") ;
        
        $("<h2>").text("Färdiga").appendTo(DUBBE.ddo.objects.tasksEnd) ;
        DUBBE.ddo.objects.tasksDone = $("<ul>").attr("id", "done").appendTo(DUBBE.ddo.objects.tasksEnd).addClass("sortable") ;
        
        $("<h2>").text("Ta bort").appendTo(DUBBE.ddo.objects.tasksEnd) ;
        DUBBE.ddo.objects.tasksDelete = $("<ul>").attr("id", "delete").appendTo(DUBBE.ddo.objects.tasksEnd).addClass("sortable") ;
        
        // re-render the menuBar so we don't have a lot of unused buttons
        DUBBE.ddo.menuBar.render() ;
        
        // Add create a task to the menuBar
        DUBBE.utils.createButton({
            text: "Skapa task",
            parent: DUBBE.ddo.objects.menu,
            fn: function() {
                DUBBE.utils.popup({
                    header: "Ny task",
                    obj: 
                        DUBBE.form.create({
                            name: "form",
                            fields: [{
                                name: "title",
                                type: "text",
                                label: "Namn"   
                            }, {
                                name: "info",
                                type: "textarea",
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
        
        userList = {} ;
        
        $(DUBBE.ddo.usersArray).each(function(i) {
            userList[DUBBE.ddo.usersArray[i].getId()] = DUBBE.ddo.usersArray[i].getObject().name ;
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
            placeholder: "placeHolder",
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
        DUBBE.ddo.objects.menu.empty() ;
        
        DUBBE.utils.createButton({
            text: "Skapa projekt",
            parent: DUBBE.ddo.objects.menu,
            fn: function(){
                DUBBE.utils.popup({
                    header: "Nytt projekt",
                    obj: DUBBE.form.create({
                        name: "form",
                        fields: [{
                            name: "title",
                            type: "text",
                            label: "Namn"
                        }, {
                            name: "info",
                            type: "textarea",
                            label: "Information"
                        }],
                        submit: function(p){
                        
                            var project = DUBBE.ddo.ajax.create({
                                data: p,
                                model: "project"
                            });
                            
                            // project.renderButton() ;
                            
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
     * Function to take the output from the form and send it to the api
     */
    create: function(param) {
        
        var object = param.data ;
        var model = (param.model) ? param.model : "" ;
        var ret ;
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
            async: false,
            success: function(msg) {
                if (msg.type == "project") {
                    var arrId = DUBBE.ddo.projectsArray.push(new DUBBE.ddo.project(msg)) ;
                    ret = DUBBE.ddo.projectsArray[arrId-1] ;
                    
                }
                else 
                if (msg.type == "task") {
                    param.parentElem.addTask(msg) ;
        
               }
            }
        })
        
        return ret ;
    },
    update: function(param) {
        
        var object = param.data ;
        var model = (param.model) ? param.model : "" ;
        
        var data = "" ;
        
        var resp ;
        
        $.each(object, function(i, val) {
            data += i + "=" + $(val).val() + "&" ; 
        }) ;
        
        // Remove the last &
        data = data.substring(0, data.length-1) ;
        
        $.ajax({
            type: "PUT",
            url: "/api/task/"+param.id,
            data: data,
            async: false,
            success: function(msg) {
               resp = msg ;
            },
            error: function(msg) {
                console.log(msg)
            }
        })
        
        return resp ;
    }
}


$(document).ready(function() {
    /**
     * All the objects we are working with
     */
    DUBBE.ddo.objects ={
        taskContainer: $("#tasks"),
        currentUser: $("#currentUser"),
        otherMembers: $("#otherMembers"),
        tasksStart: $("#tasksStart"),
        tasksEnd: $("#tasksEnd"),
        menu: $("#menu")
    }
    
    
    
   
   DUBBE.ddo.projects.getAll() ;
   DUBBE.ddo.users.getAll() ;
   DUBBE.ddo.users.getCurrent() ;
   DUBBE.ddo.menuBar.render() ;
   
   console.log(DUBBE.ddo.currentUser) ;
   
   

});
