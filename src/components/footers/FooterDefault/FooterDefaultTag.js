define(
    "components.footers.FooterDefault.FooterDefaultTag",
    function(raptor) {
        var FooterDefaultTag = function() {
            
        };
        
        FooterDefaultTag.prototype = {
            process: function(input, context) {
                
                require('raptor/templating').render('components/footers/FooterDefault', {
                    
                }, context);
            }
        };
        
        return FooterDefaultTag;
    });