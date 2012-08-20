raptor.define(
    "components.docs.Section.SectionTag",
    function(raptor) {
        var SectionTag = function() {
            
        };
        
        SectionTag.prototype = {
            process: function(input, context) {
                
                context.docsBeginSection(function(section) {
                    section.heading = input.navHeading || input.heading;
                    section.anchorName = input.anchorName;
                    
                    raptor.require('templating').render('components/docs/Section', {
                        heading: input.heading,
                        level: section.level,
                        anchorName: section.getAnchorName(),
                        tag: input
                    }, context);    
                })
                
            }
        };
        
        return SectionTag;
    });