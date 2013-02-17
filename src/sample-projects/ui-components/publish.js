require('raptor');

var templating = require('raptor/templating'),
    files = require('raptor/files'),
    resources = require('raptor/resources');

require('raptor/optimizer').configure(files.joinPaths(__dirname, "optimizer-config.xml"));

resources.addSearchPathDir(__dirname);
resources.addSearchPathDir(files.joinPaths(__dirname, 'modules'));

var pageOutputPath = files.joinPaths(__dirname, 'index.html');
templating.renderToFile("/index.rhtml", pageOutputPath);

console.log('Published page: ' + pageOutputPath);