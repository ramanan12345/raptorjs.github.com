
console.log('Generating Static Files for RaptorJS Async Loader demo...');

require('raptor').create({
    logging: {
        loggers: {
            'ROOT': {level: 'WARN'},
            'optimizer': {level: 'INFO'}
        }
    }
});

var files = raptor.require('files'),
    File = files.File,
    resources = raptor.require('resources'),
    templating = raptor.require('templating'),
    optimizer = raptor.require('optimizer');



try
{
    if (files.exists('static')) {
        files.remove('static');    
    }

    resources.addSearchPathDir(__dirname);
    resources.addSearchPathDir(require('path').join(__dirname, 'modules'));

    var outputFile = new File(require('path').join(__dirname, 'test-page.html'));

    var pageOutput = templating.renderToString('/pages/test-page/test-page.rhtml', {
        outputDir: __dirname
    });

    outputFile.writeAsString(pageOutput);

    console.log('Test page written to "' + outputFile + '"');
}
catch(e) {
    raptor.require('logging').logger('publish.js').error(e);
}