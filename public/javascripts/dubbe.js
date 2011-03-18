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
    
    if ($(".popUp").length > 0) {
        $(bg).remove() ;
        return false ;
    }
    
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
    
    $(window).bind("keydown", function(e) {
        if(e.which == 27) {
            $(bg).remove() ;
        }
    })
    
    // add the popup to the document
    $("body").append(bg) ;
   
    // Give first element focus, if form
    if($("form").length != 0) {
        $("form ul li input, textarea, select")[0].focus() ;
    }

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
            $("<div>").addClass("dubbeButton").text(param.text)    
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

DUBBE.utils.dropDown = function(param) {
    var header = param.obj.children("li") ;
    var projectBarLi = $("ul#projectBar > li")
    
    param.obj.addClass("dropDown") ;
    
    var i = null ;
    

    // Lets bind some events to the menu
    
    header.children("ul").find("a").bind({
        "focus": function(){
            $(".focus").removeClass("focus") ;
            $(this).parent().addClass("focus");
        },
        "blur": function(){
            $(this).parent().removeClass("focus");
        }
    })
    projectBarLi.hover(function() {
        $(".focus").removeClass("focus") ;
        $(this).addClass("focus") ;
    },
    function() {
        $(this).removeClass("focus") ;
    }) 
    
    
    var handler = function(e) {
        
        if(e.which === 38) {
            if (i > 0) {
                i--;
                header.children("ul").find("a")[i].focus();
            }
            
        } else if (e.which === 40) {

            if (i < header.children("ul").find("a").length-1) {
                i++;
                header.children("ul").find("a")[i].focus();
            }
        }
    }

    
    header.addClass("dropDownHidden").click(function(e) {
        i = -1;
        
        // Remove any a-focus
        header.children("ul").find("a").blur() ;
        
        if($(this).attr("class") == "dropDownHidden") {
            $(this).attr("class", "dropDownVisible") ;

            $(window).bind('keydown', handler) ;
            
        } else {
            if($(e.target).attr("class") !== "dropDownVisible" && e.target.nodeName === "LI") {
                
                $(".dropDownVisible p").text($(e.target).children("a").text()) ;
            
            } else if (e.target.nodeName === "A") {
                
                $(".dropDownVisible p").text($(e.target).text()) ;
            
            }
            
            $(this).attr("class", "dropDownHidden") ;
            
            $(window).unbind('keydown', handler);
            
            header.children("ul").width(header.outerWidth()-6);
        }
    }).mouseleave(function() {
        if ($(this).attr("class") == "dropDownVisible") {
            $(this).attr("class", "dropDownHidden");
        }
        
        $(window).unbind('keydown', handler);
    }); 
    
    
    /*
     * Adding a key-shortcut, not so generic, must think about this
     */
    this.keyShortCut({
        keyCode: 52,
        fn: function() {
            header.click() ;
        }
    })

    $("<img>").attr("src", "images/icons/down.png").addClass("icon").insertAfter(header.find("p"))
    
    header.children("ul").width(header.outerWidth()-6);

}

DUBBE.utils.toolTip = function(param) {
    
}

DUBBE.utils.keyShortCut = function(param) {
    
    $(window).keydown(function(e) {
        if(e.ctrlKey && e.altKey && e.which == param.keyCode) {
            e.preventDefault() ;
            param.fn() ;
        }
    })

}

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
 * @param {Object} [param.validate] Functions to validate the form
 * 
 * TODO: validation
 */

DUBBE.form.create = function(param){
    
    var form, ul, li, errorField ;
    var newParam ;
    var that = this ;
    var inputs = {}  ;
    var validation = {} ;
    var name = (param.name) ? param.name : "form" ;
    var submitText = (param.submitText) ? param.submitText : "submit" ;
    
    form = $("<form>").attr("name", name) ;
    ul =$("<ul>").appendTo(form) ;
    
    errorField = $("<li>").appendTo(ul) ;
    
    
    
    if(param.fields) {
        for (i = 0; i < param.fields.length; i += 1) {
            
            li = $("<li>").appendTo(ul) ;
            
            var type = (param.fields[i].type) ? param.fields[i].type : "text" ;
            var value = (param.fields[i].value) ? param.fields[i].value : "" ;
            var label = (param.fields[i].label) ? param.fields[i].label+": " : param.fields[i].name+": " ;
            
            if(type != "hidden") {
                $("<label>").attr({
                    for: param.fields[i].name
                }).appendTo(li).text(label) ;
            }
            
            switch (type) {
                case "textarea":
                    input = $("<textarea>").attr({
                        name: param.fields[i].name,
                        value: value
                    }).appendTo(li);
                    
                    break;
                    
                case "hidden":
                    input = $("<input>").attr({
                        type: type,
                        name: param.fields[i].name,
                        value: value
                    }).appendTo(li);
                    break;
                case "select":
                    input = $("<select>").appendTo(li);
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
                    }).appendTo(li);
                    break;
            } 
            param.fields[i].inputObject = input ;
            
         
            // Validation
            
            if(param.fields[i].validate) {

                newParam = param.fields[i].validate ;
                
                input.blur(function() {
                   newParam.obj = this ;
                   if(!that.validate(newParam)) {
                       $(this).addClass("error") ;
                   } else {
                       $(this).removeClass("error") ;
                   }
                
                })
            }    
        }
    }
   
   
   
    
    // Need to add a clear so the button is correctly aligned
    $("<div>").addClass("clr").appendTo(form) ;
    
    
    
    if (param.submit) {
        var submitFunction = function(){
            var allClear = true;
            
            errorField.empty();
            
            for (i = 0; i < param.fields.length; i += 1) {
                if (param.fields[i].validate) {
                    newParam = param.fields[i].validate;
                    newParam.obj = param.fields[i].inputObject;
                    if (!that.validate(newParam)) {
                        param.fields[i].inputObject.addClass("error");
                        errorField.append($("<img>").attr("src", "images/icons/dialog-error.png")).append($("<p>").html("<b>" + param.fields[i].label + ":</b><br />" + param.fields[i].validate.message).addClass("errorP")).append($("<div>").addClass("clr"));
                        allClear = false;
                    }
                }
                
                inputs[param.fields[i].name] = param.fields[i].inputObject;
                
            }
            
            if (allClear) {
            
                param.submit(inputs);
                
                $(form)[0].reset();
                
                if ($(form).parent().parent().attr("class") == "popUpBg") {
                    $(".popUpBg").remove();
                }
            }
        }
        DUBBE.utils.createButton({
            text: submitText,
            align: "center",
            fn: function(){
                submitFunction();
            }
            
        }).appendTo($("<li>").appendTo(ul));
    }
    
        

        $(form).bind({
            keypress: function(e) {
                
                if(e.which === 13) {
                    e.preventDefault() ;
                    submitFunction() ;
                }
                
            }
      
        }) ; 
        
        
    
                                                                               
    
    if(param.parent) {
        $(form).appendTo(parent) ;
    } else {
        return form ;
    }
    
    
    
    
    
    
      

}

DUBBE.form.validate = function(param) {
    var regex ;
    var string = $(param.obj).val() ;

    // Start with at mandatory check!
    if(param.mandatory === true && string === "") {
        return false ;
    }
    
    // Check if we have a regex
    if(param.regex && !string.match(param.regex)) {
        return false ;
    } else if (param.type){
        
        switch (param.type) {
            case "text":
                regex = /^[\w\n åäö\.\!\?\,]+$/i
                break
        }
        if(!string.match(regex)) {
            console.log(regex) ;
            return false ;
        }
    }
    
    return true ;

}

DUBBE.namespace("DUBBE.ui") ;


DUBBE.ui.drag = function(param){

}

DUBBE.ui.drop = function(param){

}

DUBBE.ui.sort = function(param){
    // fix jquery-ui connection
}