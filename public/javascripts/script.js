DUBBE.namespace("DUBBE.ddo") ;

/**
 * Functions for tasks specifically
 * @param {Object} task
 * @param {Object} parent
 */

DUBBE.ddo.task = {
 
    
    render: function(task, parent) {
        $("<div>").addClass("task").html("<p><b>"+task.title+"</b><br />"+task.info+"</p>").appendTo(parent) ;
    },
    renderAll: function(param) {

        var that = this ;
        
        $.ajax({
            type: "GET",
            url: "/api/task/"+param.parent,
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
        console.log(project) ;
        var projectDiv = $("<div>").addClass("project").html("<p><b>"+project.title+"</b><br />"+project.info+"</p>").appendTo("body").append(
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
                                        parentElem: projectDiv
                                    }) ;
                                },    
                                submitText: "Spara"
                            }) 
                    }) ;
            }).text("Skapa task").attr("href", "#") 
        ) ;
        
        /** 
         * Renders all tasks to this project
         */
        DUBBE.ddo.task.renderAll({
            parentElem: projectDiv,
            parent: project._id
        }) ;
        
    },
    /**
     * Loops through all projects and renders them using render
     */
    renderAll: function(){
        
        var that = this ;
        
        console.log("testar") ;
        
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
     * Function to take the ouptu from the form and send it to the api
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
