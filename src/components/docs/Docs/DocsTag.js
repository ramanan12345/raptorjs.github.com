raptor.define(
    "components.docs.Docs.DocsTag",
    function(raptor) {
        var strings = raptor.require('strings'),
            arrays = raptor.require('arrays');
        
        var DocsTag = function() {
            
        };
        
        DocsTag.prototype = {
            process: function(input, context) {
                
                var sectionStack = [];
                sectionStack.push({
                    sections: []
                });
                
                context.docsBeginSection = function(heading, callback) {
                    var section = {
                       heading: heading,
                       level: sectionStack.length - 1,
                       sections: [],
                       anchorName: heading.replace(/[^a-zA-Z0-9]+/g, '')
                    };
                    
                    arrays.peek(sectionStack).sections.push(section);
                    sectionStack.push(section);
                    callback(section);
                    arrays.pop(sectionStack);
                }
                
                var sb = strings.createStringBuilder();
                context.swapWriter(
                    sb,
                    function() {
                        input.invokeBody();
                    });
                
                
                raptor.require('templating').render('components/docs/Docs', {
                    heading: input.heading,
                    content: sb.toString(),
                    rootSection: sectionStack[0]
                }, context);
            }
        };
        
        return DocsTag;
    });