raptor.define(
    "components.docs.FeaturePortalSection.FeaturePortalSectionTag",
    function(raptor) {
        var FeaturePortalSectionTag = function() {
            
        };
        
        FeaturePortalSectionTag.prototype = {
            process: function(input, context) {
                
                raptor.require('templating').render('components/docs/FeaturePortalSection', {
                    title: input.title,
                    url: input.url,
                    size: input.size,
                    body: context.captureString(function() {
                        input.invokeBody();
                    })
                }, context);
                
            }
        };
        
        return FeaturePortalSectionTag;
    });