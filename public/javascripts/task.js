DUBBE.namespace("DUBBE.ddo.task") ;

DUBBE.ddo.task = function(task) {
    
    this.getObject = function() {
        return task ;
    }
    this.setObject = function(_task) {
        task = _task ;
    }
    
    this.getId = function() {
        return task._id ;
    }
}

    /**
     * 
     * A function to render a task
     * 
     * @param {Object} [parent] The parent is the div whom the task should append to (it will first try to append to task.userId
     * 
     * @returns The li with the task information
     */

DUBBE.ddo.task.prototype.render = function(parent) {
    
    var that = this ;
    
    parent = (this.getObject().userId) ? $("#"+this.getObject().userId) : DUBBE.ddo.objects.tasksUnassigned ;

        
        var taskLi = $("<li>").append(
                $("<div>").addClass("prio").text(this.getObject().prio)
            ).append(
                $("<div>").addClass("icons").append(
                    $("<img>").attr("src", "images/icons/edit.png").addClass("icon").click(function() {
                        DUBBE.utils.popup({
                            header: "Redigera task",
                            obj: 
                                DUBBE.form.create({
                                    name: "form",
                                    fields: [{
                                        name: "title",
                                        type: "text",
                                        label: "Namn",
                                        value: that.getObject().title,
                                        validate: {
                                            mandatory: true,
                                            type: "text",
                                            message: "Måste vara ifyllt."
                                        }   
                                    }, {
                                        name: "info",
                                        type: "textarea",
                                        label: "Information",
                                        value: that.getObject().info,
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
                                        },
                                        selected: that.getObject().prio
                                    }],
                                    submit: function(p) {
                                        
                                        that.setObject(DUBBE.ddo.ajax.update({
                                            data: p,
                                            id: that.getId()
                                        })) ;
                                        
                                        that.render() ;
                                        
                                    },    
                                    submitText: "Spara"
                                }) 
                        })
                    })
                ).append(
                    $("<img>").attr("src", "images/icons/comment.png").addClass("icon")
                )
            ).append(
            $("<h3>").text(this.getObject().title).attr("href", "#")
        ).append(
            $("<p>").text(this.getObject().info)
        ).attr("id", this.getId()).hover(function() {
                $(this).css('cursor','pointer');
            }, function() {
                $(this).css('cursor','auto');   
            }
        ) ;
        
        if ($("#"+this.getId()).length == 0) {
            taskLi.appendTo(parent) ;
        } else {
            $("#"+this.getId()).replaceWith(taskLi) ;
        }
        
        
}
/**
 * Updating the user with new information both in db and on client
 * @param {Object} userId
 */
DUBBE.ddo.task.prototype.assign = function(userId){

     var data = "userId=" + userId,
        that = this ;
     
     $.ajax({
         type: "PUT",
         url: "/api/task/" + this.getId(),
         data: data,
         success: function(msg){
             that.setObject(msg) ;
         }
     }) ;

}
