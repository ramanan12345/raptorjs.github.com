raptor.define(
    "components.social.TwitterFollow.TwitterFollowTag",
    function(raptor) {
        var TwitterFollowTag = function() {
            
        };
        
        TwitterFollowTag.prototype = {
            process: function(input, context) {
                var rootAttrs = {};
                if (input.size === 'large') {
                    rootAttrs['data-size'] = 'large';
                }
                
                raptor.require('templating').render('components/social/TwitterFollow', {
                    username: input.username, 
                    showCount: input.showCount !== false,
                    rootAttrs: rootAttrs
                }, context);
            }
        };
        
        return TwitterFollowTag;
    });