raptor.define(
    "components.icons.Icon.IconTag",
    function(raptor) {
        var strings = raptor.require("strings");
        
        var IconTag = function() {
            
        };
        
        IconTag.prototype = {
            process: function(input, context) {
                
                if (!strings.startsWith(input.name, "icon-")) {
                    input.name = "icon-" + input.name;
                }
                var rootAttrs = {};
                
                var classParts = [input.name];
                if (input.size) {
                    if (strings.endsWith(input.size, "px")) {
                        rootAttrs.style = "font-size: " + input.size + ";";
                    }
                    else {
                        classParts.push("icon-" + input.size);    
                    }
                    
                }
                
                raptor.require('templating').render('components/icons/Icon', {
                    className: classParts.join(" "),
                    rootAttrs: rootAttrs
                }, context);
            }
        };
        
        return IconTag;
    });