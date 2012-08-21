raptor.define(
    "components.footers.FooterSingleLine.FooterSingleLineTag",
    function(raptor) {
        var FooterDefaultTag = function() {
            
        };
        
        FooterDefaultTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/footers/FooterSingleLine', {
                    
                }, context);
            }
        };
        
        return FooterDefaultTag;
    });