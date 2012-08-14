raptor.define(
    "components.config.Urls.UrlsTag",
    function(raptor) {
        var UrlsTag = function() {
            
        };
        
        UrlsTag.prototype = {
            process: function(input, context) {
                context.basePath = input.basePath;
            }
        };
        
        return UrlsTag;
    });