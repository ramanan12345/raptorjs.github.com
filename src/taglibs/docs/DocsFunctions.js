raptor.define(
    "taglibs.docs.DocsFunctions",
    function(raptor) {
        var strings = raptor.require('strings');
        
        return {
            url: function(url) {
                var basePath = this.basePath;
                if (!basePath) {
                    throw raptor.createError(new Error('Base path not set. Use the <shared:urls basePath="<base-path>"/> tag to set the base path for all URLs.'));
                }
                var optimizer = raptor.require('optimizer').getFromContext(this);
                var profile = optimizer.getParam('profile');
                if (profile !== 'production') {
                    if (basePath === '.') {
                        if (url === '/') {
                            return "index.html";
                        }
                        else {
                            url = url.substring(1);    
                        }
                        
                    }
                    else {
                        url = basePath + url;
                    }
                    
                    if (strings.endsWith(url, '/')) {
                        return url + 'index.html';
                    }
                    else {
                        return url + '/index.html';
                    }
                }
                else {
                    return url === '/' ? url : url + '/';
                }                
            }    
        }
        
    });
    