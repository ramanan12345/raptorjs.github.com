raptor.define(
    "components.templates.Errors.ErrorsTag",
    function(raptor) {
        var ErrorsTag = function() {
            
        };
        
        ErrorsTag.prototype = {
            process: function(input, context) {
                var widgetConfig = {};
                
                raptor.require('templating').render('components/templates/Errors', {
                    widgetConfig: widgetConfig,
                    widgetContext: input.widgetContext
                }, context);
            }
        };
        
        return ErrorsTag;
    });