raptor.define(
    "components.nav.Nav.NavTag",
    function(raptor) {
        var NavTag = function() {
            
        };
        
        NavTag.prototype = {
            process: function(input, context) {
                
                var rootAttrs = {};
                
                var classParts = ["nav"];
                
                if (input.type) {                    
                    classParts.push("nav-" + input.type);
                }
                
                if (input.stacked) {
                    classParts.push("nav-stacked");
                }
                
                rootAttrs["class"] = classParts.join(" ");
                
                var widgetConfig = {};

                var navItems = [];
                
                raptor.require('templating').render('components/nav/Nav', {
                    navItems: navItems,
                    rootAttrs: rootAttrs,
                    widgetContext: input.widgetContext,
                    widgetConfig: widgetConfig,
                    invokeBody: input.invokeBody
                }, context);
            }
        };
        
        return NavTag;
    });