raptor.define(
    "components.icons.Icon.IconTag",
    function(raptor) {
        var IconTag = function() {
            
        };
        
        IconTag.prototype = {
            process: function(input, context) {
                
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