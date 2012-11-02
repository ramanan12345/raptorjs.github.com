raptor.define(
    "taglibs.docs.DocsFunctions",
    function(raptor) {
        var docsUtil = raptor.require('docs-util');
        
        return {
            
            url: function(url) {
                return docsUtil.url(url);               
            },
            
            imageUrl: function(url) {
                return docsUtil.imageUrl(url); 
            }
            
        };
        
    });
    