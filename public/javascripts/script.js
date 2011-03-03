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
        console.log("create")
        $.ajax({
            type: "POST",
            url: "/api/task",
            data: "title="+$(task.name).val()+"&body="+$(task.info).val(),
            success: function(msg) {
                console.log(msg) ;
            }
        })
    },
    render: function(task) {
        console.log("render") ;
    },
    renderAll: function() {
        
    },
    update: function() {
        
    }
    
    
}

DUBBE.ddo.category = {
    // some kind of crud
}
