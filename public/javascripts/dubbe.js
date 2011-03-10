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
/**
 * Namespace
 */
DUBBE.namespace("DUBBE.utils") ;

/**
 * Generic pop-up function.
 * @param {Object} param
 */
DUBBE.utils.popup = function(param){


    // declares the variables we are going to use
    
    var bg = $("<div>").addClass("popUpBg").click(function(e) {
        if (e.target == this) {
            
            $(this).remove() ;
        }
    }) ;
    
    DUBBE.utils.fillScreen(bg) ;
    
    var popup = $("<div>").addClass("popUp").appendTo(bg) ;
    
    if(param.header !== undefined) {
        $(popup).append( $("<h2>").text(param.header)) ;
    }
    
    if(param.text !== undefined) {
        $(popup).append( $("<p>").text(param.text)) ;
    }
    
    if(param.obj !== undefined) {
        $(popup).append( $(param.obj)) ;
    }

    // if we sent any events
    if (param.events) {
        for (i = 0; i < param.events.length; i += 1) {
    
            // if the event has any function specified
            if (param.events[i].fn) {
                fn = [
                    function(){
                        $(bg).remove() ;
                    },
                    param.events[i].fn 
                    ];
            } else {
                fn = [
                    function(){
                        $(bg).remove() ;
                    }
                ];
            }
            
            // create the button and add it to the div
            $(div).append(DUBBE.utils.createButton({
                "text": param.events[i].text, 
                "fn": fn
            }));
        }
    }
    
    // add the popup to the document
    $("body").append(bg) ;

    // and last we have to center the div    
    DUBBE.utils.center(popup) ;
    
    return popup ;

}
/**
 * Generic create button-function
 * @param {Object} param
 * 
 * Todo: add image? 
 */
DUBBE.utils.createButton = function(param){

    return $("<a>").attr("href", "#").click(function(e) {
            e.preventDefault() ;
            param.fn();
        }).append( 
            $("<div>").attr("class", "button").text(param.text)    
        );

}
/**
 * Centers the object relative to the window
 * @param {Object} obj
 * 
 * Todo: center relative to parent?
 */
DUBBE.utils.center = function center(obj) {

    $(obj).css({
        top: ($(window).height() / 2) - ($(obj).outerHeight() / 2) + $(window).scrollTop() + "px",
        left: "50%",
        marginLeft: "-" + parseInt($(obj).outerWidth() / 2, 10) + "px"
    });
    
    document.body.center = function() {
        fillScreen(obj) ;
    }
    
     
} ;
/**
 * Object fills the body and not only the screen, resize on onresize
 * @param {Object} obj
 */
DUBBE.utils.fillScreen = function fillScreen(obj) {

    $(obj).css({
        top: "0px",
        left: "0px",
        height: $(document).height() +"px",
        width: $(document).width()+"px"
    }) ;
     
    document.body.onresize = function() {
        fillScreen(obj) ;
    }
} ;

DUBBE.namespace("DUBBE.form") ;

/**
 * Creates a form and submits it, relies on DUBBE.utils.createButton
 * @param {Object} param
 * 
 * TODO: validation
 * TODO: select
 */

DUBBE.form.create = function(param){
    
    var form ;
    var inputs = {}  ;
    var name = (param.name) ? param.name : "form" ;
    var submitText = (param.submitText) ? param.submitText : "submit" ;
    
    form = $("<form>").attr("name", name) ;
    
    if(param.fields) {
        for (i = 0; i < param.fields.length; i += 1) {
            
            var type = (param.fields[i].type) ? param.fields[i].type : "input" ;
            var value = (param.fields[i].value) ? param.fields[i].value : "" ;
            var label = (param.fields[i].label) ? param.fields[i].label+": " : param.fields[i].name+": " ;
            
            if(type != "hidden") {
                $("<label>").attr({
                    for: param.fields[i].name
                }).appendTo(form).text(label) ;
            }
            
            switch (type) {
                case "text":
                    input = $("<textarea>").attr({
                        name: param.fields[i].name,
                        value: value
                    }).appendTo(form);
                    break;
                    
                case "hidden":
                    input = $("<input>").attr({
                        type: type,
                        name: param.fields[i].name,
                        value: value
                    }).appendTo(form);
                    break;
                    
                default:
                    input = $("<input>").attr({
                        type: type,
                        name: param.fields[i].name,
                        value: value
                    }).appendTo(form);
                    break;
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
                
                if($(form).parent().parent().attr("class") == "popUpBg") {
                    $(".popUpBg").remove() ;
                }
            }                
            
        }).appendTo(form) ;

    }
    
    if(param.parent) {
        $(form).appendTo(parent) ;
    } else {
        return form ;
    }

}

DUBBE.namespace("DUBBE.ui") ;


DUBBE.ui.drag = function(param){

}

DUBBE.ui.drop = function(param){

}

DUBBE.ui.sort = function(param){
    // fix jquery-ui connection
}