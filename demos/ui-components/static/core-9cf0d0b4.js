(function() {
    /*jshint strict:false */

    var raptor, //The "raptor" module being created
        defs = {}, //Registered module definitions are added to this object
        getOrCreateDef = function(id) { //Returns the module definition entry for the given ID or creates one of one does not exist
            return (id && defs[id]) || (defs[id] = {postCreate: []});
        },
        cache = {}, //Loaded module cache
        separator = "/",
        lookup = {},
        slice = [].slice,
        isArray = Array.isArray, //Helper function to check if an object is an Array object
        extend = function(target, source) { //A simple function to copy properties from one project to another
            if (!target) { //Check if a target was provided, otherwise create a new empty object to return
                target = {};
            }
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                    target[propName] = source[propName]; //Copy the property
                }
            }

            return target;
        },
        isString = function(s) {
            return typeof s == 'string';
        },
        isFunction = function(f) {
            return typeof f == 'function';
        },
        forEach = function(a, func, thisp) {
            if (a != null) {
                (a.forEach ? a : [a]).forEach(func, thisp);    
            }
        },
        forEachEntry = function(o, fun, thisp) {
            for (var k in o)
            {
                if (o.hasOwnProperty(k))
                {
                    fun.call(thisp, k, o[k]);
                }
            }
        },
        /**
         * Creates a module for the first time based on the provided factory function and provided post create functions
         * @param   {String}                   id         The ID of the module being built (not used, but simplifies code for callee)
         * @param   {Function|Object}          factory    The factory function or object instance
         * @param   {Function|Array<Function>} postCreate A function used to modify the instance before it is cached or an array of functions to modify the instance
         * @return  {Object}            [description]
         * @private
         */
        _build = function(id, factory, postCreate) {
            var instance = isFunction(factory) ? factory() : factory,
                o;

            if (postCreate) {
                forEach(postCreate, function(func) {
                    if ((o = func(instance))) { //Check if the postCreate function produced a new function... 
                        instance = o; //if so, use that instead
                    }
                });
            }
            return instance;
        },
        /**
         * Wire up the prototypes to support inheritance
         * 
         * @param   {Function} clazz    The constructor function
         * @param   {String} superclass The name of the super class
         * @param   {Boolean} copyProps If true, then all properties of the original prototype will be copied to the new prototype
         * @return  {Object}            The newly created prototype object with the prototypes chained together
         * @private
         */
        _inherit = function(clazz, superclass, copyProps) { //Helper function to setup the prototype chain of a class to inherit from another class's prototype
            
            var proto = clazz.prototype,
                F = function() {};
              
            var inherit = isString(superclass) ? _require(superclass) : superclass;

            extend(clazz,inherit);
            
            F.prototype = inherit.prototype; 
            clazz.superclass = F.prototype;

            clazz.prototype = new F();
              
            if (copyProps) {
                extend(clazz.prototype, proto);
            }
              
            return proto;
        },
        _makeClass = function(clazz, superclass, name) {
            if (!isFunction(clazz)) {
                var o = clazz;
                clazz = o.init || function() {};
                extend(clazz.prototype, o);
            }
            
            if (superclass) {
                _inherit(clazz, superclass, true);
            }

            clazz.getName = clazz.getName || function() {
                return name;
            };

            var proto = clazz.prototype;
            proto.constructor = clazz;
            proto.getClass = function() {
                return clazz;
            };
            
            return clazz;
        },
        _enumValueOrdinal = function() {
            return this._ordinal;
        }, 
        _enumValueName = function() {
            return this._name;
        }, 
        _enumValueCompareTo = function(other) {
            return this._ordinal - other._ordinal;
        }, 
        /**
         * Normalizes a module ID by resolving relative paths (if baseName is provided)
         * and by converting all dots to forward slashes.
         *
         * Examples:
         * normalize('test.MyClass') --> 'test/MyClass'
         * normalize('./AnotherClass', 'test/MyClass') --> 'test/AnotherClass'
         * 
         * @param   {String} id       The module ID to normalize
         * @param   {String} baseName The base name for the module ID that is used to resolve relative paths. (optional)
         * @return  {String}          The normalized module ID
         * @private
         */
        _normalize = function(id, baseName) {
            if (id.charAt(0) == separator) {
                id = id.substring(1);
            }

            if (id.charAt(0) == '.') {
                if (!baseName) {
                    return id;
                }

                var baseNameParts = baseName.split(separator).slice(0, -1);

                forEach(id.split(separator), function(part, i) {
                    if (part == '..') {
                        baseNameParts.splice(baseNameParts.length-1, 1); //Remove the last element
                    }
                    else if (part != '.') {
                        baseNameParts.push(part);
                    }
                });

                return baseNameParts.join(separator);
            }
            else {
                return id.replace(/\./g, separator);
            }
        },
        _require = function(id, callback, thisObj) {
            if (callback) {
                return _require('raptor/loader').load(id, callback, thisObj);
            }

            if (cache.hasOwnProperty(id)) {
                return cache[id];
            }
            
            if (raptor.exists(id)) {
                var defEntry = defs[id];
                return (cache[id] = _build(id, defEntry.factory, defEntry.postCreate));
            }
            else {
                throw new Error(id + ' not found');
            }
        },
        /**
         * These are properties that get added to all "require" functions.
         * 
         * NOTE: The require function will always include a "normalize" function
         *       that can be used to normalize a module ID based on the context
         *       where the require was created
         */
        requireProps = {
            load: function(dependencies, callback) {
                var normalize = this.normalize;
                
                if (!isArray(dependencies)) {
                    dependencies = [dependencies];
                }
                
                for (var i=0, len=dependencies.length; i<len; i++) {
                    dependencies[i] = normalize(dependencies[i]);
                }

                return _require(dependencies, callback);
            },
            
            exists: function(id) {
                return raptor.exists(this.normalize(id));
            },
            
            find: function(id) {
                
                return raptor.find(this.normalize(id));
            }
        },
        /**
         * These are properties that get added to all "define" functions.
         * 
         * NOTE: The define function will always include a "require" function
         *       that can be used to require other modules.
         */
        defineProps = {
            extend: function() {
                return _define(arguments, this.require, 0, 1);
            },

            Class: function() {
                return _define(arguments, this.require, 1);
            },

            Enum: function() {
                return _define(arguments, this.require, 0, 0, 1);
            }
        },
        _extendDefine = function(define) { 
            //Unfortunately functions cannot have custom prototypes so we much manually copy properties for each new instance
            return extend(define, defineProps);
        },
        _extendRequire = function(require) {
            return extend(require, requireProps);
        },
        /**
         * This functions takes in the arguments to define, define.Class and define.extend
         * calls and does the hard work of handling optional arguments.
         * 
         * @param   {arguments}  args The arguments object for the define, define.Class or define.extend
         * @param   {Function}  simpleRequire The function that should be used to actually perform the require of an object
         * @param   {Boolean} isClass Should only be true if this is define.Class call
         * @param   {Boolean} isExtend Should only be true if this is a define.extend call
         * @return  {Object|undefined} If no id is provided then the anonymous object is immediately built and returned. Otherwise, undefined is returned.
         * @private
         */
        _define = function(args, simpleRequire, isClass, isExtend, isEnum) {
            var i=0,
                last = args.length-1,
                finalFactory, //The function that wraps the user provided factory function to handle building the correct arguments to the user function
                arg,
                id, //The object id (optional)
                superclass, //The superclass (optional, should only be allowed for define.Class but that is not enforced currently...less code)
                enumValues,
                dependencies = [], //The dependencies arguments... defaults to an empty array
                postCreate, //A function that should be invoked after the object is created for the first time...Used to handle inheritance and to apply an extension
                factory, //The factory function or object definition (required, always the last argument)
                require = _extendRequire(function(requestedId, callback) { //This is the "require" function that the user code will see...Need to add the required props
                    return callback ? 
                        require.load(requestedId, callback) : 
                        simpleRequire(requestedId, id); //Pass along the requested ID and the base ID to the require implementation
                }),
                module = new Module(require), //Create a module object
                exports = module.exports, //Use the exports associated with the module object
                local = { //Map local functions and objects to names so that the names can be explicitly used. For example: define(['require', 'exports', 'module'], function(require, exports, module) {})
                    require: require,
                    exports: exports,
                    module: module
                },
                _gather = function() { //Converts an array of dependency IDs to the actual dependency objects (input array is modified)
                    forEach(dependencies, function(requestedId, i) {
                        var d;

                        if (!(d = local[requestedId])) { //See if the requested module is a local module and just use that module if it is
                            d = simpleRequire(requestedId, id); //Not a local module, look it up...they will do the normalization
                        }

                        dependencies[i] = d;
                    });

                    return dependencies;
                };

            require.normalize = function(requestedId) { //Helper function to normalize a module based on the parent define for the require
                return _normalize(requestedId, id);
            };

            /*
             Loop through the arguments to sort things out... 
             */
            for (; i<last; i++) {
                arg = args[i];
                if (isString(arg)) { //We found a string argument
                    if (id) { //If we already found an "id" then this string must be the superclass
                        superclass = _normalize(arg, id);
                    }
                    else { //Otherwise it is the module ID
                        id = module.id = _normalize(arg);
                    }
                }
                else if (isArray(arg)) { //We found an array...The argument must be the array of dependency IDs
                    dependencies = arg;
                }
                else if (isEnum) {
                    enumValues = arg;
                }
                else {
                    superclass = arg.superclass;
                }
            }
            
            factory = args[last]; //The factory function is always the last argument


            if (isExtend) { //If define.extend then we need to register a "post create" function to modify the target module
                postCreate = function(target) {
                    if (isFunction(factory)) {
                        factory = factory.apply(raptor, _gather().concat([require, target]));
                    }
                    
                    if (factory) {
                        extend(isFunction(target) ? target.prototype : target, factory);
                    }
                };
            }
            else {
                if (isClass || superclass) {
                    postCreate = function(instance) {
                        superclass = isString(superclass) ? require(superclass) : superclass;
                        return _makeClass(instance, superclass, id);
                    };
                }
                else if (isEnum) {

                    if (isArray(factory)) {
                        enumValues = factory;
                        factory = null;
                    }

                    postCreate = function(EnumClass) {
                        if (EnumClass) {
                            if (typeof EnumClass == 'object') {
                                EnumClass = _makeClass(EnumClass, 0, id); // Convert the class object definition to
                                                                          // a class constructor function
                            }
                        } else {
                            EnumClass = function() {};
                        }

                        var proto = EnumClass.prototype,
                            count = 0,
                            _addEnumValue = function(name, EnumCtor) {
                                return extend(
                                    EnumClass[name] = new EnumCtor(),
                                    {
                                        _ordinal: count++,
                                        _name: name
                                    });
                            };

                        if (isArray(enumValues)) {
                            forEach(enumValues, function(name) {
                                _addEnumValue(name, EnumClass);
                            });
                        } 
                        else if (enumValues) {
                            var EnumCtor = function() {};
                            EnumCtor.prototype = proto;

                            forEachEntry(enumValues, function(name, args) {
                                EnumClass.apply(_addEnumValue(name, EnumCtor), args || []);
                            });
                        }

                        EnumClass.valueOf = function(name) {
                            return EnumClass[name];
                        };

                        extend(proto, {
                            name : _enumValueName,
                            ordinal : _enumValueOrdinal,
                            compareTo : _enumValueCompareTo
                        });

                        if (proto.toString == Object.prototype.toString) {
                            proto.toString = _enumValueName;
                        }

                        return EnumClass;
                    };
                }


                

                finalFactory = isFunction(factory) ?
                    function() {
                        var result = factory.apply(raptor, _gather().concat([require, exports, module]));
                        return result === undefined ? module.exports : result;
                    } :
                    factory;
            }

            return raptor.define(id, finalFactory, postCreate);
        },
        Module = function(require) {
            var _this = this;
            _this.require = require;
            _this.exports = {};
        };

    Module.prototype = {
        logger: function() {
            var _this = this;
            return _this.l || (_this.l = _require('raptor/logging').logger(_this.id));
        }
    };

    /**
     * @module
     * @name raptor
     * @raptor
     */
    raptor = {
        cache: cache,
        
        inherit: _inherit,

        extend: extend,

        forEach: forEach,
        
        arrayFromArguments: function(args, startIndex) {
            if (!args) {
                return [];
            }
            
            if (startIndex) {
                return startIndex < args.length ? slice.call(args, startIndex) : [];
            }
            else
            {
                return slice.call(args);
            }
        },
        
        forEachEntry: forEachEntry,
        
        createError: function(message, cause) {
            var error,
                argsLen = arguments.length,
                E = Error;
            
            if (argsLen == 2)
            {
                error = message instanceof E ? message : new E(message);            
                error._cause = cause;                        
            }
            else if (argsLen == 1)
            {            
                if (message instanceof E)
                {
                    error = message;
                }
                else
                {
                    error = new E(message);                
                }
            }
            
            return error;
        },

        /**
         * Registers a factory function or object with an ID.
         *
         * NOTE: This function does no normalization of module IDs
         *       and it executes the factory function with no arguments.
         *       
         * @param  {String}          id         The ID of the object being defined
         * @param  {Function|Object} factory    The factory function or Object instance
         * @param  {Function}        postCreate A function to execute after the object is created for the first time (optional)
         * @return {Object} Returns undefined if an "id" is provided. If an "id" is provided then the object is immediately built and returned.
         */
        define: function(id, factory, postCreate) {
            if (!id) {
                return _build.apply(raptor, arguments);
            }

            var def = getOrCreateDef(id),
                instance;
            if (factory) {
                def.factory = factory;    
            }
            
            if (postCreate) {
                def.postCreate.push(postCreate);

                if ((instance = cache[id])) {
                    postCreate(instance);
                }
            }
            
            if (typeof instance == 'object' && instance.toString === Object.prototype.toString) {
                instance.toString = function() {
                    return '[' + id + ']';
                };
            }

        },

        exists: function(id) {
            return defs.hasOwnProperty(id);
        },
        
        find: function(id) {
            return raptor.exists(id) ? raptor.require(id) : undefined;
        },

        require: _require,

        normalize: _normalize,

        _define: _define,

        props: [requireProps, defineProps]
    };  //End raptor


    
    
    var _global;

    if (typeof window != 'undefined') {
        /*global require:true */

        _global = window;
        
        var defineRequire = defineProps.require = function(id, baseName) {
            return _require(_normalize(id, baseName));
        };
        
        define = _extendDefine(
            function() {
                return _define(arguments, defineRequire);
            });

        require = _extendRequire(function(id, callback) {
            return isFunction(callback) ?
                require.load(id, callback) :
                _require(_normalize(id));
        });
        
        require.normalize = _normalize;

        define.amd = {};
    }
    else {
        _global = global;
        module.exports = raptor;
    }
    
    raptor.define('raptor', raptor);
    
    /*
    The below code adds global lookup related functions that can always used
    look up objects by keys or to look up an array of objects by key. These
    functions are used by compiled code only and should not be used by
    user code directly. 
    TODO: provide a "raptor/lookup" module for user code
     */
    


    extend(_global, {
        /**
         * @param  {String} category The category name for the object being added to the lookup
         * @param  {String} key      The object key
         * @param  {Object} data     The object to associate with the key
         * @return {void}
         */
        $rset: function(category, key, data) {

            var catData = lookup[category];
            if (!catData) {
                catData = lookup[category] = {};
            }
            if (data !== undefined) {
                catData[key] = data;    
            }
            else {
                delete catData[key];
            }
            
        },

        $radd: function(category, data) {
            var catData = lookup[category];
            if (!catData) {
                catData = lookup[category] = [];
            }
            catData.push(data);
        },

        $rget: function(category, key) {
            var catData = lookup[category];
            return arguments.length == 2 ? catData && catData[key] : catData; 
        }
    });

    
    raptor.global = _global;
}());
define('raptor/widgets/WidgetDef', ['raptor'], function(raptor, require, exports, module) {
    "use strict";

    var WidgetDef = function(config) {
        /*
        this.type = null;
        this.id = null;
        this.assignedId = null;
        this.config = null;
        this.scope = null;
        this.events = null;
        this.parent = null;
        */
        
        this.children = [];
        
        raptor.extend(this, config);
    };

    WidgetDef.prototype = {
        a: function() {

        },

        addChild: function(widgetDef) {
            this.children.push(widgetDef);
        },
        
        elId: function(name) {
            if (arguments.length === 0) {
                return this.id;
            }
            else {
                return this.id + "-" + name;
            }
        }
    };
    
    return WidgetDef;
});
define('raptor/widgets/WidgetsContext', function(require, exports, module) {
    "use strict";
    
    var WidgetDef = require('raptor/widgets/WidgetDef');
    
    var WidgetsContext = function(context) {
        this.context = context;
        this.widgets = [];
        this.widgetStack = [];
    };

    WidgetsContext.prototype = {
        
        beginWidget: function(config, callback) {
            
            var _this = this,
                widgetStack = _this.widgetStack,
                lastWidgetIndex = widgetStack.length,
                parent = lastWidgetIndex ? widgetStack[lastWidgetIndex-1] : null;
            
            if (!config.id) {
                config.id = _this._nextWidgetId();
            }
            
            if (config.assignedId && !config.scope) {
                throw raptor.createError(new Error('Widget with an assigned ID "' + config.assignedId + '" is not scoped within another widget.'));
            }
            
            config.parent = parent;
            
            var widgetDef = new WidgetDef(config);
            
            if (parent) { //Check if it is a top-level widget
                parent.addChild(widgetDef);
            }
            else {
                _this.widgets.push(widgetDef);
            }
            
            widgetStack.push(widgetDef);

            try
            {
                callback(widgetDef);    
            }
            finally {
                widgetStack.splice(lastWidgetIndex, 1);
            }
        },
        
        hasWidgets: function() {
            return this.widgets.length !== 0;
        },

        clearWidgets: function() {
            this.widgets = [];
            this.widgetStack = [];
        },
        
        _nextWidgetId: function() {
            return 'w' + this.context.uniqueId();
        }
    };
    
    
    
    return WidgetsContext;
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* Module to manage the lifecycle of widgets
* 
*/
define('raptor/widgets', function(require, exports, module) {
    "use strict";

    var WidgetsContext = require('raptor/widgets/WidgetsContext'),
        WIDGET_CONTEXT_KEY = "widgets";
    
    return {
        
        getWidgetsContext: function(context) {
            var attributes = context.getAttributes();
            return attributes[WIDGET_CONTEXT_KEY] || (attributes[WIDGET_CONTEXT_KEY] = new WidgetsContext(context)); 
        }
    };
});
define.extend('raptor/widgets/WidgetsContext', function(require, target) {
    "use strict";
    
    return {
        initWidgets: function() {
            var widgetDefs = this.widgets,
                widgets = require('raptor/widgets');

            widgetDefs.forEach(function(widgetDef) {
                widgets.initWidget(widgetDef);
            });

            this.clearWidgets();
        }
    };
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @extension Browser
* 
*/
define.extend('raptor/widgets', function(require, widgets) {
    "use strict";
    
    var logger = require('raptor/logging').logger('raptor/widgets'),
        widgetsById = {},
        raptor = require('raptor'),
        isArray = Array.isArray,
        createError = raptor.createError,
        Widget = require('raptor/widgets/Widget'),
        _convertEvents = function(events) {
            var convertedEvents = {};
            raptor.forEach(events, function(event) {
                convertedEvents[event[0]] = {
                    target: event[1],
                    props: event[2]
                };
            }, this);
            return convertedEvents;
        };
    
    /**
     * The Documentation groups up all widgets rendered in the same template documentat.
     * 
     * @class
     * @anonymous
     *  
     */
    var Document = function() {
    };
    
    /**
     * 
     */
    Document.prototype = {
        _remove: function(widget, id) {
            
            var existing = this[id];

            if (isArray(existing)) {
                this[id] = existing.filter(function(cur) {
                    return cur !== widget;
                });   
            }
            else {
                delete this[id];
            }
        },

        /**
         * 
         * @param widget
         * @param id
         */
        _add: function(widget, id, isTargetArray) {
            var existing = this[id];
            
            if (!existing) {
                this[id] = isTargetArray ? [widget] : widget;
            }
            else {
                if (isArray(existing)) {
                    existing.push(widget);    
                }
                else {
                    this[id] = [existing, widget];
                }
            }
        },
        
        /**
         * 
         * @param id
         * @returns
         */
        getWidget: function(id) {
            return this[id];
        },
        
        /**
         * 
         * @param id
         * @returns {Boolean}
         */
        getWidgets: function(id) {
            var widgets = this[id];
            return widgets ? 
                (isArray(widgets) ? widgets : [widgets]) :
                [];
        }
    };

    /**
     * Creates and registers a widget without initializing it.
     * 
     * @param   {String} type       The class type for the module (e.g. "some/namespace/MyWidget")
     * @param   {String} id         The ID for the widget. This should typically be the ID of the widget's root DOM element
     * @param   {String} assignedId The assigned ID by the widget that this widget is scoped within
     * @param   {Object} config     A user-provided configuration object for the widget being initialized
     * @param   {String} scope      The widget ID of the widget that the new widget is scoped within
     * @param   {Object} events     A mapping of widget events to pubsub messages/topics
     * @param   {Boolean} bubbleErrorsDisabled     If true, then each widget initialization error will be caught and 
     *                                             logged and other widgets will continue to be initialized. If false, 
     *                                             then errors will bubble up to the calling code and any subsequent widgets 
     *                                             will not be initialized. 
     * 
     * @return  {Function} A function that can be used to complete the initialization of the widget
     * @private
     */
    var _registerWidget = function(type, id, assignedId, config, scope, events, parent, bubbleErrorsDisabled) {
        if (!require.exists(type)) {
            throw createError(new Error('Unable to initialize widget of type "' + type + '". The class for the widget was not found.'));
        }

        var widget, // This will be the newly created widget instance of the provided type
            OriginalWidgetClass = require(type); // The user-provided constructor function

        logger.debug('Creating widget of type "' + type + '" (' + id + ')');
        
        if (OriginalWidgetClass.initWidget) { //Check if the Widget has an "initWidget" function that will do the initialization
            /*
             * Update the config with the information that 
             * the user "initWidget" function by need:
             */
            config.elId = id;
            config.events = events;

            widget = OriginalWidgetClass; //Use the provided object as the widget

            if (!OriginalWidgetClass.onReady) { //Add an onReady function that can be used to initialize the widget onReady
                OriginalWidgetClass.onReady = widgets.onReady;    
            }
        }
        else {
            /*
             * We have to create a temporary constructor function because we want
             * to delay the invocation of the user's constructor function until
             * we have had a chance to add all of the required special 
             * properties (_id, _assignedId, _events, etc.)
             */ 
            var WidgetClass = function() {}, 
                proto; //This will be a reference to the original prorotype

            WidgetClass.prototype = proto = OriginalWidgetClass.prototype;
            
            widget = new WidgetClass();
            
            Widget.makeWidget(widget, proto); //Will apply Widget mixins if the widget is not already a widget
            
            
            
            // Register events that allow widgets support:
            widget.registerMessages(['beforeDestroy', 'destroy'], false);
            
            // Check if the user's widget has an additional events defined
            var allowedEvents = proto.events || OriginalWidgetClass.events;

            if (allowedEvents) {
                widget.registerMessages(allowedEvents, false);
            }
            
            // Add required specified properties required by the Widget mixin methods
            widget._id = id;
            

            if (!OriginalWidgetClass.getName) {
                OriginalWidgetClass.getName = function() {
                    return type;
                };    
            }
            
            proto.constructor = OriginalWidgetClass;

            if (Widget.legacy) {
                widget._parentWidget = parent;
            }
            
            if (events) {
                widget._events = _convertEvents(events);
            }
            
            widget.widgets = new Document(); //This widget might have other widgets scoped within it 

            widgetsById[id] = widget; // Register the widget in a global lookup
            
            if (assignedId && scope) { // If the widget is scoped within another widget then register the widget in the scope
                var isTargetArray;

                if (assignedId.endsWith('[]')) { // When adding the widgets to a collection, an array can be forced by using a [] suffix for the assigned widget ID
                    assignedId = assignedId.slice(0, -2);
                    isTargetArray = true;
                }

                widget._assignedId = assignedId;
                widget._scope = scope;

                var containingWidget = widgetsById[scope];
                if (!containingWidget) {
                    throw createError(new Error('Parent scope not found: ' + scope));
                }

                containingWidget.widgets._add(
                    widget, 
                    assignedId, 
                    isTargetArray);

                if (Widget.legacy) {
                    containingWidget[assignedId] = widget;
                }
            }
        }

        return {
            widget : widget,
            init : function() {
                var _doInitWidget = function() {
                    try
                    {
                        if (widget.initWidget) {
                            widget.initWidget(config);
                        }
                        else {
                            OriginalWidgetClass.call(widget, config);
                        }
                    }
                    catch(e) {
                        var message = 'Unable to initialize widget of type "' + type + "'. Exception: " + e;
                        
                        // NOTE:
                        // For widgets rendered on the server we disable errors from bubbling to allow the page to possibly function
                        // in a partial state even if some of the widgets fail to initialize.
                        // For widgets rendered on the client we enable bubbling to make sure calling code is aware of the error.
                        if (bubbleErrorsDisabled) {
                            logger.error(message, e);
                        }
                        else {
                            throw e;
                        }
                    }
                };
    
                if (widget.initBeforeOnDomReady === true) {
                    _doInitWidget();
                }
                else {
                    widget.onReady(_doInitWidget);
                }
            }
        };
    };

    return {

        initWidget: function(widgetDef) {
            var result  = _registerWidget(
                widgetDef.type, 
                widgetDef.id, 
                widgetDef.assignedId, 
                widgetDef.config, 
                widgetDef.scope ? widgetDef.scope.id : null, 
                widgetDef.events);

            widgetDef.widget = result.widget;
            
            if (widgetDef.children.length) {
                widgetDef.children.forEach(this.initWidget, this);
            }

            // Complete the initialization of this widget after all of the children have been initialized
            result.init();
        },

        /**
         * 
         * @param {...widgets} widgets An array of widget definitions
         * @returns {void}
         */
        _serverInit: function(widgetDefs) {
            var _initWidgets = function(widgetDefs, parent) {
                    if (!widgetDefs) {
                        return;
                    }

                    var i=0,
                        len = widgetDefs.length;
                    
                    for (; i<len; i++) {
                        
                        // Each widget def serialized from the server is encoded into a minimal
                        // array object that we need to decipher...
                        var widgetDef = widgetDefs[i], 
                            type = widgetDef[0],
                            id = widgetDef[1],
                            config = widgetDef[2] || {},
                            scope = widgetDef[3],
                            assignedId = widgetDef[4],
                            events = widgetDef[5] || {},
                            children = widgetDef.slice(6);
                        
                        if (scope === 0) {
                            scope = undefined;
                        }
                            
                        if (assignedId === 0) {
                            assignedId = undefined;
                        }
                        
                        if (config === 0) {
                            config = undefined;
                        }

                        
                        // First register the widget and get back a function to complete the initialization.
                        // The widget should not be initialized until all of its children have first been
                        // initialized.
                        var result = _registerWidget(type, id, assignedId, config, scope, events, parent, 1);


                        // Initialize all of the children
                        if (children && children.length) {
                            _initWidgets(children, result.widget);
                        }

                        // Now finish the initialization of the current widget now that the children have been initialized
                        result.init();
                    }

                };
                
            _initWidgets(widgetDefs);
        },
        
        /**
         * Gets a widget by widget ID
         * @param {string} id The ID of the widget
         * @returns {object} The widget instance
         */
        get: function(id) {
            return widgetsById[id];
        },

        _remove: function(id) {
            delete widgetsById[id];
        }
    };
});

$rwidgets = function() {
    /*jshint strict:false */
    require('raptor/widgets')._serverInit(require('raptor').arrayFromArguments(arguments));
};

require('raptor/pubsub').subscribe({
    'dom/beforeRemove': function(eventArgs) {
        /*jshint strict:false */

        var el = eventArgs.el;
        var widget = require('raptor/widgets').get(el.id);
        if (widget) {
            widget.destroy({
                removeNode: false,
                recursive: true
            });
        }
    },

    'raptor/component-renderer/renderedToDOM': function(eventArgs) {
        /*jshint strict:false */
        
        var widgets = require('raptor/widgets');

        var context = eventArgs.context,
            widgetsContext = widgets.getWidgetsContext(context);

        widgetsContext.initWidgets();
    }
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Mixins applied to the prototypes of all widget instances
 * @mixin
 * 
 * @borrows raptor/listeners/Observable#publish as #publish
 * @borrows raptor/listeners/Observable#subscribe as #subscribe
 */
define(
    'raptor/widgets/Widget',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var listeners = require('raptor/listeners'),
            dom = require('raptor/dom'),
            _destroy = function(widget, removeNode, recursive) {
                var message = {
                        widget: widget
                    },
                    rootEl = widget.getEl(),
                    widgets = require('raptor/widgets'),
                    assignedId = widget._assignedId;
                
                widget.publish('beforeDestroy', message);
                
                //Have the widget unsubscribe from any messages that is currently subscribed to
                listeners.unsubscribeFromAll(widget);
                
                widget.__destroyed = true;
                
                
                if (rootEl) {
                    if (recursive) {
                        var walkDOM = function(el) {
                            dom.forEachChildEl(el, function(childEl) {
                                if (childEl.id) {
                                    var descendentWidget = widgets.get(childEl.id);
                                    if (descendentWidget) {
                                        _destroy(descendentWidget, false, false);
                                    }
                                }
                                
                                walkDOM(childEl);
                            });
                        };

                        walkDOM(rootEl);
                    }
                    
                    if (removeNode) {
                        //Remove the widget's DOM nodes from the DOM tree if the root element is known
                        rootEl.parentNode.removeChild(rootEl);
                    }
                }
                
                widgets._remove(widget._id);

                if (assignedId) {
                    var scopeWidget = widgets.get(widget._scope);
                    if (scopeWidget) {
                        scopeWidget.widgets._remove(widget, assignedId);
                    }
                }

                widget.publish('destroy', message);
            },
            widgetProto;
        
        var Widget = function() {

        };

        Widget.makeWidget = function(widget, proto) {
            if (!widget._isWidget) {
                for (var k in widgetProto) {
                    if (!proto.hasOwnProperty(k)) {
                        proto[k] = widgetProto[k];
                    }
                }
            }
        };

        Widget.prototype = widgetProto = {
            /**
             * 
             */
            _isWidget: true,
            
            /**
             * 
             * @returns
             */
            getObservable: function() {
                return this._observable || (this._observable = listeners.createObservable());
            },
            
            /**
             * 
             * @param allowedMessages
             * @param createFuncs
             * @returns
             */
            registerMessages: function(allowedMessages, createFuncs) {
                this.getObservable().registerMessages.apply(this, arguments);
            },
            
            /**
             * 
             * @param message
             * @param props
             * @returns
             */
            publish: function(message, props) {
                var ob = this.getObservable();
                ob.publish.apply(ob, arguments);
                var pubsubEvent;
                
                if (this._events && (pubsubEvent = this._events[message])) {
                    
                    if (pubsubEvent.props) {
                        props = raptor.extend(props || {}, pubsubEvent.props); 
                    }
                    require('raptor/pubsub').publish(pubsubEvent.target, props);
                    
                }
            },
            
            /**
             * 
             * @param message
             * @param callback
             * @param thisObj
             * @returns
             */
            subscribe: function(message, callback, thisObj) {
                var ob = this.getObservable();
                return ob.subscribe.apply(ob, arguments);
            },
            
            /**
             * Returns the DOM element ID corresponding to the provided
             * widget element ID. 
             * 
             * @param {string} widgetElId The widget element ID.
             * @returns {string} The DOM element ID corresponding tothe provided widget element ID
             */
            getElId: function(widgetElId) {
                return widgetElId ? this._id + "-" + widgetElId : this._id;
            },
    
            /**
             * Returns a raw DOM element for the given widget element ID. If no
             * widget element ID is provided then the root DOM node that the widget is bound to is returned.
             * @param widgetElId
             * @returns {DOMElement} The DOM element
             */
            getEl: function(widgetElId) {
                return document.getElementById(this.getElId(widgetElId));
            },
            
            
    
            /**
             * 
             * Returns a single nested widget instance with the specified ID. 
             * 
             * NOTE: If multiple nested widgets exist with the specified ID then
             *       an exception will be thrown.
             *       
             * @param nestedWidgetId
             * @returns {object} The child instance widget or null if one is not found.
             */
            getWidget: function(nestedWidgetId) {
                return this.widgets.getWidget(nestedWidgetId);
            },
            
            /**
             * Returns an array of nested widgets with the specified widget ID.
             * @param nestedWidgetId
             * @returns {array} An array of nested widgets (or an empty array if none are found)
             */
            getWidgets: function(nestedWidgetId) {
                return this.widgets.getWidgets(nestedWidgetId);
            },

            /**
             * Destroys a widget.
             * 
             * If the root element is specified for the widget then the widget will
             * be removed from the DOM. In addition, all of the descendent widgets
             * will be destroyed as well.
             * 
             * The "beforeDestroy" message will be published by the widget before
             * the widget is actually destroyed.
             * 
             * The "destroy" message will be published after the widget
             * has been destroyed.
             * 
             * NOTE: The widget will automatically be unsubscribed from all messages
             *       that it has subscribed to.
             * 
             */
            destroy: function(options) {
                options = options || {};
                _destroy(this, options.removeNode !== false, options.recursive !== false);
            },
            
            /**
             * Returns true if this widget has been destroyed.
             * 
             * A widget is considered destroyed if the "destroy" method
             * was invoked on the widget or one of its ancestor widgets.
             * 
             * @returns {boolean} True if this widget has been destroyed. False, otherwise.
             */
            isDestroyed: function() {
                return this.__destroyed;
            },
            
            /**
             * Re-renders a widget by replacing the widget's existing root element with
             * the newly rendered HTML.
             *
             * <p>The widget instance is required to have a "renderer" property that defines
             * the renderer to use, or, if the name ends in "Widget" then the renderer
             * will be assumed to be of the name with "Widget" replaced with "Renderer" 
             * (e.g. "ui/buttons/Button/ButtonWidget" --> "ui/buttons/Button/ButtonRenderer")
             * 
             * @param  {Object} data The data to use as input to the renderer
             * @param  {raptor/render-context/Context} The render context (optional)
             * 
             * @return {raptor/component-renderer/RenderResult}   Returns the resulting of re-rendering the component
             */
            rerender: function(data, context) {
                var renderer = this.renderer,
                    type = this.constructor.getName(),
                    componentRenderer = require('raptor/component-renderer'),
                    rootEl = this.getEl();

                if (!rootEl) {
                    throw raptor.createError(new Error("Root element missing for widget of type " + type));
                }

                if (!renderer) {
                    
                    if (this.constructor.render) {
                        renderer = this.constructor;
                    }
                    else {
                        if (type.endsWith("Widget")) {
                            renderer = require.find(type.slice(0, -6) + "Renderer");
                        }
                    }
                }

                if (!renderer) {
                    throw raptor.createError(new Error("Renderer not found for widget " + type));
                }

                return componentRenderer.render(renderer, data, context).replace(rootEl);
            }


            /**
             * Subscribes to one or more events. 
             * 
             * This method is a synonym for the {@Link raptor/widgets/Widget.subscribe} method
             * to maintain backwards compatibility.
             * <b>This method will be removed in the future.</b>
             * 
             * @function
             * @name on
             * @memberOf raptor/widgets/Widget
             */
        };

        widgetProto.on = widgetProto.subscribe;

        return Widget;
    });
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @extension Browser
* 
*/
define.extend('raptor/widgets', function(require) {
    "use strict";
    

    return {
        onReady: function(callback, thisObj) {
            $(function() {
                callback.call(thisObj);
            });
        }
    };
});

/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * jQuery extensions applied to all widgets
 * 
 * @extension jQuery
 */
define.extend('raptor/widgets/Widget', function(require) {
    "use strict";
    
    var raptor = require('raptor'),
        idRegExp = /\#(\w+)( .*)?/g,
        global = raptor.global;
    
    return {
        /**
         * 
         * @param arg Selector args
         * @returns The result of the jQuery invocation
         * @see <a href="http://api.jquery.com/category/selectors/">jQuery Selectors</a>
         */
        $: function(arg) {
            var args = arguments;
            
            if (args.length === 1)
            {
                //Handle an "ondomready" callback function
                if (typeof arg === 'function') {
                    
                    var _this = this;
                    
                    $(function() {
                        arg.apply(_this, args);
                    });
                }
                else if (typeof arg === 'string') {
    
                    var match = idRegExp.exec(arg);
                    idRegExp.lastIndex = 0; //Reset the search to 0 so the next call to exec will start from the beginning for the new string
                    
                    if (match != null) {
                        var widgetElId = match[1];
                        if (match[2] == null) {
                            return $(this.getEl(widgetElId));
                        }
                        else
                        {
                            return $("#" + this.getElId(widgetElId) + match[2]);
                        }
                    }
                    else
                    {
                        var rootEl = this.getEl();
                        if (!rootEl) {
                            throw new Error('Root element is not defined for widget');
                        }
                        if (rootEl) {
                            return $(arg, rootEl);
                        }
                    }
                }
            }
            else if (args.length === 2) {
                if (typeof args[1] === 'string') {
                    return $(arg, this.getEl(args[1]));
                }
            }
            else if (args.length === 0) {
                return $(this.getEl());
            }
            
            return $.apply(global, arguments);
        },
        
        /**
         * 
         * @param callback
         * @returns
         */
        onReady: function(callback) {
            var _this = this;
            var invokeCallback = function() {
                callback.call(_this, _this);
            };

            if ($.isReady) {
                return invokeCallback();
            }

            $(invokeCallback());
        }
    };
});