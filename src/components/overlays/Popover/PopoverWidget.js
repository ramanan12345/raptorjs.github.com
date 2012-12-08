define(
    "components.overlays.Popover.PopoverWidget",
    function(raptor) {
        return {
            initWidget: function(config) {
                $('#' + config.elId).popover(config);
            }
        }
    });