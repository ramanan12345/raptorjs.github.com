raptor.define(
    "components.social.GooglePlusOne.GooglePlusOneTag",
    function(raptor) {
        var GooglePlusOneTag = function() {
            
        };
        
        GooglePlusOneTag.prototype = {
            process: function(input, context) {
                raptor.require('templating').render('components/social/GooglePlusOne', {
                    width: input.width || 300
                }, context);
            }
        };
        
        return GooglePlusOneTag;
    });