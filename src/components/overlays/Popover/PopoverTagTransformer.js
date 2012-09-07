raptor.define(
    "components.overlays.Popover.PopoverTagTransformer",
    function(raptor) {
        return {
            process: function(node, compiler, template) {
                
                var popoverContentNode = null,
                    popoverTitleNode = null;
                
                node.forEachChild(function(child) {
                    if (child.tagName === 'popover-cotent') {
                        popoverContentNode = child;
                    }
                    else if (child.tagName === 'popover-title') {
                        popoverTitleNode = child;
                    }
                });
                
                if (popoverContentNode) {
                    popoverContentNode.detach();
                    node.setProperty('content', popoverContentNode.getBodyContentExpression());
                }
                
                if (popoverTitleNode) {
                    popoverTitleNode.detach();
                    node.setProperty('title', popoverTitleNode.getBodyContentExpression());
                }
            }
        }
    });