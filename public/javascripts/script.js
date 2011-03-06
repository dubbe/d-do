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
        $("<div>").html("<b>"+task.title+"</b><br />"+task.info).appendTo("body") ;
    },
    renderAll: function() {
        
    },
    update: function() {
        
    }
    
    
}

DUBBE.ddo.category = {
    // some kind of crud
}


$(document).ready(function() {

    DUBBE.form.create({
        name: "testar",
        parent: "testar",
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
        DUBBE.ddo.task.create(p) ;
        }
    }) ;

});
