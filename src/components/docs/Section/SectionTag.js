raptor.define(
    "components.docs.Section.SectionTag",
    function(raptor) {
        var SectionTag = function() {
            
        };
        
        SectionTag.prototype = {
            process: function(input, context) {
                
                context.docsBeginSection(input.heading, function(section) {
                    raptor.require('templating').render('components/docs/Section', {
                        heading: input.heading,
                        level: section.level,
                        anchorName: section.anchorName,
                        tag: input
                    }, context);    
                })
                
            }
        };
        
        return SectionTag;
    });