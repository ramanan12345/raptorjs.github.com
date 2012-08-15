raptor.define(
    "components.nav.TopNavDefault.TopNavDefaultTag",
    function(raptor) {
        var TopNavTag = function() {
            
        };
        
        TopNavTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/nav/TopNavDefault', {
                    activeItem: input.activeItem
                }, context);
            }
        };
        
        return TopNavTag;
    });