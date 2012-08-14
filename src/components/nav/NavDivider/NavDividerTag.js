raptor.define(
    "components.nav.NavDivider.NavDividerTag",
    function(raptor) {
        var NavDividerTag = function() {
            
        };
        
        NavDividerTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/nav/NavDivider', {
                        navItem: input
                    }, context);
                
            }
        };
        
        return NavDividerTag;
    });