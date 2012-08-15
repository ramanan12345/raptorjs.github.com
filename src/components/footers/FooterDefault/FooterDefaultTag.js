raptor.define(
    "components.footers.FooterDefault.FooterDefaultTag",
    function(raptor) {
        var FooterDefaultTag = function() {
            
        };
        
        FooterDefaultTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/footers/FooterDefault', {
                    
                }, context);
            }
        };
        
        return FooterDefaultTag;
    });