raptor.define(
    "components.notifications.Message.MessageTag",
    function(raptor) {
        var MessageTag = function() {
            
        };
        
        MessageTag.prototype = {
            process: function(input, context) {
                raptor.require('templating').render('components/notifications/Message', {
                    tag: input, 
                    type: input.type,
                    message: input.message
                }, context);
            }
        };
        
        return MessageTag;
    });