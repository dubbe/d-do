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
 * @namespace 
 * 
 * DUBBE.utils is a collection of functions; 
 * create a popup, a button, center, and fill screen 
 * 
 */
DUBBE.namespace("DUBBE.utils") ;

/**
 * A generic popup function
 * @param {string} [param.header] The headline for the pop-up
 * @param {string} [param.text] The info-text
 * @param {object} [param.obj] An object to show in the pop-up
 * @param {array} [param.events] Functions to be executed when button is pushed
 * @param {function} [param.events.fn] The function to be executed
 * @param {string} param.events.text The text of the button
 * 
 * @return {object} Returns the pop-up object (not the background)
 * 
 */
DUBBE.utils.popup = function(param){


    // declares the variables we are going to use
    
    var bg = $("<div>").addClass("popUpBg").click(function(e) {
        if (e.target == this) {
            
            $(this).remove() ;
        }
    }) ;
    
    // we have to make sure that the bg fills the creen
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
 * @param {String} param.text The text on the button
 * @param {function} param.fn The function to be executed on keypress
 * @param {Object} [param.replace] Object to replace with button
 * @param {Object} [param.parent] Object to append button to
 * @param {String} [param.align] Alignment of the button (Left, Right or Center)
 * 
 * @returns returns a div with the button
 * 
 * Todo: add image? 
 */
DUBBE.utils.createButton = function(param){

    var className = "buttonContainerLeft" ;
       
    if (param.align) {
        switch (param.align) {
            case "center":
                className = "buttonContainer";
                break;
            case "right":
                className = "buttonContainerRight";
                break;
            default:
                className = "buttonContainerLeft";
                break;
        }
    }


    var btn = $("<div>").addClass(className).append(
        $("<a>").attr("href", "#").addClass("buttonLink").click(function(e) {
            e.preventDefault() ;
            param.fn();
        }).append( 
            $("<div>").addClass("button").text(param.text)    
        )
    );
    
    if(param.parent) {
        btn.appendTo(param.parent) ;
    }
    else if (param.replace) {
        param.replace.replaceWith(btn) ;
    } else {
        return btn ;
    }
        
        

}
/**
 * Centers the object relative to the window
 * @param {Object} obj The object to center
 * 
 * @returns the object
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
    
    return obj ;
     
} ;
/**
 * Object fills the body and not only the screen, resize on onresize
 * @param {Object} obj The object that is going to fill the screen
 * 
 * @returns the object
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
    
    return obj;
} ;

/**
 * @namespace
 * 
 * I will gather functions to handle forms under DUBBE.form
 * 
 */
DUBBE.namespace("DUBBE.form") ;

/**
 * Creates a form and submits it, relies on DUBBE.utils.createButton
 * @param {Object} param The object with the settings in
 * @param {String} [param.name] The name of the form, defaults to "form"
 * @param {String} [param.submitText] The text on the submit-button, defaults to "submit"
 * @param {Object} [param.fields] The fields of the form
 * @param {String} param.fields.name The name of the field
 * @param {String} [param.fields.type] The type of formfield, defaults to "input"
 * @param {String} [param.fields.value] The pre-set value of the field, defaults to ""
 * @param {String} [param.fields.label] The label or the formfield, defaults to param.fields.name
 * @param {String} [param.fields.options]
 * @param {String} [param.fields.selected]
 * 
 * TODO: validation
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
                case "select":
                    input = $("<select>").appendTo(form);
                    for (var index in param.fields[i].options) {
                        var option = $("<option>").attr({'text': param.fields[i].options[index], 'value': index}).appendTo(input) ;
                        
                        if(param.fields[i].selected == param.fields[i].options[index]) {
                            option.attr("selected", "selected") ;
                        }
                        
                    } ;
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
    
    // Need to add a clear so the button is correctly aligned
    $("<div>").addClass("clr").appendTo(form) ;
    
    if (param.submit) {
        
        DUBBE.utils.createButton({
            text: submitText,
            align: "center",
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