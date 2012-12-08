console.log('Generating static files for RaptorJS Async Loader demo...');

require('raptor');

require('raptor/logging').configure({
    loggers: {
        'ROOT': {level: 'WARN'},
        'optimizer': {level: 'INFO'}
    }
});

var files = require('raptor/files'),
    File = require('raptor/files/File'),
    resources = require('raptor/resources'),
    templating = require('raptor/templating'),
    optimizer = require('raptor/optimizer');



try
{
    var outputFile = new File(require('path').join(__dirname, 'test-page.html'));

    if (files.exists('static')) {
        files.remove('static');    
    }

    if (outputFile.exists()) {
        outputFile.remove();
    }

    resources.addSearchPathDir(__dirname);
    resources.addSearchPathDir(require('path').join(__dirname, 'modules'));

    var pageOutput = templating.renderToString('/pages/test-page/test-page.rhtml', {
        outputDir: __dirname
    });

    outputFile.writeAsString(pageOutput);

    console.log('Test page written to "' + outputFile + '"');
}
catch(e) {
    require('raptor/logging').logger('publish.js').error(e);
}