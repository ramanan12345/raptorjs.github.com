define(
    "components.buttons.Button.ButtonTag",
    function(raptor) {
        var ButtonTag = function() {
            
        };
        
        ButtonTag.prototype = {
            process: function(input, context) {
                
                var rootAttrs = {};
                
                var classParts = ["btn"];
                
                
                
                if (input.type) {                    
                    classParts.push("btn-" + input.type);
                }
                
                if (input.size) {                    
                    classParts.push("btn-" + input.size);
                }
                
                
                
                if (input.dymamicAttributes) {
                    var className = input.dymamicAttributes["class"];
                    if (className) {
                        delete input.dymamicAttributes["class"];
                        classParts.push(className);
                    }
                    raptor.extend(rootAttrs, input.dymamicAttributes);
                }
                
                rootAttrs["class"] = classParts.join(" ");
                
                var widgetConfig = {};
                
                if (input.toggle) {
                    widgetConfig.toggle = true;
                }
                
                if (input.toggled) {
                    widgetConfig.toggled = true;
                }

                require('raptor/templating').render('components/buttons/Button', {
                    tag: input, 
                    label: input.label,
                    rootAttrs: rootAttrs,
                    widgetArgs: input.widgetArgs,
                    widgetConfig: widgetConfig,
                    isDropdown: input.dropdown === true,
                    href: input.href
                }, context);
            }
        };
        
        return ButtonTag;
    });