raptor.define(
    "components.main.MainTopNav.MainTopNavTag",
    function(raptor) {
        var TopNavTag = function() {
            
        };
        
        TopNavTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/main/MainTopNav', {
                    activeItem: input.activeItem
                }, context);
            }
        };
        
        return TopNavTag;
    });