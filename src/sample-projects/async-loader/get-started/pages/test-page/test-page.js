window.TestPage = {
    loadModuleBAsync: function() {
        raptor.require('module-b', function(moduleB) {
            moduleB.sayHello();
        });
    }
}