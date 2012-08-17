raptor.define(
    "components.nav.NavItem.NavItemTag",
    function(raptor) {
        var NavItemTag = function() {
            
        };
        
        NavItemTag.prototype = {
            process: function(input, context) {
                var liClassParts = [];
                
                var nav = input.nav,
                    activeItem;
                if (nav) {
                    activeItem = nav.activeItem;
                }
                
                if (input.itemId && activeItem && activeItem === input.itemId) {
                    input.active = true;
                }
                
                if (input.active) {
                    liClassParts.push("active nav-item-active");
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
                
                input.anchorAttrs = {};
                
                if (isDropdownMenu) {
                    nav = input;
                    nav.activeItem = activeItem; //Pass along the active item to the sub-nav
                    
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