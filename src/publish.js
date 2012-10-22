require("raptor").createRaptor({
    logging: {
        loggers: {
            'ROOT': {level: 'WARN'},
            'oop-server': {level: 'WARN'},
            'resources': {level: 'WARN'},
            'optimizer': {level: 'WARN'}
        }
    }
});

raptor.require('resources').getSearchPath().addDir(__dirname);

var templating = raptor.require('templating'),
    logger = raptor.require('logging').logger('publish'),
    strings = raptor.require('strings'),
    files = raptor.require('files'),
    File = raptor.require('files').File,
    cwd = process.cwd(),
    resolveFile = function(path, basePath) {
        if (!path) {
            return path;
        }
        
        return new File(files.resolvePath(basePath || cwd, path));
    },
    configArgRegExp=/^(?:-|--)([A-Za-z0-9_\-]+)(?:=([^\s]+))?$/,
    paramArgRegExp=/^([A-Za-z0-9_\-]+)(?:=([^\s]+))?$/,
    cwd = process.cwd(),
    parseArgs = function(args) {
        var result={};
        args.forEach(function(arg, i) {
            var matches,
                name,
                value;
            if ((matches = configArgRegExp.exec(arg))) {
                name = matches[1];
                value = matches[2] || '';
            }
            else if ((matches = paramArgRegExp.exec(arg))) {
                name = matches[1];
                value = matches[2];
                
            }
            else {
                name = arg;
                value = true;
            }
            
            if (value === 'true' || value === 'false') {
                value = value === 'true';
            }
            result[name] = value; 
        });
        
        return result;
    },
    args = parseArgs(process.argv.slice(2));


var Publisher = function(config) {
    this.appendPageFilename = config.profile !== 'production';
    this.page = config.page;

    this.outputDir = files.resolveRelativeFile(__dirname, "..");
    this.currentOutputDir = null;

    this.templateContext = templating.createContext();
};

Publisher.prototype = {
    publish: function() {

        raptor.require('docs-util').publisher = this;

        var baseDir = files.joinPaths(__dirname, "pages"); 
        
        var handlePage = function(templateFile) {
            var relativePath = templateFile.getParent().substring(baseDir.length);
            var pathParts = relativePath.substring(1).split(/[\/\\]/)
            var pageName = pathParts.join('-');
            var outputFile = new File(this.outputDir, relativePath + '/index.html');

            this.writePage(
                templateFile, 
                outputFile, 
                pageName,
                relativePath);
        }
        
        if (this.page) {
            if (!strings.endsWith(this.page, '/index.rhtml')) {
                this.page += '/index.rhtml';
            }
            
            if (!strings.startsWith(this.page, '/')) {
                this.page = '/' + this.page;
            }
            
            if (!strings.startsWith(this.page, '/pages')) {
                this.page = '/pages' + this.page;
            }
            
            var templateFile = new File(__dirname, this.page);
            handlePage.call(this, templateFile);
        }
        else {
            raptor.require('files.walker').walk(
                baseDir, 
                function(file) {
                    if (file.isFile() && file.getExtension() === "rhtml") {
                        handlePage.call(this, file);
                    }
                },
                this);

            raptor.require('docs-util').publisher = null;
        }
        
    },

    writePage: function(templateFile, outputFile, name, relativePath) {
        console.error('Writing page "' + (relativePath || "/") + '" to "' + outputFile + '"...');
        this.currentOutputDir = outputFile.getParentFile();

        var controllerFile = new File(templateFile.getParentFile(), templateFile.getNameWithoutExtension() + ".js");
        var viewModel = null;
        if (controllerFile.exists()) {
            viewModel = require(controllerFile.getAbsolutePath()).controller();
        }

        viewModel = viewModel || {};
        viewModel.pageName = name;
        viewModel.pageOutputDir = outputFile.getParent();

        var output = templating.renderToString(templateFile.getAbsolutePath(), viewModel, this.templateContext);
        outputFile.writeAsString(output);

        this.currentOutputDir = null;
    }
};



exports.publish = function(config) {
    try
    {
        raptor.require('optimizer').configure(new File(__dirname, "optimizer-config.xml"), config);
        raptor.extend(config, args);
        
        var publisher = new Publisher(config);
        publisher.publish();
    }
    catch(e) {
        logger.error("Unable to publish docs. Exception: " + e, e);
    }
    
};