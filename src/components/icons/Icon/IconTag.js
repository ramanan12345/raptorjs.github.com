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
                var classParts = [input.name];
                if (input.size) {
                    classParts.push("icon-" + input.size);
                }
                
                raptor.require('templating').render('components/icons/Icon', {
                    className: classParts.join(" ")
                }, context);
            }
        };
        
        return IconTag;
    });