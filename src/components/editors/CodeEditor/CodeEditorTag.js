raptor.define(
    "components.editors.CodeEditor.CodeEditorTag",
    function(raptor) {
        var CodeEditorTag = function() {
            
        };
        
        CodeEditorTag.prototype = {
            process: function(input, context) {
                var widgetConfig = {},
                    textareaAttrs = {};
                
                if (input.mode) {
                    widgetConfig.mode = input.mode;
                }
                
                widgetConfig.autoResize = input.autoResize !== false;

                if (input.readOnly === true) {
                    widgetConfig.readOnly = true;
                }
                
                if (input.autoFormat) {
                    widgetConfig.autoFormat = true;
                }
                
                if (!input.name) {
                    var nextId = context.nextCodeEditorId || (context.nextCodeEditorId = 0);
                    input.name = "code-" + nextId;
                    context.nextCodeEditorId++;
                }
                
                textareaAttrs.name = input.name;
                
                if (input.lineNumbers === false) {
                    widgetConfig.lineNumbers = false;
                }
                
                if (input.indentUnit) {
                    widgetConfig.indentUnit = input.indentUnit == null ? 4 : input.indentUnit;
                }
                    
                raptor.require('templating').render('components/editors/CodeEditor', {
                    tag: input, 
                    widgetConfig: widgetConfig,
                    widgetArgs: input.widgetArgs,
                    textareaAttrs: textareaAttrs,
                    title: input.title
                }, context);
            }
        };
        
        return CodeEditorTag;
    });