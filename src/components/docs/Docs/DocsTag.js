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
                
                context.docsBeginSection = function(callback) {
                    var section = {
                       level: sectionStack.length - 1,
                       sections: [],
                       getAnchorName: function() {
                           var anchorName = this.anchorName;
                           if (!anchorName) {
                               anchorName = this.heading;
                               anchorName = anchorName.replace(/[\-]/g, '');
                               anchorName = anchorName.replace(/(?:\s|[\-.])+((?:[a-zA-Z])+)/g, function(matches, part) {
                                   return "_" + part;
                               })
                               anchorName = anchorName.replace(/[^a-zA-Z0-9_]+/g, '')
                           }
                           return anchorName;
                       }
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
                    rootSection: sectionStack[0],
                    returnLabel: input['return-label'],
                    returnHref: input['return-href']
                }, context);
            }
        };
        
        return DocsTag;
    });