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

}

DUBBE.namespace("DUBBE.form") ;

DUBBE.form.create = function(param){

}

DUBBE.ajax("DUBBE.ajax") ;

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