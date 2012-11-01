raptor.define(
    "module-a",
    function(raptor) {
        return {
            hello: function() {
                return 'Hello from "module-a"!';
            }
        };
    });
raptor.define(
    "module-b",
    function(raptor) {
        return {
            hello: function() {
                return 'Hello from "module-b"!';
            }
        };
    });
raptor.define(
    'test-page',
    function() {
        return {
            init: function() {
                //Do something on page init...
            }
        }
    });