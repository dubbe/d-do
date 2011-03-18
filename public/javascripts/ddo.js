/**
 * DUBBE.do will hold all functions specific to the ddo-application. Anything more general will be found in dubbe.js
 *
 * @namespace
 */
DUBBE.namespace("DUBBE.ddo");

/**
 * An array with all the projects (and the projects have an array in them with all the tasks)
 */
DUBBE.ddo.projectsArray = [];

/**
 * An array with all the users
 */
DUBBE.ddo.usersArray = [];

/**
 * The current user
 */
DUBBE.ddo.currentUser;


/**
 * DUBBE.ddo.user will hold things to do with the user
 */
DUBBE.ddo.users = {
    /**
     * Gets all users from db and adds them to a user-object
     */
    getAll: function(){
    
        $.ajax({
            type: "GET",
            url: "/api/user",
            async: false,
            success: function(user){
                for (var i in user) {
                    DUBBE.ddo.usersArray.push(new DUBBE.ddo.user(user[i]));
                }
            }
        });
    },
    /**
     * Gets the currently logged in user, so we now who he is!
     */
    getCurrent: function(){
        $.ajax({
            type: "GET",
            url: "/api/user/current",
            async: false,
            success: function(user){
                DUBBE.ddo.currentUser = user;
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
    assign: function(param){
        
        $(param.tasks).each(function(i){
            if (param.tasks[i].getId() == param.taskId) {
                param.tasks[i].assign(param.userId);
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
    getAll: function(){
        $.ajax({
            type: "GET",
            url: "/api/project",
            async: false,
            success: function(projects){
                for (var i in projects) {
                    DUBBE.ddo.projectsArray.push(new DUBBE.ddo.project(projects[i]));
                }
            }
        });
    },
    /**
     * Renders the projects tasks and users
     * @param {Object} project
     */
    render: function(project){
    
        var users, unassigned, done, i, userList, that = this;
        
        /*
         * We have to empty the two divs that contains tasks
         */
        DUBBE.ddo.objects.tasksStart.empty();
        DUBBE.ddo.objects.doneDiv.empty();
        DUBBE.ddo.objects.deleteDiv.empty();
        DUBBE.ddo.objects.currentUser.empty();
        DUBBE.ddo.objects.otherMembers.empty();
        
        /*
         * Renders the user-ul's where each user store there tasks
         */
        for (i in project.users) {
        
            if (project.users[i].getId() == DUBBE.ddo.currentUser._id) {
                DUBBE.ddo.objects.currentUser.append($("<h2>").text("Mina tasks")).append($("<ul>").addClass("sortable").attr("id", project.users[i].getId()));
            }
            else {
                DUBBE.ddo.objects.otherMembers.append($("<div>").append($("<h2>").text(project.users[i].getObject().name)).append($("<ul>").addClass("sortable").attr("id", project.users[i].getId())))
            }
        }
        
        /*
         * Renders containers for done and unassigned tasks
         */
        $("<h2>").text("Otilldelade").appendTo(DUBBE.ddo.objects.tasksStart);
        DUBBE.ddo.objects.tasksUnassigned = $("<ul>").attr("id", "unassigned").appendTo(DUBBE.ddo.objects.tasksStart).addClass("sortable");
        
        $("<h2>").text("Färdiga").appendTo(DUBBE.ddo.objects.doneDiv);
        DUBBE.ddo.objects.tasksDone = $("<ul>").attr("id", "tasksDone").appendTo(DUBBE.ddo.objects.doneDiv).addClass("sortable");
        
        $("<h2>").text("Ta bort").appendTo(DUBBE.ddo.objects.deleteDiv);
        DUBBE.ddo.objects.tasksDelete = $("<ul>").attr("id", "tasksDelete").appendTo(DUBBE.ddo.objects.deleteDiv).addClass("sortable");
        
        // re-render the menuBar so we don't have a lot of unused buttons
        DUBBE.ddo.menuBar.render();
        
        
        var createTask = function() {
            DUBBE.utils.popup({
                header: "Ny task",
                obj: DUBBE.form.create({
                    name: "form",
                    fields: [{
                        name: "title",
                        type: "text",
                        label: "Namn",
                        validate: {
                            mandatory: true,
                            type: "text",
                            message: "Måste vara ifyllt."
                        }
                    }, {
                        name: "info",
                        type: "textarea",
                        label: "Information",
                        validate: {
                            mandatory: true,
                            type: "text",
                            message: "Måste vara ifyllt."
                        }
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
                    submit: function(p){
                        DUBBE.ddo.ajax.create({
                            data: p,
                            model: "task",
                            parent: project.getId(),
                            parentElem: project
                        });
                    },
                    submitText: "Spara"
                })
            })
        }
        // Add create a task to the menuBar
        DUBBE.utils.createButton({
            text: "Skapa task",
            parent: DUBBE.ddo.objects.menu,
            fn: function(){
                createTask() ;
            }
        });
        
        DUBBE.utils.keyShortCut({
            keyCode: 50,
            fn: function() {
                createTask() ;
            }
        })
        
        // Add user-management to menuBar
        
        userList = {};
        
        $(DUBBE.ddo.usersArray).each(function(i){
            userList[DUBBE.ddo.usersArray[i].getId()] = DUBBE.ddo.usersArray[i].getObject().name;
        });
        
        var addUser = function() {
            DUBBE.utils.popup({
                header: "Lägg till användare",
                obj: DUBBE.form.create({
                    name: "form",
                    fields: [{
                        name: "user",
                        type: "select",
                        label: "Användare",
                        options: userList
                    }],
                    submit: function(p){
                        that.addUser({
                            userId: p.user.val(),
                            project: project
                        });
                    },
                    submitText: "Spara"
                })
            })
        }
        
        
        DUBBE.utils.createButton({
            text: "Lägg till användare",
            parent: $("#menu"),
            fn: function(){
                addUser() ;
            }
        });
        
        DUBBE.utils.keyShortCut({
            keyCode: 51,
            fn: function() {
                addUser() ;
            }
        })
        
        /* 
         * And render all tasks
         */
        $(project.tasks).each(function(i){
            project.tasks[i].render();
        })
        
        /*
         * Adding jquerys sortable to the ul's in which we have tasks
         *
         */
        $(".sortable").sortable({
            connectWith: ".sortable",
            placeholder: "placeHolder",
            receive: function(event, ui){
                DUBBE.ddo.tasks.assign({
                    tasks: project.tasks,
                    taskId: $(ui.item).attr("id"),
                    userId: $(this).attr("id")
                })
                
                if ($(this).attr("id") == "tasksDelete") {
                    $(ui.item).removeClass("tasks") ;
                }
  
               
                
            }
        }).disableSelection();
        
        /*
         * And finally we add keyboard-controll for the tasks
         */
        
        DUBBE.ddo.keyboardControl(project.tasks);
        
    },
    
    /**
     * The ajax-function to add a new teamMember to a project
     *
     * @param {Object} param The object holding the parameters
     * @param {String} param.userId The id of the user to add
     * @param {String} param.projectId The id of the project the user should be added to
     */
    addUser: function(param){
    
        var that = this;
        
        data = "userId=" + param.userId;
        
        $.ajax({
            type: "PUT",
            url: "/api/addTeamMember/" + param.project.getId(),
            data: data,
            success: function(msg){
                param.project.addUser(msg);
                that.render(param.project);
            },
            error: function(msg){
                console.log(msg);
            }
        })
        
    },
    
    /**
     * Generates the button and the pop-up to create a popup
     */
    createForm: function(){
    
    
        DUBBE.utils.popup({
            header: "Nytt projekt",
            obj: DUBBE.form.create({
                name: "form",
                fields: [{
                    name: "title",
                    type: "text",
                    label: "Namn",
                    validate: {
                        mandatory: true,
                        type: "text",
                        message: "Måste vara ifyllt."
                    }
                }, {
                    name: "info",
                    type: "textarea",
                    label: "Information",
                    validate: {
                        mandatory: true,
                        type: "text",
                        message: "Måste vara ifyllt."
                    }
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
}

/**
 * menuBar is the div in which we add the menu-button such as "add project", "add task" and so forth
 */
DUBBE.ddo.menuBar = {
    /**
     * init the menuBar by adding the create project button
     */
    render: function(){
    
        // Start by empty the div
        DUBBE.ddo.objects.menu.empty();
        DUBBE.utils.createButton({
            text: "Skapa projekt",
            parent: DUBBE.ddo.objects.menu,
            fn: function(){
                DUBBE.ddo.projects.createForm();
            }
        });
        
        DUBBE.utils.keyShortCut({
            keyCode: 49,
            fn: function() {
                DUBBE.ddo.projects.createForm();
            }
        })
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
    create: function(param){
    
        var object = param.data;
        var model = (param.model) ? param.model : "";
        var ret;
        var data = "";
        
        $.each(object, function(i, val){
            data += i + "=" + $(val).val() + "&";
        });
        
        if (param.model == "task") {
            data += "parent=" + param.parentElem.getId() + "&";
        }
        
        // Remove the last &
        data = data.substring(0, data.length - 1);
        
        var that = this;
        $.ajax({
            type: "POST",
            url: "/api/" + model,
            data: data,
            async: false,
            success: function(msg){
                if (msg.type == "project") {
                    console.log("sparar projektet");
                    var arrayId = DUBBE.ddo.projectsArray.push(new DUBBE.ddo.project(msg));
                    //DUBBE.ddo.projectsArray[arrayId - 1].renderButton() ;
                
                
                }
                else 
                    if (msg.type == "task") {
                        param.parentElem.addTask(msg);
                        
                    }
            }
        })
        
        return ret;
    },
    update: function(param){
    
        var object = param.data;
        var model = (param.model) ? param.model : "";
        
        var data = "";
        
        var resp;
        
        $.each(object, function(i, val){
            data += i + "=" + $(val).val() + "&";
        });
        
        // Remove the last &
        data = data.substring(0, data.length - 1);
        
        $.ajax({
            type: "PUT",
            url: "/api/task/" + param.id,
            data: data,
            async: false,
            success: function(msg){
                resp = msg;
            }
        })
        
        return resp;
    }
}

DUBBE.ddo.keyboardControl = function(allTasks) {
    var task = null ;
    var link = null ;
    var container, li, i, index;
    
    i = -1 ;
    
    var keyEvents = function(e) {
        li = $(this).parent().parent() ;
        container = null ;
        switch (e.which) {
            case 13:    // Enter
                e.preventDefault() 
                break;
            case 69:    // Edit
                e.preventDefault() ;
                $(this).click() ;
                break ;
            case 84:    // Take task
                e.preventDefault() ;
                container = DUBBE.ddo.objects.currentUser.children("ul") ;
                li.appendTo(container) 
                this.focus() ;
                break;o
            case 68:    // Done task
                e.preventDefault() ;
                container = DUBBE.ddo.objects.doneDiv.children("ul") ;
                li.appendTo(container) ;
                this.focus() ;
                break;   
           case 79:    // Otilldelade
                e.preventDefault() ;
                container = DUBBE.ddo.objects.tasksStart.children("ul") ;
                li.appendTo(container) ;
                this.focus() ;
                break; 
            case 88:    // Ta bort
                e.preventDefault() ;
                container = DUBBE.ddo.objects.deleteDiv.children("ul") ;
                li.appendTo(container) ;
                li.removeClass("task") ;
                break;  
            case 85:    // Lägg till annan användare
                e.preventDefault() ;
                
                index = 0 ;

                if(li.parent().parent().parent()[0] == DUBBE.ddo.objects.otherMembers[0]) {
                    var divs = $(DUBBE.ddo.objects.otherMembers[0]).children("div");
                    var div =$(li).parent().parent()[0]

                    index = divs.index($(div)) +1 ;
                    
                    if(index >= divs.length) {
                        console.log("ja?") ;
                        index = 0 ;
                    }
                    
                }
                container = DUBBE.ddo.objects.otherMembers.children("div:eq("+index+")").children("ul") ;
                li.appendTo(container) ;
                this.focus() ;
                break; 
        }
        
        if (container != null) {
            DUBBE.ddo.tasks.assign({
                tasks: allTasks,
                taskId: $(li).attr("id"),
                userId: container.attr("id")
            })
        }
        
    }
    
    $(window).keydown(function(e) {
        var tasks =  $(".task");
        if (e.which == 78 && e.ctrlKey && e.altKey) {
            if(link != null) {
                link.unbind("keydown", keyEvents) ;
            }
            if (task == null) {
                i = 0 ;
                console.log("null") ;
            } else {
                i = tasks.index(task) + 1 ;
            }


            task = $(".task:eq("+i+")") ;
            link = task.find("a") ;
            
            e.preventDefault() ;
            $(".selectedTask").removeClass("selectedTask");
            task.addClass("selectedTask")
            link.focus().bind("keydown", keyEvents) ;
        }
    })
    
}

$(document).ready(function(){
    /**
     * All the objects we are working with
     */
    DUBBE.ddo.objects = {
        taskContainer: $("#tasks"),
        currentUser: $("#currentUser"),
        otherMembers: $("#otherMembers"),
        tasksStart: $("#tasksStart"),
        tasksEnd: $("#tasksEnd"),
        doneDiv: $("#done"),
        deleteDiv: $("#delete"),
        menu: $("#menu"),
        projectsMenu: $("#projectsMenu li")
    }
    
    
    
    DUBBE.ddo.projects.getAll();
    DUBBE.ddo.users.getAll();
    DUBBE.ddo.users.getCurrent();
    DUBBE.ddo.menuBar.render();
    
    
    if (DUBBE.ddo.projectsArray.length > 0) {
        DUBBE.ddo.projects.render(DUBBE.ddo.projectsArray[0]);
        DUBBE.ddo.objects.projectsMenu.children("p").text(DUBBE.ddo.projectsArray[0].getObject().title) ;
    }
    
    
    DUBBE.utils.dropDown({
        obj: $("#projectsMenu")
    });
    
    
    
});
