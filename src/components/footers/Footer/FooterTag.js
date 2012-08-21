raptor.define(
    "components.footers.Footer.FooterTag",
    function(raptor) {
        var FooterDefaultTag = function() {
            
        };
        
        FooterDefaultTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/footers/Footer', {
                    type: input.type 
                }, context);
            }
        };
        
        return FooterDefaultTag;
    });