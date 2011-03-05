var DUBBE = DUBBE || {} ;

/**
 * Setting up a new namespace in DUBBE
 * @param {string} nsString The namespace to set up
 * @returns {object} Returns the created namespace 
 */
DUBBE.namespace = function(nsString){
    var  parts = nsString.split('.'), 
        parent = DUBBE, 
    i;

    if(parts[0] === "DUBBE") {
        parts = parts.slice(1) ;
    }

    for (i = 0, length = parts.length; i < length; i+= 1) {
        if(typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {} ;
        }
    parent = parent[parts[i]] ;
    }

    return parent;
} ;

DUBBE.namespace("DUBBE.utils") ;

DUBBE.utils.popup = function(param){

}

DUBBE.utils.createButton = function(param){

    return $("<div>").attr("class", "button").append(
        $("<a>").attr("href", "#").text(param.text).click(function(e) {
            e.preventDefault() ;
            param.fn();
        })
    ) ;

}

DUBBE.namespace("DUBBE.form") ;

DUBBE.form.create = function(param){
    
    var form ;
    var inputs = {}  ;
    var name = (param.name) ? param.name : "form" ;
    var parent = (param.parent) ? $("#"+param.parent) : $("body") ;
    var submitText = (param.submitText) ? param.submitText : "submit" ;
    
    form = $("<form>").appendTo(parent).attr("name", name) ;
    
    if(param.fields) {
        for (i = 0; i < param.fields.length; i += 1) {
            
            var type = (param.fields[i].type) ? param.fields[i].type : "input" ;
            var value = (param.fields[i].value) ? param.fields[i].value : "" ;
            var label = (param.fields[i].label) ? param.fields[i].label+": " : param.fields[i].name+": " ;
            
            $("<label>").attr({
                for: param.fields[i].name
            }).appendTo(form).text(label) ;
            
            if (type === "text") {
                input = $("<textarea>").attr({
                    name: param.fields[i].name,
                    value: value
                }).appendTo(form);
            } else {
                input = $("<input>").attr({
                    type: type,
                    name: param.fields[i].name,
                    value: value
                }).appendTo(form);
            }
            
            inputs[param.fields[i].name] = input ;
            
        }
    }
    
    if (param.submit) {
        
        DUBBE.utils.createButton({
            text: submitText,
            fn: function(){
                
                param.submit(inputs) ;
                $(form)[0].reset() ;
            }                
            
        }).appendTo(form) ;

    }

}

DUBBE.namespace("DUBBE.ajax") ;

DUBBE.ajax.get = function(param) {
    
}
DUBBE.ajax.set = function(param) {
    
}

DUBBE.namespace("DUBBE.ui") ;


DUBBE.ui.drag = function(param){

}

DUBBE.ui.drop = function(param){

}

DUBBE.ui.sort = function(param){
    // fix jquery-ui connection
}