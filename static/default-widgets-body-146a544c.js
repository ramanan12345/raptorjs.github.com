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
raptor.define('widgets', function(raptor) {
    "use strict";

    var WidgetDef = function(id, type, assignedId, config, scope, events) {
        this.type = type;
        this.id = id;
        this.assignedId = assignedId;
        this.config = config;
        this.scope = scope;
        this.events = events;
        this.children = [];
    };

    WidgetDef.prototype = {
        elId: function(name) {
            if (arguments.length === 0) {
                return this.id;
            }
            else {
                return this.id + "-" + name;
            }
        }
    };
    
    return {
        addWidget: function(type, widgetId, assignedId, config, parent, scope, events, context) {
            
            if (!widgetId) {
                widgetId = this._nextWidgetId(context);
            }
            
            var widgetDef = new WidgetDef(widgetId, type, assignedId, config, scope, events);
            if (parent) {
                parent.children.push(widgetDef);
            }
            if (assignedId && !scope) {
                throw raptor.createError(new Error("Widget with an assigned ID is not scoped within another widget."));
            }
            
            if (!parent) { //Check if it is a top-level widget
                var attributes = context.getAttributes();
                if (!attributes.widgets) {
                    attributes.widgets = [];
                }
                attributes.widgets.push(widgetDef); 
            }
            
            return widgetDef;
        },
        
        hasWidgets: function(context) {
            var attributes = context.getAttributes();
            return attributes.widgets && attributes.widgets.length !== 0;
        },
        
        _nextDocId: function(context) {
            var attributes = context.getAttributes();
            if (!attributes.nextDocId) {
                attributes.nextDocId = 1;
            }
            return attributes.nextDocId++;
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
 * Simple module to support decoupled communication using Pub/Sub communication.
 * 
 * <h1>Overview</h1>
 * <p>
 * Pub/sub allows independent objects on a page to communicate by allowing publishers
 * to share information with subscribers by having subscribers publish messages
 * with a "topic name" that is agreed upon by the subscribers. The topic name
 * is simply a string value.  There are two key
 * methods for pub/sub and they are described below:
 * </p>
 * 
 * <ul>
 *  <li>
 *      <b>publish(topic, props)</b><br>
 *      Publishes a message using the provided topic name. The properties in the props object, if provided, will be applied to the message that is published. 
 *  </li>
 *  <li>
 *      <b>subscribe(topic, callbackFunction, thisObj)</b><br>
 *      Subscribes to messages on the provided topic. 
 *      If a message is published to the provided topic then the provided callback function will be invoked. If the publisher of the message provides any argument object
 *      then argument object will be passed as arguments to the callback function (in order). In addition, the Message object will be provided after the arguments (see below).
 *  </li>
 * </ul>
 * 
 * <h2>Usage:</h2>
 * <p>
 * <js>var pubsub = raptor.require('pubsub');
 * pubsub.subscribe('someTopic', function(message) {
 *     alert(message.myMessage); //Will alert "Hello World!"
 * });
 * 
 * pubsub.publish('someTopic', {myMessage: 'Hello World!'});
 * </js>
 * </p>
 * 
 * <h1>Private Pub/Sub Channels</h1>
 * <p>
 * 
 * Pub/sub also supports private communication channels for messages. A private communication
 * channel can be obtained using <code>channel(channelName)</code> method.
 * 
 * For channels to be effective, a set of publishers and subscribers would have to agree
 * on a channel name.
 * </p>
 * 
 * <p>
 * <h2>Channel usage:</h2>
 * <js>var pubsub = raptor.require('pubsub');
 * var channel = pubsub.channel('myPrivateChannel');
 * channel.subscribe('someTopic', function(message) {
 *     alert(message.myMessage); //Will alert "Hello World!"
 * });
 * 
 * channel.publish('someTopic', {myMessage: 'Hello World!'});
 * </js>
 * </p>
 * 
 * <h1>Topics and Namespaces</h1>
 * <p>
 * A topic can be a simple topic such as "myTopic" or a namespaced topic such as "myTopic.mySubTopic". <b>Important:</b> Dots should be used to separate the topic parts. 
 * The RaptorJS pubsub module supports wildcard topics when subscribing to topics.
 * </p>
 * 
 * <p>
 * NOTE: The original topic can be accessed using a special message object that is passed in as the second argument to the listener function. The message data provided to the publish method will always be passed in as the first argument.
 * </p>
 * 
 * <p>
 * <h2>Wildcard usage:</h2>
 * <js>var pubsub = raptor.require('pubsub');
 * 
 * channel.subscribe('someTopic.*', function(data, message) {
 *     alert(data.myValue + " - " + message.getTopic());
 * });
 * 
 * channel.publish('someTopic.a', {myValue: 'A'}); //Will result in alert("A - someTopic.a") 
 * channel.publish('someTopic.b', {myValue: 'B'}); //Will result in alert("B - someTopic.b")
 * </js>
 * </p>
 * 
 * 
 */
raptor.define('pubsub', function(raptor) {
    "use strict";
    
    var listeners = raptor.listeners;

    /**
     * The Message class allows additional information to be provided to subscribers.
     * 
     * @class
     * @anonymous
     * @name pubsub.Message
     * @augments listeners.Message
     * 
     * @param topic {String} The topic name of the message
     * @param props {Object} An object with properties that should be applied to the newly created message 
     */
    var Message = function(topic, props) {
        listeners.Message.call(this, topic, props);
        this.topic = topic;
    };
    
    Message.prototype = {
        /**
         * Returns the topic name that the message was published to.
         * 
         * @returns {String} The topic name that the message was published to
         */
        getTopic: function() {
            return this.topic;
        }
    };
    
    raptor.inherit(Message, listeners.Message, true);
    
    /**
     * @class
     * @anonymous
     */
    var Channel = raptor.defineClass(function(raptor) {

        return {
            /**
             * 
             * @param name
             * @returns
             */
            init: function(name) {
                this.name = name;
                this.observable = listeners.createObservable();       
            },
            
            /**
             * 
             * Publishes a Pub/Sub message to the provided topic and with the provided arguments.
             * 
             * Usage:
             * <js>
             * var pubsub = raptor.require('pubsub');
             * var channel = pubsub.channel('myChannel');
             * 
             * channel.publish('myTopic', {
             *     hello: "Hello",
             *     world: "World"
             * });
             * 
             * </js>
             * 
             * @param topic {String|pubsub.Message} The topic name or the Message object that should be published 
             * @param data {Object} The data object to associate with the published message (optional)
             * 
             * 
             */
            publish: function(topic, data)  {
                
                var message;
                
                //Convert the arguments into a Message object if necessary so that we can associate extra information with the message being published
                if (raptor.listeners.isMessage(topic)) {
                    message = topic;
                }
                else {
                    message = raptor.require('pubsub').createMessage(topic, data);
                }
                
                this.observable.publish(message);
                
                return message;
            },
            
            /**
             * Subscribes to one or more topics on the channel.
             * 
             * Two signatures are supported:
             * <ol>
             * <li> eventHandle subscribe(type, callback, thisObj, autoRemove)</li>
             * <li> eventHandle subscribe(callbacks, thisObj, autoRemove)</li>
             * </ol>
             * 
             * Usage:
             * <js>var pubsub = raptor.require('pubsub');
             *  
             *  //Option 1) Subscribing to a single topic
             *  pubsub.subscribe('someTopic', function(message) {
             *      //Do something when a message is received
             *  }, this);
             *  
             *  //Option 2) Subscribing to a multiple topics
             *  pubsub.subscribe({
             *          'someTopic': function(message) {
             *              //Do something when a message is received
             *          },
             *          'anotherTopic': function(message) {
             *              //Do something when a message is received
             *          }
             *      }, this);
             * </js>
             * 
             * @param topic {String} The topic name
             * @param callback {Function} The callback function
             * @param thisObj {Object} The "this" object to use for the callback function
             * 
             * @returns {listeners.ObservableListenerHandle} A handle to remove the subscriber(s)
             */
            subscribe: function(topic, callback, thisObj) {
                return this.observable.subscribe(topic, callback, thisObj);
            }
        };
        
    });
    
    
    
    var channels = {};

    return {
        /**
         * Returns a messaging channel with the provided name. If the messaging channel has not been created then it is created and returned.
         * 
         * @param name {String} The name of the messaging channel.
         * 
         * @returns {pubsub.Channel} The messaging channel with the specified name.
         */
        channel: function(name) {
            var channel = channels[name];
            if (!channel) {
                channel = new Channel(name);
                channels[name] = channel;
            }
            return channel;
        },
        
        /**
         * Returns the global messaging channel.
         * 
         * @returns {pubsub.Channel} The "global channel
         */
        global: function() {
            return this.channel("global");
        },
        
        /**
         * 
         * Publishes a Pub/Sub message to the provided topic and with the provided arguments to the "global" channel.
         * 
         * Usage:
         * <js>
         * var pubsub = raptor.require('pubsub');
         * 
         * pubsub.publish('myTopic', {
         *     hello: "Hello",
         *     world: "World"
         * });
         * 
         * </js>
         * 
         * NOTE: Calling this method is equivalent to the following code:
         * <js>pubsub.global().publish(topic, props)</js>
         * 
         * @param topic {String|pubsub.Message} The topic name or the Message object that should be published 
         * @param props {Object} An object with properties that should be applied to the message object (optional)
         * 
         * 
         */
        publish: function(topic, props) {
            var global = this.global();
            global.publish.apply(global, arguments);
        },
        
        /**
         * Subscribes to one or more topics on the "global" channel.
         * 
         * Two signatures are supported:
         * <ol>
         * <li> eventHandle subscribe(type, callback, thisObj, autoRemove)</li>
         * <li> eventHandle subscribe(callbacks, thisObj, autoRemove)</li>
         * </ol>
         * 
         * Usage:
         * <js>var pubsub = raptor.require('pubsub');
         *  
         *  //Option 1) Subscribing to a single topic
         *  pubsub.subscribe('someTopic', function(message) {
         *      //Do something when a message is received
         *  }, this);
         *  
         *  //Option 2) Subscribing to a multiple topics
         *  pubsub.subscribe({
         *          'someTopic': function(message) {
         *              //Do something when a message is received
         *          },
         *          'anotherTopic': function(message) {
         *              //Do something when a message is received
         *          }
         *      }, this);
         * </js>
         * 
         * NOTE: Calling this method is equivalent to the following code:
         * <js>pubsub.global().subscribe(topic, callback, thisObj)</js>
         * 
         * @param topic {String} The topic name
         * @param callback {Function} The callback function
         * @param thisObj {Object} The "this" object to use for the callback function
         * 
         * @returns {listeners.ObservableListenerHandle} A handle to remove the subscriber(s)
         * 
         * @see {@link pubsub.Channel#subscribe}
         */
        subscribe: function(topic, callback, thisObj) {
            var global = this.global();
            return global.subscribe.apply(global, arguments);
        },
        
        /**
         * Returns a new {@Link pubsub.Message} object with the provided topic and properties applied.
         * 
         * @param topic {String} The topic name
         * @param props {Object} Properties to apply to the newly created Message object (optional)
         * @returns {pubsub.Message} The newly created Message object.
         */
        createMessage: function(topic, data) {
            return new Message(topic, data);
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
raptor.extend('widgets', function(raptor, widgets) {
    "use strict";
    
    var PROTOTYPE = 'prototype',
        widgetsById = {},
        listeners = raptor.listeners,
        EVENTS = 'events',
        Widget = raptor.require('widgets.Widget'),
        arrayFromArguments = raptor.arrayFromArguments,
        nextWidgetId = 0;
    
    /**
     * The Documentation groups up all widgets rendered in the same template documentat.
     * 
     * @class
     * @anonymous
     *  
     */
    var Document = function(widget) {
        this.widget = widget;
        this.widgetsById = {};
    };
    
    /**
     * 
     */
    Document.prototype = {
        /**
         * 
         * @param widget
         * @param id
         */
        addWidget: function(widget, id) {
            var existing = this.widgetsById[id],
                docWidget = this.widget,
                isArray;
            
            if (id.length > 2 && id.substring(id.length-2) === '[]') {
                id = id.slice(0, -2);
                isArray = true;
            }
            
            if (!existing) {
                this.widgetsById[id] = [widget];
            }
            else {
                existing.push(widget);
            }
            
            if (isArray) {
                (docWidget[id] || (docWidget[id] = [])).push(widget);
            }
            else {
                docWidget[id] = widget;
            }
        },
        
        /**
         * 
         * @param id
         * @returns
         */
        getWidget: function(id) {
            var matching = this.widgetsById[id];
            if (!matching || matching.length === 0) return undefined;
            if (matching.length === 1) return matching[0];
            throw raptor.createError(new Error('getWidget: Multiple widgets found with ID "' + id + '"'));
        },
        
        /**
         * 
         * @param id
         * @returns {Boolean}
         */
        getWidgets: function(id) {
            return this.widgetsById[id] || [];
        }
    };

    return {
        /**
         * 
         * @param {...widgets} widgets An array of widget definitions
         * @returns {void}
         */
        _initAll: function(widgetDefs) {
            var logger = this.logger(),
                docs = {};
            
            var _initWidget = function(widget, config, type) {
                    try
                    {
                        
                        if (widget.initWidget) {
                            widget.initWidget(config);
                        }
                        else {
                            widget.init(config);
                        }
                        
                    }
                    catch(e) {
                        logger.error('Unable to initialize widget of type "' + type + "'. Exception: " + e, e);
                    }
                },
                _initWidgetOnReady = function(widget, config, type) {
                    widget.onReady(function() {
                        _initWidget(widget, config, type);
                    });
                },
                
                _notify = function(name, args) {
                    return this.publish(name, arrayFromArguments(arguments, 1));
                },
                _convertEvents = function(events) {
                    var convertedEvents = {};
                    raptor.forEach(events, function(event) {
                        convertedEvents[event[0]] = {
                            target: event[1],
                            props: event[2]
                        };
                    }, this);
                    return convertedEvents;
                },
                _initWidgets = function(widgetDefs, parentWidget) {
                    if (!widgetDefs) return;
                    
                    var i=0,
                        len = widgetDefs.length,
                        widget;
                    
                    for (; i<len; i++) {
                        
                        var widgetDef = widgetDefs[i], 
                            type = widgetDef[0],
                            id = widgetDef[1],
                            scope = widgetDef[2],
                            assignedId = widgetDef[3],
                            config = widgetDef[4] || {},
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
                        
                        logger.debug('Creating widget of type "' + type + '" (' + id + ')');
                        
                        var originalWidgetClass = raptor.find(type);
                        if (!originalWidgetClass)
                        {
                            throw raptor.createError(new Error('Unable to initialize widget of type "' + type + '". The class for the widget was not found.'));
                        }
                        
                        if (events) {
                            events = _convertEvents(events);
                        }
                        
                        
                        if (originalWidgetClass.initWidget) {
                            config.elId = id;
                            config.events = events;
                            widget = originalWidgetClass;
                            widget.onReady = widgets.onReady;
                        }
                        else {
                            var WidgetClass = Widget._init,
                                proto;

                            WidgetClass[PROTOTYPE] = proto = originalWidgetClass[PROTOTYPE];
                            
                            proto.init = originalWidgetClass;
                            
                            if (!proto._isWidget)
                            {
                                raptor.extend(proto, Widget, false /* don't override */);
                            }
                            
                            widget = new WidgetClass(events);
                            
                            if (!proto.notify) {
                                proto.notify = _notify;
                                proto.on = proto.subscribe;
                            }
                            
                            widget.registerMessages(['beforeDestroy', 'destroy'], false);
                            
                            var allowedEvents = proto[EVENTS] || originalWidgetClass[EVENTS];
    
                            if (allowedEvents) {
                                widget.registerMessages(allowedEvents, false);
                            }
                            
                            widget._id = id;
                            widget._assignedId = assignedId;
                            widgetsById[id] = widget;
                            
                            if (assignedId && scope) {
                                widgetsById[scope]._doc.addWidget(widget, assignedId);
                            }
                            
                            widget._doc = new Document(widget);
                        }
                        
                        
                        if (children && children.length) {
                            _initWidgets(children, widget);
                        }

                        if (widget.initBeforeOnDomReady === true) {
                            _initWidget(widget, config, type);
                        }
                        else {
                            _initWidgetOnReady(widget, config, type);
                        }
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
        
        _nextWidgetId: function() {
            return 'c' + nextWidgetId++;
        }
    };
});

raptor.global.$rwidgets = function() {
    "use strict";
    
    var widgets = raptor.require('widgets');
    widgets._initAll(raptor.arrayFromArguments(arguments));
};
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
 * @borrows listeners.Observable#publish as #publish
 * @borrows listeners.Observable#subscribe as #subscribe
 */
raptor.defineMixin(
    'widgets.Widget',
    { singleton: true }, //The same exact mixins are applied to every widget instance
    function(raptor) {
        "use strict";
        
        var forEach = raptor.forEach,
            listeners = raptor.require('listeners'),
            _destroy = function(widget, removeNode, recursive) {
                var message = {
                        widget: widget
                    },
                    rootEl;
                
                widget.publish('beforeDestroy', message);
                
                //Have the widget unsubscribe from any messages that is currently subscribed to
                listeners.unsubscribeFromAll(widget);
                
                widget.__destroyed = true;
                
                if (removeNode) {
                    //Remove the widget's DOM nodes from the DOM tree if the root element is known
                    rootEl = widget.getRootEl();
                    if (rootEl) {
                        rootEl.parentNode.removeChild(rootEl);
                    }
                }
                
                if (recursive) {
                    forEach(widget.getChildren(), function(childWidget) {
                        _destroy(childWidget, removeNode && !rootEl, true);
                    });
                }
                
                widget.publish('destroy', message);
            };
        
        return {
            
            /**
             * 
             */
            _isWidget: true,
            
            /**
             * 
             * @returns
             */
            _init: function(events) {
                this._children = [];
                this._childrenById = {};
                this._events = events;
            },
            
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
                    raptor.require('pubsub').publish(pubsubEvent.target, props);
                    
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
             * Returns the root element ID for the widget. 
             *
             * @returns
             */
            getRootElId: function() {
                return this.getElId();
            },
    
            /**
             * Returns a raw DOM element for the given widget element ID. If no
             * widget element ID is provided then
             * @param widgetElId
             * @returns {DOMElement} The DOM element
             */
            getEl: function(widgetElId) {
                return document.getElementById(this.getElId(widgetElId));
            },
            
            /**
             * Returns the root DOM element for a widget (or null if not found).
             * 
             * @returns {DOMElement} The root DOM element for the widget
             */
            getRootEl: function() {
                return this.getEl();
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
                var doc = this._doc;
                return doc ? doc.getWidget(nestedWidgetId) : null;
            },
            
            /**
             * Returns an array of nested widgets with the specified widget ID.
             * @param nestedWidgetId
             * @returns {array} An array of nested widgets (or an empty array if none are found)
             */
            getWidgets: function(nestedWidgetId) {
                var doc = this._doc;
                return doc ? doc.getWidgets(nestedWidgetId) : null;
            },
            
            /**
             * 
             * @deprecated Use {@Link widgets.Widget#getWidget} instead
             */
            getChild: function(nestedWidgetId) {
                return this.getWidget(nestedWidgetId);
            },
            
            /**
             * @deprecated Use {@Link widgets.Widget#getWidgets} instead
             */
            getChildren: function(nestedWidgetId) {
                return this.getWidget(nestedWidgetId);
            },
            
            /**
             * Returns the document associated with this widget. The widget document will contain
             * all widgets with an assigned ID declared in the same template.
             * 
             * @returns 
             */
            getDoc: function() {
                return this._doc;
            },
            
            /**
             * 
             * Returns the parent widget instance for this widget.
             * 
             * @returns {widgets.Widget} The parent widget for this widget or null if this widget does not have a parent.
             *
             * @deprecated Do not use this method
             */
            getParent: function() {
                return this._parentWidget;
            },
            
            /**
             * @deprecated Use getWidget instead
             * 
             * @param nestedWidgetId
             * @returns
             */
            getChildWidget: function(nestedWidgetId) {
                return this.getChild(nestedWidgetId);
            },
            
            /**
             * @deprecated Use getWidgets instead
             * @param childWidgetsId
             * @returns
             */
            getChildWidgets: function(childWidgetsId) {
                return this.getChildren.apply(this, arguments);
            },
            
            /**
             * @deprecated Use getParent instead
             * @returns
             */
            getParentWidget: function() {
                return this._parentWidget;
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
                
                _destroy(this, true, true);
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
            }
            
            /**
             * Sends a notification to subscribers using the provided name and arguments.
             * 
             * This method is slightly different from the {@Link widgets.Widget#publish}
             * in that the variable arguments will be passed directly to the subscribers.
             * <b>This method will be removed in the future.</b> 
             * 
             * @function
             * @name notify
             * @param name {String} The message name
             * @param ...args {Object} A variable set of arguments
             * @memberOf widgets.Widget
             * 
             * @deprecated Use {@Link widgets.Widget#publish} instead
             */
            
            /**
             * Subscribes to one or more events. 
             * 
             * This method has been deprecated and is a synonym for the {@Link widgets.Widget#subscribe} method
             * to maintain backwards compatibility.
             * <b>This method will be removed in the future.</b>
             * 
             * @function
             * @name on
             * @memberOf widgets.Widget
             * @deprecated Use {@Link widgets.Widget#subscribe} instead
             */
            
            
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
raptor.extend('widgets', function(raptor) {
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
raptor.extend('widgets.Widget', function(raptor) {
    "use strict";
    
    var idRegExp = /\#(\w+)( .*)?/g,
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
            $(function() {
                callback.call(_this, _this);
            });
        }
    };
});