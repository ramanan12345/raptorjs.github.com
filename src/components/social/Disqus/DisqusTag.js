raptor.define(
    "components.social.Disqus.DisqusTag",
    function(raptor) {
        var DisqusTag = function() {
            
        };
        
        DisqusTag.prototype = {
            process: function(input, context) {
                var widgetConfig = {
                    shortName: input['short-name']
                };
                
                if (input.id) {
                    widgetConfig.id = input.id;
                }
                
                if (input.title) {
                    widgetConfig.title = input.title;
                }
                
                raptor.require('templating').render('components/social/Disqus', {
                    widgetConfig: widgetConfig
                }, context);
            }
        };
        
        return DisqusTag;
    });