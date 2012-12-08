define(
    "components.templates.Errors.ErrorsTag",
    function(raptor) {
        var ErrorsTag = function() {
            
        };
        
        ErrorsTag.prototype = {
            process: function(input, context) {
                var widgetConfig = {};
                
                require('raptor/templating').render('components/templates/Errors', {
                    widgetConfig: widgetConfig,
                    widgetArgs: input.widgetArgs
                }, context);
            }
        };
        
        return ErrorsTag;
    });