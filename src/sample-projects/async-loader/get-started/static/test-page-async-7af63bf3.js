define(
    "module-b",
    function(raptor) {
        return {
            sayHello: function(to) {
                var div = document.createElement('div');
                div.className = 'module-b';
                div.innerHTML = 'Hello from "module-b"!';
                document.body.appendChild(div);
            }
        };
    });