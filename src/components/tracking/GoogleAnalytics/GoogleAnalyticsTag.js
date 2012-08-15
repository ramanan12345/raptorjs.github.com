raptor.define(
    "components.tracking.GoogleAnalytics.GoogleAnalyticsTag",
    function(raptor) {
        var TwitterFollowTag = function() {
            
        };
        
        TwitterFollowTag.prototype = {
            process: function(input, context) {
                raptor.require('templating').render('components/tracking/GoogleAnalytics', {}, context);
            }
        };
        
        return TwitterFollowTag;
    });