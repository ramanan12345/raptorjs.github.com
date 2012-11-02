require('raptor').create({
    logging: {
        loggers: {
            'ROOT': {level: 'WARN'},
            'optimizer': {level: 'INFO'}
        }
    }
});

var files = raptor.require('files');

if (files.exists('static')) {
    files.remove('static');    
}

raptor.require('resources').addSearchPathDir(require('path').join(__dirname, 'modules'));

var optimizedPage = raptor.require('optimizer').optimizePage({
    name: 'test-page',
    packageFile: require('path').join(__dirname, 'pages/test-page/package.json')
});

console.log(raptor.require('debug').prettyPrint(optimizedPage));