raptor.define(
    "components.docs.ProjectDirStructure.ProjectDirStructureTag",
    function(raptor) {
        
        var File = raptor.require('files').File,
            githubUrl = "https://github.com/raptorjs/raptorjs.github.com/blob/master/src",
            startsWith = raptor.require('strings').startsWith;
        
        var FileNode = function(file) {
            this.file = file;
            this.parentNode = null;
            this.children = [];
        };
        
        FileNode.prototype = {
            getLabel: function() {

                var label;
                if (!this.parentNode) {
                    label = this._relPath(raptor.require('docs-util').getSrcDir());
                }
                else {
                    label = this._relPath(this.parentNode.file).substring(1);
                }

                if (this.file.isDirectory()) {
                    label += '/';
                }

                return label;
            },
            
            getHref: function() {
                var relPath = this._relPath(raptor.require('docs-util').getSrcDir());
                return githubUrl + relPath;
            },
            
            _relPath: function(baseFile) {
                return this.file.getAbsolutePath().substring(baseFile.getAbsolutePath().length).replace(/\\/g, '/');
            }
        }
        
        
        var ProjectDirStructureTag = function() {
            
        };
        
        ProjectDirStructureTag.prototype = {
            process: function(input, context) {
                var srcDir = raptor.require('docs-util').getSrcDir();
                var projectDir = new File(srcDir, input.dir);
                var excludeFile = new File(projectDir, ".exclude");

                var excludes = null;
                if (excludeFile.exists()) {
                    var excludesStr = excludeFile.readAsString();
                    excludes = excludesStr.split(/\n/);
                }

                var walkDir = function(file, parentNode) {
                    var filename = file.getName();
                    if (filename.charAt(0) === '.') {
                        return; //Skip hidden files
                    }

                    var node = new FileNode(file);
                    var relPath = node._relPath(projectDir);

                    if (excludes) {
                        for (var i=0, len=excludes.length; i<len; i++) {
                            if (startsWith(relPath, excludes[i])) {
                                return null;
                            }
                        }
                    }

                    if (parentNode) {
                        node.parentNode = parentNode;
                        parentNode.children.push(node);
                    }
                    
                    if (file.isDirectory()) {
                        file.forEachFile(function(child) {
                            walkDir(child, node);
                        });
                    }
                    return node;
                };
                
                var rootNode = walkDir(projectDir);
                
                raptor.require('templating').render('components/docs/ProjectDirStructure', {
                    rootNode: rootNode
                }, context);
                
            }
        };
        
        return ProjectDirStructureTag;
    });