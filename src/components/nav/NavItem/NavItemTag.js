raptor.define(
    "components.nav.NavItem.NavItemTag",
    function(raptor) {
        var NavItemTag = function() {
            
        };
        
        NavItemTag.prototype = {
            process: function(input, context) {
                var liClassParts = [];
                
                if (input.active) {
                    activeFound = true;
                    liClassParts.push("active");
                }
                
                var isDropdownMenu = input.type === 'dropdown-menu';
                
                if (isDropdownMenu) {
                    liClassParts.push("dropdown");
                }

                input.attrs = {};
                
                if (liClassParts.length) {
                    input.attrs["class"] = liClassParts.join(" ");
                }
                
                if (input["*"]) {
                    raptor.extend(input.attrs, input["*"]);
                }
                
                var nav = input.nav;
                
                
                input.anchorAttrs = {};
                
                if (isDropdownMenu) {
                    nav = input;
                    input.anchorAttrs["href"] = "";
                    input.anchorAttrs["data-toggle"] = "dropdown";
                    input.anchorAttrs["class"] = "dropdown-toggle";
                }
                else {
                    if (input.toggle) {
                        input.anchorAttrs["href"] = "#" + input.toggle;
                        input.anchorAttrs["data-toggle"] = (input.type === 'pills' ? 'pill' : 'tab');
                    }
                    else {
                        input.anchorAttrs["href"] = input.href ? input.href : "#";
                    }    
                }
                
                
                raptor.require('templating').render('components/nav/NavItem', {
                        nav: nav,
                        navItem: input,
                        isDropdownMenu: isDropdownMenu
                    },
                    context);
            }
        };
        
        return NavItemTag;
    });