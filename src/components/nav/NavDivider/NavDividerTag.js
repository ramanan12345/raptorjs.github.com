raptor.define(
    "components.nav.NavDivider.NavDividerTag",
    function(raptor) {
        var NavDividerTag = function() {
            
        };
        
        NavDividerTag.prototype = {
            process: function(input, context) {
                var nav = input.nav,
                    className;

                if (nav && nav.type === 'dropdown-menu') {
                    className = "divider"
                }
                else {
                    className = "divider-vertical"
                }
                
                raptor.require('templating').render('components/nav/NavDivider', {
                        navItem: input,
                        className: className
                    }, context);
                
            }
        };
        
        return NavDividerTag;
    });