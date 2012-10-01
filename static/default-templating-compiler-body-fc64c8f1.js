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

$rload(function(raptor) {
    "use strict";
    
    /**
     * @name resources
     * @raptor
     */
    raptor.resources = {
            
        isResource: function(o) {
            return o instanceof raptor.require('resources.Resource');
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

$rload(function(raptor) {
    "use strict";
    
    raptor.defineClass('resources.Resource', function(raptor) {
    
        return {
            /**
             * 
             * @param path
             * @returns {void}
             */
            init: function(searchPathEntry, path) {
                this.setSearchPathEntry(searchPathEntry);
                this.setPath(path);
            },
            
            /**
             * 
             * @param {String} path
             * @returns {void}
             */
            setPath: function(path) {
                this.path = path;
            },
            
            /**
             * Returns the path to the resource.
             * 
             * A path is always normalized so that it uses forward slashes as part
             * separators and it will always being with a forward slash.
             * 
             * @returns {String} The path for the resource
             */
            getPath: function() {
                return this.path;
            },
            
            /**
             * 
             * @returns {Boolean} Returns true if the resource is of type resources.FileResource, false otherwise
             */
            isFileResource: function() {
                return false;
            },
            
            /**
             * 
             * @returns {String} The name of the resource
             */
            getName: function() {
                if (this._name == null)
                {
                    this._name = this.path.substring(this.path.lastIndexOf('/') + 1);
                }
                return this._name;                
            },
            
            /**
             * 
             * @returns
             */
            getSystemPath: function() {
                throw raptor.createError(new Error('getSystemPath() Not Implemented'));
            },
            
            /**
             * 
             * @returns
             */
            readAsString: function(encoding) {
                throw raptor.createError(new Error('Not Implemented'));
            },
            
            /**
             */
            toString: function() {
                return '[' + this.getClass().getName() + ': path=' + this.getPath() + ', systemPath=' + this.getSystemPath() + ']';
            },
            
            /**
             * 
             * @returns
             */
            exists: function() {
                return true;
            },
            
            /**
             * 
             * @param childPath
             * @returns
             */
            findChild: function(childPath) {
                var resources = raptor.resources;
                
                return resources.findResource(
                        resources.joinPaths(this.getPath(), childPath));
            },
            
            /**
             * 
             * @param searchPathEntry
             * @returns
             */
            setSearchPathEntry: function(searchPathEntry) {
                this.searchPathEntry = searchPathEntry;
            },
            
            /**
             * 
             * @returns
             */
            getSearchPathEntry: function() {
                return this.searchPathEntry;
            },
            
            getDirPath: function() {
                if (!this.dirPath) {
                    var resourcePath = this.getPath();
                    var packageDirPathMatches = resourcePath.match(/[\\\/][^\\\/]+$/);
                    this.dirPath = resourcePath.substring(0, packageDirPathMatches.index);
                }
                return this.dirPath;
            },
            
            getParent: function() {
                throw raptor.createError(new Error('getParent() Not Implemented' + this.getClass().getName()));
            },
            
            resolve: function(baseResource, path) {
                throw raptor.createError(new Error('resolve() Not Implemented for ' + this.getClass().getName()));
            }
            
        };
    });
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

$rload(function(raptor) {
    "use strict";
    
    raptor.defineClass(
        'resources.MissingResource', 
        {
            superclass: 'resources.Resource'
        },
        function() {

            var MissingResource = function(path) {
                MissingResource.superclass.constructor.call(this, null, path);
            };
            
            MissingResource.prototype = {
                /**
                 * 
                 * @returns {Boolean} Always returns false
                 */
                exists: function() {
                    return false;
                }
            };
            
            return MissingResource;
        });
});
raptor.define(
    'resources.BrowserResource',
    'resources.Resource',
    function() {
        "use strict";
        
        var BrowserResource = function(searchPathEntry, path, contents) {
            BrowserResource.superclass.constructor.call(this, searchPathEntry, path);
            this.path = path;
            this.contents = contents;
        };
        
        BrowserResource.prototype = {
            readAsString: function() {
                return this.contents;
            },
            
            getSystemPath: function() {
                return this.path;
            }
        };
        
        return BrowserResource;
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

$rload(function(raptor) {
    "use strict";
    
    var logger = raptor.logging.logger('resources'),
        Resource = raptor.require('resources.Resource'),
        MissingResource = raptor.require('resources.MissingResource'),
        BrowserResource = raptor.require('resources.BrowserResource');

    raptor.extend(raptor.resources, {
        
        /**
         * 
         * @param path
         * @returns
         */
        findResource: function(path) {
            if (path instanceof Resource) {
                return path;
            }
            
            var contents = $rget("resource", path);
            if (contents) {
                return new BrowserResource(null, path, contents);
            }
            else {
                return new MissingResource(path);
            }
        }
    });
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

$rload(function(raptor) {
    "use strict";
    
    var simpleSpecial = {
        "*": ".*?",
        "?": ".?"
    };
    
    /**
     * @namespace
     * @raptor
     * @name regexp
     */
    raptor.regexp = {
        
        /**
         * Escapes special regular expression characters in a string so that the resulting string can be used
         * as a literal in a constructed RegExp object.
         * 
         * Example:
         * <js>
         * strings.escapeRegExp("hello{world}");
         * //output: "hello\{world\}"
         * </js>
         * @param str The string to escape
         * @returns {String} The string with all special regular expression characters escaped
         */
        escape: function(str) {
            return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        },
        
        /**
         * Converts a string consisting of two types of wildcards to a regular expression:
         * Question Mark (?) - Represents a single character that can be any character
         * Asterisk (*) - This represents any sequence of characters 
         * 
         * @param {String} str The string that represents the simple regular expression
         * @return {RegExp} The resulting regular expression
         */
        simple: function(str) {
            var _this = this;
            
            return new RegExp("^" + str.replace(/[\*\?]|[^\*\?]*/g, function(match) {
                return simpleSpecial[match] || _this.escape(match);
            }) + "$");
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

raptor.define(
    'json.stringify',
    function() {
        "use strict";
        
        var strings = raptor.require('strings'),
            unicodeEncode = strings.unicodeEncode, //Pick up the unicodeEncode method from the strings module
            COMMA = ',',        
            NULL = 'null',
            ARRAY = Array,
            SPECIAL = /([^ -~]|(["'\\]))/g,
            REPLACE_CHARS = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',         
                '\\': '\\\\'
            },
            _zeroPad = function(v) {
                return v < 10 ? '0' + v : v;
            },
            encodeDate = function (d) {
        
                return d.getUTCFullYear()            + '-' +
                       _zeroPad(d.getUTCMonth() + 1) + '-' +
                       _zeroPad(d.getUTCDate())      + 'T' +
                       _zeroPad(d.getUTCHours())     + ":" +
                       _zeroPad(d.getUTCMinutes())   + ":" +
                       _zeroPad(d.getUTCSeconds())   + 'Z';
            };
        
        return {
            /**
             * 
             * @param o
             * @param options
             * @returns
             */
            stringify: function(o, options) {
                if (!options) {
                    options = {};
                }
                
                var specialRegExp = options.special || SPECIAL;
                
                var buffer = strings.createStringBuilder(),
                    append = function(str) {
                        buffer.append(str);           
                    },
                    useSingleQuote = options.useSingleQuote === true,
                    strChar = useSingleQuote === true ? "'" : '"',
                    encodeString = function(s) {
                        return strChar + 
                            s.replace(specialRegExp, function(c) {
                                if (c === '"') {
                                    return useSingleQuote ? '"' : '\\"';
                                }
                                else if (c === "'") {
                                    return useSingleQuote ? "\\'" : "'";
                                }
                                var replace = REPLACE_CHARS[c];        
                                return replace || unicodeEncode(c);
                            }) + 
                            strChar;
                    },
                    serialize = function(o) {                
                        if (o == null)
                        {
                            append(NULL);
                            return;                    
                        }
                        
                        var constr = o.constructor, i, len;
                        if (o === true || o === false || constr === Boolean)
                        {
                            append(o.toString());                    
                        }
                        else if (constr === ARRAY)
                        {
                            append('[');
                            
                            len = o.length;
                            for (i=0; i<len; i++)
                            {
                                if (i !== 0)
                                {
                                    append(COMMA);                                            
                                }
                                
                                serialize(o[i]);
                            }
                            
                            append(']');
                        }
                        else if (constr === Date)
                        {
                            append(encodeDate(o));
                        }
                        else
                        {
                            var type = typeof o;
                            switch(type)
                            {
                                case 'string':
                                    append(encodeString(o));
                                    break;
                                case 'number':
                                    append(isFinite(o) ? o + '' : NULL);
                                    break;
                                case 'object':                            
                                    append('{');
                                    var first = true, v;                                
                                    for (var k in o)
                                    {
                                        if (o.hasOwnProperty(k))
                                        {
                                            v = o[k];
                                            if (v == null) continue;
                                            
                                            if (first === false)
                                            {
                                                append(COMMA);                                            
                                            }
                                            else
                                            {
                                                first = false;
                                            }
                                            
                                            append(encodeString(k));
                                            append(":");
                                            serialize(v);                                        
                                        }
                                    }
                                    append('}'); 
                                    break;
                                default:
                                    append(NULL);                
                            }
                        }
                    };
                    
                serialize(o);            
                return buffer.toString();  
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

raptor.define(
    "xml.dom",
    function() {
        "use strict";
        
        return {
            
            /**
             * 
             * @param options
             * @returns
             */
            createParser: function(options) {
                var DomParser = raptor.require("xml.dom.DomParser");
                return new DomParser(options);
            }
        };
        
    });
raptor.defineClass(
    'xml.dom.DomParser',
    function(raptor) {
        "use strict";
        
        var DomParser = function(options) {
            
        };
        
        DomParser.prototype = {
                
            parse: function(xmlSrc) {
                try
                {
                    var xmlDoc = $.parseXML(xmlSrc);
                    return xmlDoc;
                }
                catch(e) {
                    throw new Error("Invalid XML");
                }
            }
        };
        
        return DomParser;
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

raptor.define(
    "xml.sax",
    function() {
        "use strict";
        
        return {
            
            /**
             * 
             * @param options
             * @returns
             */
            createParser: function(options) {
                options = options || {};
                
                if (options.dom) {
                    return this.createParserForDom(options);
                }
                
                var SaxParser = raptor.find("xml.sax.SaxParser") || raptor.find("xml.sax.SaxParserDom");
                return new SaxParser(options);
            },
            
            createParserForDom: function(options) {
                var SaxParser = raptor.require("xml.sax.SaxParserDom");
                return new SaxParser(options);
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

raptor.defineClass(
    "xml.sax.BaseSaxParser",
    function() {
        "use strict";
        
        var listeners = raptor.require("listeners"),
            arrayFromArguments = raptor.arrayFromArguments;
        
        var BaseSaxParser = function() {
            this.observable = listeners.createObservable(['startElement', 'endElement', 'characters', 'comment', 'error']);
        };
        
        BaseSaxParser.prototype = {
            on: function(events, thisObj) {
                this.observable.subscribe.apply(this.observable, arguments);
            },
            
            _startElement: function(el) {
                this.observable.publish("startElement", el);
            },
            
            _endElement: function(el) {
                this.observable.publish("endElement", el);
            },
            
            _characters: function(text) {
                //Normalize EOL sequence...
                text = text.replace(/\r\n|\r/g, "\n");
                this.observable.publish("characters", text);
            },
            
            _comment: function(comment) {
                this.observable.publish("comment", comment);
            },
            
            _error: function() {
                var args = arrayFromArguments(arguments);
                this.observable.publish("error", args);
            },
            
            getPos: function() {
                return "(unknown)";
            }
        };
        
        return BaseSaxParser;
        
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

raptor.define(
    "xml.dom-to-sax",
    function() {
        "use strict";
        
        var Attribute = function(node) {
            this.node = node;
        };
        
        Attribute.prototype = {

            getNamespaceURI: function() {
                return this.node.namespaceURI || '';
            },

            getLocalName: function() {
                return this.node.localName;
            },

            getQName: function() {
                return this.node.prefix ? this.node.prefix + ':' + this.node.localName : this.node.localName;
            },

            getValue: function() {
                return this.node.nodeValue;
            },
            
            getPrefix: function() {
                return this.node.prefix;
            },
            
            toString: function() {
                return "[Attribute: " + 
                    "uri=" + this.getNamespaceURI() + 
                    ", qName=" + this.getQName() +
                    ", value=" + this.getValue() + "]";
            }
        };
        
        var Element = function(node) {
            this.node = node;
        };
        
        Element.prototype = {

            getNamespaceURI: function() {
                return this.node.namespaceURI || '';
            },

            getLocalName: function() {
                return this.node.localName;
            },

            getQName: function() {
                return this.node.prefix ? this.node.prefix + ':' + this.node.localName : this.node.localName;
            },

            getPrefix: function() {
                return this.node.prefix || '';
            },
            
            getAttributes: function() {
                var attributes = this.attributes;
                if (!attributes) {
                    attributes = this.attributes = [];
                
                    var attrMap = this.node.attributes;
                    
                    for (var i=0, len=attrMap.length; i<len; i++) {
                        attributes.push(new Attribute(attrMap.item(i)));
                    }
                }
                
                return attributes;
            },
            
            getNamespaceMappings: function() {
                var mappings = this._namespaceMappings;
                if (!mappings) {
                    mappings = this._namespaceMappings = {};
                    
                    raptor.forEach(this.getAttributes(), function(attr) {
                        if (attr.getPrefix() === 'xmlns') {
                            mappings[attr.getLocalName()] = attr.getValue();
                        }
                    }, this);
                }
                
                return mappings;
                
            },
            
            toString: function() {
                var attributes = [];
                raptor.forEach(this.getAttributes(), function(attr) {
                    attributes.push(attr.toString());
                }, this);
                attributes = attributes.join(", ");
                
                return "[Element: uri=" + this.getNamespaceURI() + ", localName=" + this.getLocalName() + ", qName=" + this.getQName() + ", prefix=" + this.getPrefix() + ", attributes=[" + attributes + "], ns=" + JSON.stringify(this.getNamespaceMappings()) + "]";
            }
        };
        
        return {
            
            /**
             * 
             * @param node
             * @param handlers
             * @returns
             */
            domToSax: function(node, handlers, thisObj) {
                var observable = raptor.require('listeners').createObservable(['startElement', 'endElement', 'comment', 'characters'], true);
                observable.subscribe(handlers, thisObj);
                
                var _text = function(node) {
                        observable.characters(node.nodeValue);
                    },
                    _comment = function(node) {
                        observable.comment(node.nodeValue);
                    },
                    
                    _element = function(node) {
                        var el = new Element(node);
                        observable.startElement(el);
                        var childNodes = node.childNodes,
                            len = childNodes.length;
                        for (var i=0; i<len; i++) {
                            var childNode = childNodes[i];
                            _node(childNode);
                        }
                        
                        observable.endElement(el);
                    },
                    _node = function(node) {
                        switch(node.nodeType) {
                            case 1: _element(node); break;                   //Element
                            case 2: break;                      //Attribute
                            case 3: _text(node); break;     //CDATA
                            case 4: _text(node); break;     //Text
                            case 5: _text(node); break;     //Entity reference
                            case 6: _text(node); break;     //Entity node
                            case 7: break;                      //Processing instruction
                            case 8: _comment(node); break;     //Comment node
                            case 9: _element(node.documentElement); break;     //Document node
                        }
                    };
                
                _node(node);
            }
        };
        
    });
raptor.defineClass(
    'xml.sax.SaxParserDom',
    'xml.sax.BaseSaxParser',
    function(raptor) {
        "use strict";
        
        var SaxParserDom = function(xmlDoc) {
            SaxParserDom.superclass.constructor.call(this);
        };
        
        SaxParserDom.prototype = {
            parse: function(xmlSrc, filePath) {
                var xmlDoc;
                if (xmlSrc.documentElement) {
                    xmlDoc = xmlSrc;
                }
                else {
                    var parser = raptor.require('xml.dom').createParser();
                    xmlDoc = parser.parse(xmlSrc, filePath);    
                }
                
                raptor.require('xml.dom-to-sax').domToSax(xmlDoc.documentElement, {
                    
                    startElement: this._startElement,
                    
                    endElement: this._endElement,
                    
                    comment: this._comment,
                    
                    characters: this._characters
                }, this);
            }
        };
        
        return SaxParserDom;
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

$rload(function (raptor) {
    "use strict";
    
    /**
     * Utility module for working with JavaScript arrays.
     *  
     * @namespace
     * @raptor
     * @name arrays
     *
     * @borrows raptor.forEach as forEach
     * @borrows raptor.isArray as isArray
     * @borrows raptor.arrayFromArguments as fromArguments
     */
    raptor.arrays = {

        forEach: raptor.forEach,

        isArray: raptor.isArray,

        fromArguments: raptor.arrayFromArguments,
        
        /**
         * Concatenates multiple arrays into a single array.
         * 
         * <p>
         * Example:
         * <js>
         * var result = arrays.concatArrays([1, 2], [3, 4]);
         * //result = [1, 2, 3, 4]
         * </js>
         * 
         * </p>
         * @param {...[Array]} arrays A variable number of Array objects as parameters 
         * @returns {Array}
         */
        concatArrays: function(arrays)
        {
            var result = [],
                i=0,
                len=arguments.length,
                a;
            for (; i<len; i++)
            {
                a = arguments[i];
                if (a != null)
                {
                    result = result.concat.apply(result, a);
                }
            }

            return result;
        },
        
        pop: function(array) {
            var last = this.peek(array);
            array.splice(array.length-1, 1);
            return last;
        },
        
        peek: function(array) {
            return array && array.length ? array[array.length-1] : undefined;
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

raptor.define(
    'xml.sax.object-mapper',
    function(raptor) {
        "use strict";
        
        var forEach = raptor.forEach,
            sax = raptor.require("xml.sax"),
            forEachEntry = raptor.forEachEntry,
            arrays = raptor.require("arrays"),
            strings = raptor.require("strings"),
            STRING = "string",
            BOOLEAN = "boolean",
            OBJECT = "object",
            getSchema = function(el, nodeType, parentSchema) {
                var lookupSchema = function(key) {
                    var schema;
                    
                    if (nodeType === 'attribute') {
                        schema = parentSchema['@' + key];
                    }
                    else if (nodeType === 'element') {
                        schema = parentSchema['<' + key + '>'];
                    }
                    if (!schema) {
                        schema = parentSchema[key];
                    }
                    return schema;
                };
                
                var uri = el.getNamespaceURI(),
                    schema;
                
                if (uri) {
                    schema = lookupSchema(uri + ":" + el.getLocalName());
                    if (!schema) {
                        schema = lookupSchema(uri + ":*");                                        
                    }
                }
                else {
                    schema = lookupSchema(el.getLocalName());
                }
                
                if (!schema) {
                    schema = lookupSchema("*");                                        
                }
                
                if (typeof schema === 'function') {
                    schema = schema(el, nodeType);
                }
                
                return schema;
            },
            _expected = function(parentSchema, isAttribute) {
                var expected = [];
                //console.log(curType);
                forEachEntry(parentSchema, function(key, value) {
                    if (strings.startsWith(key, "_")) {
                        return;
                    }
                    
                    if (isAttribute && value._type === OBJECT) {
                        return;
                    }
                    
                    expected.push(isAttribute ? key : key.charAt(0) === '<' ? key : "<" + key + ">");
                    
                }, this);
                return '[' + expected.join(', ') + ']';
            };
        
        var Reader = function(schema, options) {
            if (!options) {
                options = {};
            }
            this.skipping = false;
            this.options = options;
            this.trimText = options.trimText !== false;
            this.contextStack = [];
            this.schema = schema;
        };
        
        Reader.prototype = {
            _parseProp: function(value, context) {
                var parsePropFunc = this.options.parseProp;
                
                if (parsePropFunc) { //If a property parser is provide then invoke that to get the actual text
                    value = parsePropFunc(value, context);
                }
                return value;
            },
            
            _setProperty: function(el, schema, targetObject, value, context) {
                if (typeof value === 'string') {
                    if (this.trimText) { //Trim the text if that option is enabled
                        value = strings.trim(value);
                    }
                    
                    value = this._parseProp(value, context);
                    
                    if (schema._type === BOOLEAN) {
                        /*
                         * Convert the text to a boolean value
                         */
                        value = value.toLowerCase();
                        value = value === 'true' || value === 'yes';
                    }
                }
                
                var propertyName = schema._targetProp;
                if (!propertyName && this.options.defaultTargetProp) {
                    propertyName = this.options.defaultTargetProp(context);
                }
                
                if (!propertyName) {
                    propertyName = (typeof el === 'string' ? el : (el.getNamespaceURI() ? el.getNamespaceURI() + ":" + el.getLocalName() : el.getLocalName()));
                }
                
                if (schema._set) {
                    schema._set(targetObject, propertyName, value, context);
                }
                else {
                    var setter = 'set' + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);
                    if (targetObject[setter]) {
                        targetObject[setter](value);
                    }
                    else {
                        targetObject[propertyName] = value;    
                    }
                    
                }
            },
                
            skipCurrentElement: function() {
                if (this.skipping) {
                    return;
                }
                
                var context = this.getCurrentContext();
                context.skip = true;
                this.skipping = true;
            },
            
            error: function(message) {
                throw raptor.createError(new Error(message + " (" + this.saxParser.getPos() + ")"));
            },
            
            getCurrentContext: function() {
                return arrays.peek(this.contextStack);
            },
            
            read: function(xmlSrc, filePath) {
                
                this.saxParser = sax.createParser({
                    trim: true,
                    normalize: true
                });
                
                this.contextStack = [];
                this.skipping = false;
                
                var _this = this,
                    rootObject,
                    saxParser = this.saxParser;
                
                saxParser.on({
                    error: function (e) {
                        _this.error(e);
                    },
                    
                    startElement: function (el) {
                        var parentContext = _this.getCurrentContext(),
                            parentSchema = parentContext ? parentContext.schema : _this.schema,
                            curSchema;
                        
                        var context = {
                           el: el, 
                           name: el.getQName(),
                           tagName: el.getLocalName(),
                           localName: el.getLocalName(),
                           uri: el.getNamespaceURI(),
                           parentContext: parentContext
                        };
                        
                        _this.contextStack.push(context);
                        
                        if (_this.skipping) {
                            return;
                        }
                        
                        context.schema = curSchema = getSchema(el, "element", parentSchema);
                            
                        if (!curSchema) {
                            _this.error("Unexpected element: <" + el.getQName() + ">. Expected one of: " + _expected(parentSchema));
                        }
                        
                        if (curSchema._type === STRING || curSchema._type === BOOLEAN) {
                            if (curSchema._begin) {
                                curSchema._begin(parentContext ? parentContext.object : null, context);
                            }
                        }
                        else if (curSchema._type === OBJECT) {
                            
                            context.object = curSchema._begin ? curSchema._begin(parentContext ? parentContext.object : null, context) || {} : {};
                            if (!context.object) {
                                throw new Error('_begin() for "' + el.getLocalName() + '" did not return an object.');
                            }
                        }
                        
                        if (!_this.skipping) {
                            var attrs = el.getAttributes();
                            
                            for (var i=0, len=attrs.length, attr; i<len; i++) {
                                attr = attrs[i];
                                if (_this.skipping) {
                                    break;
                                }
                                
                                var attrSchema = getSchema(attr, "attribute", curSchema);
                                if (!attrSchema) {
                                    _this.error("Unexpected attribute: " + attr.getQName() + ". Expected one of: " + _expected(curSchema, true));
                                }
                                
                                var attrContext = raptor.extend({}, context);
                                attrContext.attr = attr;
                                attrContext.localName = attr.getLocalName();
                                attrContext.uri = attr.getNamespaceURI();
                                attrContext.name = attr.getQName();
                                _this._setProperty(
                                        attr, //Current attribute
                                        attrSchema,  //Schema associated with the attribute
                                        context.object,  //Target object
                                        attr.getValue(),  //The value of the property
                                        attrContext); //The context for the attribute
                                
                            }
                        }
                    },
    
                    characters: function (text) {
                        if (_this.skipping === true) {
                            return;
                        }
                        
                        var context = _this.getCurrentContext();
                        context.text = context.text ? context.text + text : text;
                    },
    
                    endElement: function () {
                        
                        var context = _this.getCurrentContext(),
                            parentContext = context.parentContext,
                            curSchema = context.schema;
                        
                        if (_this.skipping !== true) {
                            
                            if (curSchema._type === STRING || curSchema._type === BOOLEAN) {
                                
                                _this._setProperty(context.el, curSchema, parentContext ? parentContext.object : null, context.text, context);
                                
                                if (curSchema._end) {
                                    curSchema._end(context.object, parentContext ? parentContext.object : null, context);
                                }
                            }
                            else if (curSchema._type === OBJECT) {
                                
                                if (context.text != null && strings.trim(context.text)) {
                                    if (curSchema._text) {
                                        _this._setProperty("text", curSchema._text, context.object, context.text, context);
                                    }
                                    else if (curSchema._setText) {
                                        curSchema._setText(context.object, _this._parseProp(context.text, context));
                                    }
                                    else {
                                        _this.error("Unexpected text: " + context.text);
                                    }
                                }
                                if (curSchema._end) {
                                    curSchema._end(context.object, parentContext ? parentContext.object : null, context);
                                }
                                
                                if (curSchema._targetProp) {
                                    _this._setProperty(context.el, curSchema, parentContext ? parentContext.object : null, context.object);                                    
                                }
                                
                            }
                            else if (curSchema._type) {
                                throw new Error("Invalid type: " + curSchema._type);
                            }
                        } //End: this.skipping !== true
                        
                        if (_this.contextStack.length === 1) {
                            rootObject = context.object;
                        }
                        
                        arrays.pop(_this.contextStack);
                        
                        if (context.skip === true) {
                            _this.skipping = false;
                        }
                    }
                });
                
                saxParser.parse(xmlSrc, filePath);
                
                return rootObject;
            }
        };
        
        return {
            createReader: function(schema, options) {
                return new Reader(schema, options);
            },
            
            read: function(xmlSrc, filePath, schema, options) {
                return this.createReader(schema, options).read(xmlSrc, filePath);
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

raptor.defineClass(
    'templating.compiler.Expression',
    function() {
        "use strict";
        
        var operatorsRegExp = /"(?:[^"]|\\")*"|'(?:[^']|\\')*'|\s+(?:and|or|lt|gt|eq|ne|lt|gt|ge|le)\s+/g,
            strings = raptor.require('strings'),
            replacements = {
                "and": " && ",
                "or": " || ",
                "eq": " === ",
                "ne": " !== ",
                "lt": " < ",
                "gt": " > ",
                "ge": " >= ",
                "le": " <= "
            },
            handleBinaryOperators = function(str) {
                return str.replace(operatorsRegExp, function(match) {
                    return replacements[strings.trim(match)] || match;
                });
            };
        
        var Expression = function(expression, replaceSpecialOperators) {
            if (expression == null) {
                throw raptor.createError(new Error("expression argument is required"));
            }
            
            if (replaceSpecialOperators !== false && typeof expression === 'string') {
                expression = handleBinaryOperators(expression);
            }
            this.expression = expression;
        };
        
        Expression.prototype = {
            /**
             * 
             * @returns
             */
            getExpression: function() {
                return this.expression;
            },
            
            /**
             */
            toString: function() {
                return this.expression.toString();
            }
        };
        
        return Expression;
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

raptor.defineClass(
    'templating.compiler.ExpressionParser',
    function(raptor) {        
        "use strict";
        
        
        var Expression = raptor.require('templating.compiler.Expression'),
            strings = raptor.require('strings'),
            stringify = raptor.require('json.stringify').stringify,
            regexp = raptor.require('regexp'),
            endingTokens = {
//                "{": "}",
                "${": "}",
                "{%": "%}",
                "{?": "}",
                "$": null
            },
            createStartRegExpStr = function(starts) {
                var parts = [];
                
                raptor.forEach(starts, function(start) {
                    parts.push(regexp.escape("\\\\" + start));
                    parts.push(regexp.escape("\\" + start));
                    parts.push(regexp.escape(start));
                });

                return parts.join("|");
            },
            startRegExpStr = createStartRegExpStr(["{%", "${", "$", "{?"]),
            createStartRegExp = function() {
                return new RegExp(startRegExpStr, "g");
            },
            variableRegExp = /^([_a-zA-Z]\w*)/g,
            getLine = function(str, pos) {
                var lines = str.split("\n");
                var index = 0;
                
                var line;
                
                while (index < lines.length) {
                    line = lines[index];
                    if (pos - line.length+1 < 0) {
                        break;
                    }
                    else {
                        pos -= line.length+1;
                    }
                    index++;
                }
                
                return {
                    str: line,
                    pos: pos
                };
            },
            errorContext = function(str, pos, length) {
                
                var line = getLine(str, pos);
                pos = line.pos;
                str = line.str;
                
                var start = pos - length,
                    end = pos + length,
                    i;
                
                if (start < 0) {
                    start = 0;
                }
                
                if (end > str.length) {
                    end = str.length;
                }
                
                var prefix = "...";
                var suffix = "...";
                
                var context = "\n" + prefix + str.substring(start, end) + suffix + "\n";
                for (i=0; i<prefix.length; i++) {
                    context += " ";
                }
                for (i=start; i<end; i++) {
                    context += i === pos ? "^" : " ";
                }
                for (i=0; i<suffix.length; i++) {
                    context += " ";
                }
                return context;
            }, 
            getConditionalExpression = function(expression) {
                var tokensRegExp = /"(?:[^"]|\\")*"|'(?:[^']|\\')*'|\\\\;|\\;|[\{\};]/g,
                    matches,
                    depth = 0;
                
                var parts = [],
                    partStart = 0;
                
                while((matches = tokensRegExp.exec(expression))) {
                    if (matches[0] === '{') {
                        depth++;
                        continue;
                    }
                    else if (matches[0] === '}') {
                        if (depth !== 0) {
                            depth--;
                            continue;
                        }
                    }
                    else if (matches[0] === '\\\\;') { 
                        /*
                         * 1) Convert \\; --> \;
                         * 2) Start searching again after the single slash 
                         */
                        expression = expression.substring(0, matches.index) + '\\;' + expression.substring(tokensRegExp.lastIndex);
                        tokensRegExp.lastIndex = matches.index + 1;
                        continue;
                    }
                    else if (matches[0] === '\\;') { 
                        /*
                         * 1) Convert \; --> ;
                         * 2) Start searching again after the semocolon 
                         */
                        expression = expression.substring(0, matches.index) + ';' + expression.substring(tokensRegExp.lastIndex);
                        tokensRegExp.lastIndex = matches.index + 1;
                        continue;
                    }
                    else if (matches[0] === ';') {
                        if (depth === 0) {
                            parts.push(expression.substring(partStart, matches.index));
                            partStart = tokensRegExp.lastIndex;    
                        }
                    }
                }
                
                if (partStart < expression.length-1) {
                    parts.push(expression.substring(partStart));
                }

                
                var getExpression = function(part) {
                    var expressionParts = [];
                    
                    ExpressionParser.parse(part, {
                        text: function(text) {
                            expressionParts.push(stringify(text));
                        },
                        
                        expression: function(expression) {
                            expressionParts.push(expression);
                        }
                    });
                    
                    return expressionParts.join('+');
                };
                
                if (parts.length === 2) {
                    return "(" + parts[0] + " ? " + getExpression(parts[1]) + " : '')";    
                }
                else if (parts.length === 3) {
                    return "(" + parts[0] + " ? " + getExpression(parts[1]) + " : " + getExpression(parts[2]) + ")";
                }
                else {
                    throw new Error('Invalid simple conditional of "' + expression + '". Simple conditionals should be in the form {?<expression>;<true-template>[;<false-template>]}');
                }
                
            };
        
            
        /**
         * 
         */
        var ExpressionParserHelper = raptor.defineClass(function() {
            return {
                init: function(callback, callbackThisObj) {
                    this.callback = callback;
                    this.callbackThisObj = callbackThisObj;
                    
                    this.text = '';
                },
                
                _invokeCallback: function(name, arg) {
                    if (!this.callback[name]) {
                        throw raptor.createError(new Error(name + " not allowed: " + arg));
                    }
                    
                    this.callback[name].call(this.callbackThisObj, arg);
                },
                
                _endText: function() {
                    if (this.text) {
                        this._invokeCallback("text", this.text);
                        this.text = '';
                    }
                },
                
                add: function(type, value) {
                    if (type === 'text') {
                        this.addText(value);
                    }
                    else {
                        this._endText();
                        this._invokeCallback(type, value);    
                    }
                },
                
                /**
                 * 
                 * @param newText
                 * @returns
                 */
                addText: function(newText) {
                    this.text += newText;
                },
                
                /**
                 * 
                 * @param expression
                 * @returns
                 */
                addExpression: function(expression) {
                    this._endText();
                    
                    
                    if (!(expression instanceof Expression)) {
                        expression = new Expression(expression);
                    }

                    this._invokeCallback("expression", expression);
                },
                
                /**
                 * 
                 * @param scriptlet
                 * @returns
                 */
                addScriptlet: function(scriptlet) {
                    this._endText();
                    this._invokeCallback("scriptlet", scriptlet);
                }
            };
        });
            
        var ExpressionParser = function() {
            
        };
        
        
        /**
         * @memberOf templating.compiler$ExpressionParser
         * 
         * @param str
         * @param callback
         * @param thisObj
         */
        ExpressionParser.parse = function(str, callback, thisObj, options) {
            if (!options) {
                options = {};
            }
            
            var textStart = 0, //The index of the start of the next text block
                textEnd, //The index of the current text block
                startMatches, //The matches found when searching for the possible start tokens
                endMatches, //The matches found when searching through special expression tokens
                expressionStart, //The index of the start of the current expression
                expression, //The current expression string
                isScriptlet, //If true, then the expression is a scriptlet,
                isConditional, //If true, then the expression is a conditional (i.e. {?<expression>;<true-template>[;<false-template>]}
                startToken, //The start token for the current expression
                custom = options.custom || {},
                handleError = function(message) {
                    if (callback.error) {
                        callback.error.call(thisObj, message);
                        return;
                    }
                    else {
                        throw raptor.createError(new Error(message));
                    }
                };
                
            var startRegExp = createStartRegExp();
            
            var helper = new ExpressionParserHelper(callback, thisObj);
            
            startRegExp.lastIndex = 0;
            
            /*
             * Look for any of the possible start tokens (including the escaped and double-escaped versions)
             */
            outer:
            while((startMatches = startRegExp.exec(str))) {
                
                if (strings.startsWith(startMatches[0], "\\\\")) { // \\${
                    /*
                     * We found a double-escaped start token.
                     * 
                     * We found a start token that is preceeded by an escaped backslash...
                     * The start token is a valid start token preceded by an escaped
                     * backslash. Add a single black slash and handle the expression
                     */
                    textEnd = startMatches.index + 1; //Include everything up to and include the first backslash as part of the text
                    startToken = startMatches[0].substring(2); //Record the start token
                    expressionStart = startMatches.index + startMatches[0].length; //The expression starts after the start token
                }
                else if (strings.startsWith(startMatches[0], "\\")) { // \${
                    /*
                     * We found a start token that is escaped. We should
                     * add the unescaped start token to the text output.
                     */
                    helper.addText(str.substring(textStart, startMatches.index)); //Add everything preceeding the start token
                    helper.addText(startMatches[0].substring(1)); //Add the start token excluding the initial escape character
                    textStart = startRegExp.lastIndex; // The next text block we find will be after this match
                    continue;
                }
                else if (endingTokens.hasOwnProperty(startMatches[0])) {
                    /*
                     * We found a valid start token 
                     */
                    startToken = startMatches[0]; //Record the start token
                    textEnd = startMatches.index; //The text ends where the start token begins
                }
                else {
                    throw raptor.createError(new Error("Illegal state. Unexpected start token: " + startMatches[0]));
                }

                expressionStart = startRegExp.lastIndex; //Expression starts where the start token ended

                if (textStart !== textEnd) { //If there was any text between expressions then add it now
                    helper.addText(str.substring(textStart, textEnd));
                }
                
                var endToken = endingTokens[startToken]; //Look up the end token
                if (!endToken) { //Check if the start token has an end token... not all start tokens do. For example: $myVar
                    variableRegExp.lastIndex = 0;
                    var variableMatches = variableRegExp.exec(str.substring(expressionStart)); //Find the variable name that follows the starting "$" token
                    
                    if (!variableMatches) { //We did not find a valid variable name after the starting "$" token
                        //handleError('Invalid simple variable expression. Location: ' + errorContext(str, expressionStart, 10)); //TODO: Provide a more helpful error message
                        helper.addText(startMatches[0]);
                        startRegExp.lastIndex = textStart = expressionStart;
                        continue outer;
                    }
                    
                    var varName = variableMatches[1];
                    helper.addExpression(varName); //Add the variable as an expression
                    startRegExp.lastIndex = textStart = expressionStart = expressionStart + varName.length;
                    
                    continue outer;
                }
                
                
                isScriptlet = startToken === "{%";
                isConditional = startToken === '{?';
                
                var endRegExp = /"((?:[^"]|\\")*)"|'((?:[^']|\\')*)'|\%\}|[\{\}]/g;
                //Now we need to find the ending curly
                endRegExp.lastIndex = expressionStart; //Start searching from where the expression begins
                
                var depth = 0;
                
                var foundStrings = [];
                
                while((endMatches = endRegExp.exec(str))) {
                    if (endMatches[0] === '{') {
                        depth++;
                        continue;
                    }
                    else if (endMatches[0] === '}') {
                        if (isScriptlet) {
                            continue;
                        }
                        
                        if (depth !== 0) {
                            depth--;
                            continue;
                        }
                    }
                    else if (endMatches[0] === '%}') {
                        if (!isScriptlet) {
                            handleError('Ending "' + endMatches[0] + '" token was found but matched with starting "' + startToken + '" token. Location: ' + errorContext(str, endMatches.index, 10));
                        }
                    }
                    else {
                        if (endMatches[0].charAt(0) === "'" || endMatches[0].charAt(0) === '"') {
                            foundStrings.push({
                                start: endMatches.index - expressionStart,
                                end: endMatches.index + endMatches[0].length - expressionStart,
                                value: endMatches[0].slice(1,-1),
                                json: endMatches[0],
                                quote: endMatches[0].charAt(0)
                            });
                        }
                        continue;
                    }
                    
                    //console.log("EXPRESSION: " + str.substring(firstCurly+1, endMatches.index));
                    expression = str.substring(expressionStart, endMatches.index);
                    
                    
                    var handler;
                    
                    if (startToken === "${") {
                        var firstColon = expression.indexOf(":"),
                            customType;
                        if (firstColon != -1) {
                            customType = expression.substring(0, firstColon);
                            
                            handler = custom[customType] || ExpressionParser.custom[customType];
                            if (handler) {
                                handler.call(ExpressionParser, expression.substring(firstColon+1), helper);
                            }
                        }
                    }
                    
                    
                    
                    if (!handler) {
                        if (isScriptlet) {
                            helper.addScriptlet(expression);
                        }
                        else if (isConditional) {
                            helper.addExpression(getConditionalExpression(expression));
                        }
                        else {
                            
                            if (foundStrings.length) {
                                for (var i=foundStrings.length-1; i>=0; i--) {
                                    var foundString = foundStrings[i];
                                    
                                    if (!foundString.value) {
                                        continue;
                                    }
                                    
                                    var hasExpression = false,
                                        parts = [];

                                    ExpressionParser.parse(foundString.value, {
                                        text: function(text) {
                                            parts.push(foundString.quote + text + foundString.quote);
                                        },
                                        
                                        expression: function(expression) {
                                            hasExpression = true;
                                            parts.push(expression);
                                        }
                                    });

                                    if (hasExpression) {
                                        expression = expression.substring(0, foundString.start) + "(" + parts.join('+') + ")" + expression.substring(foundString.end);
                                    }
                                }
                            }
                            helper.addExpression(expression);
                        }
                        
                    }
                    
                    startRegExp.lastIndex = endRegExp.lastIndex; //Start searching from where the end token ended
                    textStart = endRegExp.lastIndex;
                    
                    //console.log('Found ending curly. Start index now: ' + searchStart);
                    continue outer;
                    
                }
                
                handleError('Ending "' + endingTokens[startToken] + '" token not found for "' + startToken + '" token. Location: ' + errorContext(str, startMatches.index, 10) + "\n");
            }
            
            if (textStart !== str.length) {
                helper.addText(str.substring(textStart, str.length));
            }
            
            //console.log("Loop ended");
            helper._endText();
        };
        
        ExpressionParser.custom = {
            "xml": function(expression, helper) {
                expression = new Expression(expression);
                expression.escapeXml = false;
                helper.addExpression(expression);
            },
            "entity": function(expression, helper) {
                helper.addText("&" + expression + ";");
            },
            "startTag": function(expression, helper) {
                helper.addText("<" + expression + ">");
            },
            "endTag": function(expression, helper) {
                helper.addText("</" + expression + ">");
            },
            "newline": function(expression, helper) {
                helper.addText("\n");
            }
        };
        
        return ExpressionParser;
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

raptor.defineClass(
    'templating.compiler.TypeConverter',
    function(raptor) {
        "use strict";
        
        var ExpressionParser = raptor.require('templating.compiler.ExpressionParser'),
            stringify = raptor.require('json.stringify').stringify,
            Expression = raptor.require('templating.compiler.Expression');
        
        var TypeConverter = function() {
            
        };
        
        TypeConverter.convert = function(value, targetType, allowExpressions) {
            
            
            var hasExpression = false,
                expressionParts = [];
            
            if (value == null) {
                return value;
            }
            
            if (targetType === 'custom' || targetType === 'identifier') {
                return value;
            }
            
            if (targetType === 'expression') {
                return new Expression(value);
            }
            
            var processedText = '';
            
            if (allowExpressions) {
                ExpressionParser.parse(value, {
                    text: function(text) {
                        processedText += text;
                        expressionParts.push(stringify(text));
                    },
                    
                    expression: function(expression) {
                        expressionParts.push(expression);
                        hasExpression = true;
                    }
                });
                
                if (hasExpression) {
                    return new Expression(expressionParts.join("+"));
                }
                value = processedText;
            }
            
            if (targetType === 'string') {
                return allowExpressions ? new Expression(value ? stringify(value) : "null") : value;
            }
            else if (targetType === 'boolean') {
                value = value.toLowerCase();
                value = value === 'true' || value === 'yes'; //convert it to a boolean
                return allowExpressions ? new Expression(value) : value;
            }
            else if (targetType === 'float' || targetType === 'double' || targetType === 'number' || targetType === 'integer') {
                if (targetType === 'integer') {
                    value = parseInt(value, 10);
                }
                else {
                    value = parseFloat(value);
                }
                return allowExpressions ? new Expression(value) : value;
            }
            else {
                throw raptor.createError(new Error("Unsupported attribute targetType: " + targetType));
            }
        };
        
        return TypeConverter;
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
 * Utility class to support sub-attributes in an XML attribute. Each sub-attribute must
 * be separated by a semicolon. Within each sub-attribute, the name/value pair must
 * be split using an equal sign. However, the name for the first sub-attribute
 * is optional and a default name can be provided when reading the sub-attributes.
 * 
 * <p>
 * Sub-attribute format:
 * (<attr-value>)?(<attr-name>=<attr-value>;)*(<attr-name>=<attr-value>)
 * 
 * 
 * 
 */
raptor.defineClass(
    'templating.compiler.AttributeSplitter',
    function(raptor) {
        "use strict";
        
        var listeners = raptor.require("listeners"),
            strings = raptor.require("strings"),
            events = ['text', 'expression'],
            Expression = raptor.require('templating.compiler.Expression'),
            TypeConverter = raptor.require('templating.compiler.TypeConverter'),
            regExp = /"(?:[^"]|\\")*"|'(?:[^']|\\')*'|==|===|[;=]/g;
        
        /**
         * 
         */
        var AttributeSplitter = function() {
            
        };
        
        /**
         * Parses the provided string to find the sub-attributes that it contains.
         * The parsed output can be either returned as an array or a map. By default,
         * the parsed output is returned as a map where each property corresponds
         * to a sub-attribute. However, if the order of the sub-attributes is important
         * then the "ordered" option can be set to "true" and
         * an array will instead be returned where each element in the array is an object
         * with a name and value property that corresponds to the matching sub-attribute.
         * 
         * <p>
         * Supported options:
         * <ul>
         *  <li>ordered (boolean, defaults to "false") - If true then an array is returned (see above). Otherwise, an object is returned.
         * </ul>
         * 
         * @memberOf templating.compiler$AttributeSplitter
         * @param attr {String} The attribute to split
         * @param types {Object} Type definitions for the possible sub-attributes.
         * @param options
         * @returns
         */
        AttributeSplitter.parse = function(attr, types, options) {
            
            if (!options) {
                options = {};
            }
            var partStart = 0,
                ordered = options.ordered === true,
                defaultName = options.defaultName,
                matches,
                equalIndex = -1,
                result = ordered ? [] : {},
                handleError = function(message) {
                    if (options.errorHandler) {
                        options.errorHandler(message);
                        return;
                    }
                    else {
                        throw raptor.createError(new Error(message));
                    }
                },
                finishPart = function(endIndex) {
                    if (partStart === endIndex) {
                        //The part is an empty string... ignore it
                        return;
                    }
                    
                    var name,
                        value;
                    
                    if (equalIndex != -1) {
                         name = strings.trim(attr.substring(partStart, equalIndex));
                         value = attr.substring(equalIndex+1, endIndex);
                    }
                    else {
                        if (defaultName) {
                            name = defaultName;
                            value = attr.substring(partStart, endIndex);
                            if (!strings.trim(value).length) {
                                return; //ignore empty parts
                            }
                        }
                        else {
                            name = attr.substring(partStart, endIndex);
                        }
                    }
                    
                    if (name) {
                        name = strings.trim(name);
                    }
                    if (!strings.trim(name).length && !strings.trim(value).length) {
                        equalIndex = -1;
                        return; //ignore empty parts
                    }
                    
                    if (types) {
                        var type = types[name] || types['*'];
                        if (type) {
                            if (value != null) {
                                value = TypeConverter.convert(value, type.type, type.allowExpressions !== false);
                            }
                            if (type.name) {
                                name = type.name;
                            }
                        }
                        else {
                            handleError('Invalid sub-attribute name of "' + name + '"');
                        }
                    }
                    if (ordered) {
                        result.push({name: name, value: value});
                    }
                    else {
                        result[name] = value;
                    }
                    equalIndex = -1; //Reset the equal index
                };
            
            /*
             * Keep searching the string for the relevant tokens.
             * 
             * NOTE: The regular expression will also return matches for JavaScript strings,
             *       but they are just ignored. This ensures that semicolons inside strings
             *       are not treated as 
             */
            while((matches = regExp.exec(attr))) {
                //console.error(matches[0]);
                
                if (matches[0] == ';') {
                    finishPart(matches.index);
                    partStart = matches.index+1;
                    equalIndex = -1;
                }
                else if (matches[0] == '=') {
                    if (equalIndex == -1) {
                        equalIndex = matches.index;
                    }
                }
                
            }
            
            finishPart(attr.length);
            
            //console.error("AttributeSplitter - result: ", result);
            
            return result;
        };

        return AttributeSplitter;
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

raptor.defineClass(
    'templating.compiler.TemplateBuilder',
    function(raptor) {
        "use strict";
        
        var INDENT = "  ";
        
        var stringify = raptor.require('json.stringify').stringify,
            strings = raptor.require('strings'),
            Expression = raptor.require('templating.compiler.Expression'),
            forEach = raptor.forEach;
        
        
        var CodeWriter = function(indent) {
            this._indent = indent != null ? indent : INDENT + INDENT;
            this._code = strings.createStringBuilder();
            this.firstStatement = true;
            this._bufferedText = null;
            this._bufferedContextMethodCalls = null;
        };
        
        CodeWriter.prototype = {
            
            write: function(expression) {
                this.contextMethodCall("w", expression);
            },
            
            text: function(text) {
                if (this._bufferedText === null) {
                    this._bufferedText = text;
                }
                else {
                    this._bufferedText += text;
                }
            },
            
            contextMethodCall: function(methodName, args) {
                
                this.flushText();
                
                if (!this._bufferedContextMethodCalls) {
                    this._bufferedContextMethodCalls = [];
                }
                
                
                args = raptor.arrayFromArguments(arguments, 1);

                this._bufferedContextMethodCalls.push([methodName, args]);
            },
            
            code: function(code) {
                this.flush();
                this._code.append(code);
            },
            
            statement: function(code) {
                this.flush();
                this.code((this.firstStatement ? "" : "\n") + this._indent + code + "\n");
                this.firstStatement = false;
            },
            
            line: function(code) {
                this.code(this._indent + code + "\n");
            },
            
            indentStr: function(delta) {
                if (arguments.length === 0) {
                    return this._indent;
                }
                else {
                    var indent = this._indent;
                    for (var i=0; i<delta; i++) {
                        indent += INDENT;
                    }
                    return indent;
                }
            },
            
            indent: function() {
                if (arguments.length === 0) {
                    this.code(this._indent);
                }
                else if (typeof arguments[0] === 'number') {
                    this.code(this.indentStr(arguments[0]));
                }
                else if (typeof arguments[0] === 'function' || typeof arguments[1] === 'function') {
                    var func,
                        thisObj,
                        delta;
                    
                    if (typeof arguments[0] === 'function') {
                        delta = 1;
                        func = arguments[0];
                        thisObj = arguments[1];
                    }
                    else {
                        delta = arguments[0];
                        func = arguments[1];
                        thisObj = arguments[2];
                    }
                    
                    
                    this.incIndent(delta);
                    func.call(thisObj);
                    this.decIndent(delta);
                }
                else if (typeof arguments[0] === 'string') {
                    this.code(this._indent + arguments[0]);
                }
                
                return this;
            },
            
            flush: function() {
                this.flushText();
                this.flushMethodCalls();
            },
            
            flushText: function() {
                var curText = this._bufferedText; 
                if (curText) {
                    this._bufferedText = null;
                    this.write(stringify(curText, {useSingleQuote: true}));
                }
            },
            
            flushMethodCalls: function() {
                var _bufferedContextMethodCalls = this._bufferedContextMethodCalls; 
                if (_bufferedContextMethodCalls) {
                    if (!this.firstStatement) {
                        this._code.append("\n");
                    }
                    
                    this.firstStatement = false;

                    this._bufferedContextMethodCalls = null;
                    forEach(_bufferedContextMethodCalls, function(curWrite, i) {
                        var methodName = curWrite[0],
                            args = curWrite[1];
                        
                        if (i === 0)
                        {
                            this._code.append(this.indentStr() + 'context.' + methodName + "(");
                        }
                        else {
                            this.incIndent();
                            this._code.append(this.indentStr() + '.' + methodName + "(");
                        }
                        
                        args.forEach(function(arg, i) {
                            if (i !== 0) {
                                this._code.append(", ");
                            }
                            
                            if (typeof arg === 'string') {
                                this._code.append(arg);
                            }
                            else if (typeof arg === 'function') {
                                arg();
                            }
                            else if (arg instanceof Expression) {
                                this._code.append(arg.toString());
                            }
                            else {
                                throw raptor.createError(new Error('Illegal arg for method call "' +methodName + '": ' + arg.toString() + " (" + i +")"));
                            }
                        }, this);
                        
                        
                        
                        if (i < _bufferedContextMethodCalls.length -1) {
                            this._code.append(")\n");      
                        }
                        else {
                            this._code.append(");\n");
                        }
                        if (i !== 0) {
                            this.decIndent();
                        }
                    }, this);
                }
            },
            
            incIndent: function(delta) {
                if (arguments.length === 0) {
                    delta = 1; 
                }
                
                this.flush();
                this._indent = this.indentStr(delta);
                this.firstStatement = true;
            },
            
            decIndent: function(delta) {
                if (arguments.length === 0) {
                    delta = 1; 
                }
                
                this.flush();
                this._indent = this._indent.substring(INDENT.length * delta);
                this.firstStatement = false;
            },
            
            getOutput: function() {
                this.flush();
                return this._code.toString();
            }
        };
        
        
        var TemplateBuilder = function(compiler, resource) {
            this.resource = resource;
            
            if (typeof resource === 'string') {
                this.resource = null;
                this.filePath = this.path = resource;
            }
            else if (raptor.require('resources').isResource(resource)) {
                this.filePath = resource.getSystemPath();
                this.path = resource.getPath();
            }
            
            this.compiler = compiler;
            this.options = compiler.options;
            this.templateName = null;
            this.attributes = {};
            
            this.writer = new CodeWriter();
            
            this.staticVars = [];
            this.staticVarsLookup = {};
            this.helperFunctionsAdded = {};
            
            this.vars = [];
            this.varsLookup = {};
            
            this.getStaticHelperFunction("empty", "e");
            this.getStaticHelperFunction("notEmpty", "ne");
        };
        
        TemplateBuilder.prototype = {            
            getTemplateName: function() {
                var options = this.options || {};
                return options.templateName || this.templateName || options.defaultTemplateName;
            },

            _getHelperFunction: function(varName, propName, isStatic) {
                var key = propName + ":" + (isStatic ? "static" : "context");
                var added = this.helperFunctionsAdded[key];
                if (added) {
                    return added;
                }
                else {
                    if (isStatic) {
                        this.addStaticVar(varName, "helpers." + propName);
                    }
                    else {
                        this.addVar(varName, "contextHelpers." + propName);
                    }
                    
                    this.helperFunctionsAdded[key] = varName;
                    return varName;
                }
            },
            
            getContextHelperFunction: function(varName, propName) {
                return this._getHelperFunction(varName, propName, false);
            },
            
            captureCode: function(func, thisObj) {
                var oldWriter = this.writer;
                var newWriter = new CodeWriter(oldWriter.indentStr());
                
                try
                {
                    this.writer = newWriter;
                    func.call(thisObj);
                    return newWriter.getOutput();
                }
                finally {
                    this.writer = oldWriter;
                }
            },
            
            getStaticHelperFunction: function(varName, propName) {
                return this._getHelperFunction(varName, propName, true);
            },
            
            hasStaticVar: function(name) {
                return this.staticVarsLookup[name] === true;
            },
            
            addStaticVar: function(name, expression) {
                if (!this.staticVarsLookup[name]) {
                    this.staticVarsLookup[name] = true;
                    this.staticVars.push({name: name, expression: expression});    
                }
            },
            
            hasVar: function(name) {
                return this.vars[name] === true;
            },
            
            addVar: function(name, expression) {
                this.vars[name] = true;
                this.vars.push({name: name, expression: expression});
            },
            
            _writeVars: function(vars, out, indent) {
                if (!vars.length) {
                    return;
                } 
                out.append(indent + "var ");
                var declarations = [];
                forEach(vars, function(v, i) {
                    declarations.push((i !== 0 ? indent + "    " : "" ) + v.name + "=" + v.expression + (i === vars.length-1 ? ";\n" : ",\n")); 
                });
                out.append(declarations.join(""));
            },
            
            text: function(text) {
                if (!this.hasErrors()) {
                    this.writer.text(text);
                }
                
                return this;
            },
            
            attr: function(name, valueExpression) {
                if (!this.hasErrors()) {
                    this.contextMethodCall("a", stringify(name), valueExpression);    
                }
    
                return this;
            },
            
            attrs: function(attrsExpression) {
                if (!this.hasErrors()) {
                    this.contextMethodCall("a", attrsExpression);    
                }
    
                return this;
            },
            
            include: function(templateName, dataExpression) {
                if (!this.hasErrors()) {
                    this.contextMethodCall("i", templateName, dataExpression);    
                }
    
                return this;
            },
            
            contextMethodCall: function(methodName, args) {
                if (!this.hasErrors()) {
                    this.writer.contextMethodCall.apply(this.writer, arguments);    
                }
    
                return this;
            },
            
            write: function(expression, options) {
                if (!this.hasErrors()) {
                    
                    if (options) {
                        if (options.escapeXml) {
                            expression = this.getStaticHelperFunction("escapeXml", "x") + "(" + expression + ")";
                        }
                        if (options.escapeXmlAttr) {
                            expression = this.getStaticHelperFunction("escapeXmlAttr", "xa") + "(" + expression + ")";
                        }
                    }
                    
                    this.writer.write(expression, options);
                }
    
                return this;
            },
            
            incIndent: function() {
                if (!this.hasErrors()) {
                    this.writer.incIndent.apply(this.writer, arguments);
                }
    
                return this;
            },
            
            decIndent: function() {
                if (!this.hasErrors()) {
                    this.writer.decIndent.apply(this.writer, arguments);
                }
    
                return this;
            },
            
            code: function(code) {
                if (!this.hasErrors()) {
                    this.writer.code(code);
                }

                return this;
            },
            
            statement: function(code) {
                if (!this.hasErrors()) {
                    this.writer.statement(code);
                }

                return this;
            },
            
            line: function(code) {
                if (!this.hasErrors()) {
                    this.writer.line(code);
                }

                return this;
            },
            
            indentStr: function(delta) {
                return this.writer.indentStr(delta);
            },
            
            indent: function() {
                if (!this.hasErrors()) {
                    this.writer.indent.apply(this.writer, arguments);
                }

                return this;
            },
            
            getPath: function() {
                return this.path;
            },
            
            getFilePath: function() {
                return this.filePath;
            },
            
            getOutput: function() {
                if (this.hasErrors()) {
                    return '';
                }
                
                var out = strings.createStringBuilder();
                
                var templateName = this.getTemplateName();
                if (!templateName) {
                    
                    this.addError('Template name not defined in template at path "' + this.getFilePath() + '"');
                }
                
                var params = this.params;
                if (params) {
                    params = ["context"].concat(params);
                }
                else {
                    params = ["context"];
                }
                
                out.append('$rset("rhtml", ');
                out.append(stringify(templateName));
                out.append(', ');
                out.append('function(helpers) {\n');
                //Write out the static variables
                
                this.writer.flush();
                
                this._writeVars(this.staticVars, out, INDENT);
                out.append('\n' + INDENT + 'return function(data, context) {\n');
                
                
                //Write out the render variables
                if (this.vars && this.vars.length) {
                    this._writeVars(this.vars, out, INDENT + INDENT);
                    out.append("\n");    
                }
                
                out.append(this.writer.getOutput());
                
                out.append(INDENT + '}\n});');
                return out.toString();
            },
            
            setTemplateName: function(templateName) {
                this.templateName = templateName;
            },
            
            makeExpression: function(expression) {
                if (expression instanceof Expression)  {
                    return expression;
                }
                else {
                    return new Expression(expression);
                }
            },
            
            isExpression: function(expression) {
                return expression instanceof Expression;
            },
            
            getAttribute: function(name) {
                return this.attributes[name];
            },
            
            setAttribute: function(name, value) {
                this.attributes[name] = value;
                return value;
            },
            
            hasErrors: function() {
                return this.compiler.hasErrors();
            },
            
            addError: function(message, pos) {
                this.compiler.addError(message, pos);
            },
            
            getErrors: function() {
                return this.compiler.getErrors();
            },
            
            getNodeClass: function(uri, localName) {
                return this.compiler.getNodeClass(uri, localName);
            },
            
            transformTree: function(node) {
                this.compiler.transformTree(node, this);
            },
            
            INDENT: INDENT
            
        };
        
        return TemplateBuilder;
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

raptor.defineClass(
    'templating.compiler.TemplateCompiler',
    function(raptor) {
        "use strict";
        
        var TemplateBuilder = raptor.require('templating.compiler.TemplateBuilder'),
            ParseTreeBuilder = raptor.require('templating.compiler.ParseTreeBuilder'),
            Expression = raptor.require('templating.compiler.Expression'),
            minifier = raptor.find("js-minifier"),
            TypeConverter = raptor.require('templating.compiler.TypeConverter');
        
        /**
         * @param taglibs {templating.compiler$TaglibCollection} The collection of taglibs that are available to the compiler
         * @param options {object} The options for the compiler.
         */
        var TemplateCompiler = function(taglibs, options) {
            this.taglibs = taglibs;
            this.options = options || {};
            this.errors = [];
        };
        
        TemplateCompiler.prototype = {
                
            /**
             * This method processes every node in the tree using a pre-order traversal.
             * That is, the parent node is transformed before its child nodes are
             * transformed.
             * 
             * <p>
             * NOTE: 
             * This method is repeatedly called until there are no more nodes in the tree
             * that need to be transformed. This is because transformers might add
             * new nodes to the tree in a position that has already been passed and
             * we want to make sure that all new nodes added to the tree are transformed
             * as necessary.
             * 
             * @param node {templating.compiler$Node} The root node to transform
             * @param templateBuilder {templating.compiler$TemplateBuilder} The template builder object that is used to control how the compiled code is generated
             */
            transformTree: function(rootNode, templateBuilder) {
                if (!templateBuilder) {
                    throw raptor.createError(new Error("The templateBuilder argument is required"));
                }
                
                var transformTreeHelper = function(node) {
                    try
                    {
                        this.taglibs.forEachNodeTransformer( //Handle all of the transformers that are appropriate for this node
                            node, //The node being transformed 
                            function(transformer) {
                                if (!node.isTransformerApplied(transformer)) { //Check to make sure a transformer of a certain type is only applied once to a node
                                    node.setTransformerApplied(transformer); //Mark the node as have been transformed by the current transformer
                                    this._transformerApplied = true; //Set the flag to indicate that a node was transformed
                                    node.compiler = this;
                                    transformer.getInstance().process(node, this, templateBuilder); //Have the transformer process the node (NOTE: Just because a node is being processed by the transformer doesn't mean that it has to modify the parse tree)
                                }
                            },
                            this);
                    }
                    catch(e) {
                        throw raptor.createError(new Error('Unable to compile template at path "' + templateBuilder.filePath + ". Error: " + e.message), e);
                    }
                    
                    
                    /*
                     * Now process the child nodes by looping over the child nodes
                     * and transforming the subtree recursively 
                     * 
                     * NOTE: The length of the childNodes array might change as the tree is being performed.
                     *       The checks to prevent transformers from being applied multiple times makes
                     *       sure that this is not a problem.
                     */
                    
                    node.forEachChild(function(childNode) {
                        if (!childNode.parentNode) {
                            return; //The child node might have been removed from the tree
                        }
                        transformTreeHelper.call(this, childNode);
                    }, this);
                };
                
                
                /*
                 * The tree is continuously transformed until we go through an entire pass where 
                 * there were no new nodes that needed to be transformed. This loop makes sure that
                 * nodes added by transformers are also transformed.
                 */
                do
                {
                    this._transformerApplied = false; //Reset the flag to indicate that no transforms were yet applied to any of the nodes for this pass
                    transformTreeHelper.call(this, rootNode); //Run the transforms on the tree                 
                }
                while (this._transformerApplied);
            },

            /**
             * Compiles the XML source code for a template and returns the resulting compiled JavaScript code.
             * 
             * <p>
             * When the returned code is evaluated by a JavaScript engine it will register the function
             * to render the template. The function is registered with the name found as the "name" attribute
             * of the root &ltc:template> element unless a template name is passed in as a compiler option.
             * 
             * 
             * @param xmlSrc {String} The XML source code for the template
             * @param filePath {String} The path to the input template for debugging/error reporting only
             * @returns {String} The JavaScript code for the compiled template
             */
            compile: function(xmlSrc, resource, callback, thisObj) {
                var _this = this,
                    rootNode,
                    templateBuilder,
                    handleErrors = function() {
                        var message = "Errors in template:\n",
                            errors = _this.getErrors();
                        
                        for (var i=0, len=errors.length; i<len; i++) {
                            message += (i+1) + ") " + (errors[i].pos ? "[" + errors[i].pos + "] " : "") + errors[i].message + "\n";
                        }
                        
                        var error = new Error(message);
                        error.errors = _this.getErrors();
                        throw error;
                    };
                    
                var filePath;
                
                if (raptor.require('resources').isResource(resource)) {
                    filePath = resource.getSystemPath();
                }
                else if (typeof resource === 'string'){
                    filePath = resource;
                }
                
                try
                {
                    /*
                     * First build the parse tree for the tempate
                     */
                    rootNode = ParseTreeBuilder.parse(xmlSrc, filePath, this.taglibs); //Build a parse tree from the input XML
                    templateBuilder = new TemplateBuilder(this, resource); //The templateBuilder object is need to manage the compiled JavaScript output              
                    this.transformTree(rootNode, templateBuilder);
                }
                catch(e) {
                    throw raptor.createError(new Error('An error occurred while trying to compile template at path "' + filePath + '". Exception: ' + e), e);
                }

                try
                {
                
                    /*
                     * The tree has been transformed and we can now generate
                     */
                    rootNode.generateCode(templateBuilder); //Generate the code and have all output be managed by the TemplateBuilder
                }
                catch(e) {
                    throw raptor.createError(new Error('An error occurred while trying to compile template at path "' + filePath + '". Exception: ' + e), e);
                }
                
                if (this.hasErrors()) {
                    handleErrors();
                }
                
                var output = templateBuilder.getOutput(); //Get the compiled output from the template builder
                //console.error('COMPILED TEMPLATE (' + filePath + ')\n', '\n' + output, '\n------------------');
                
                if (minifier && this.options.minify === true) {
                    output = minifier.minify(output);
                }
                
                if (callback) {
                    callback.call(thisObj, {
                        source: output,
                        templateName: templateBuilder.getTemplateName()
                    });
                }
                
                var options = this.options;
                
                if (options && options.nameCallback) {
                    options.nameCallback(templateBuilder.getTemplateName());
                }
                
                return output;
            },
            
            /**
             * 
             * @param xmlSrc {String} The XML source code for the template
             * @param filePath {String} The path to the input template for debugging/error reporting only
             * @return {void}
             */
            compileAndLoad: function(xmlSrc, resource) {
                var compiledSrc = this.compile(xmlSrc, resource, function(result) { //Get the compiled output for the template
                    raptor.require('templating').unload(result.templateName); //Unload any existing template with the same name
                }); 
                
                try
                {
                    eval(compiledSrc); //Evaluate the compiled code and register the template
                }
                catch(e) {
                    var filePath;
                    if (typeof resource === 'string') {
                        filePath = resource;
                    }
                    else if (raptor.require('resources').isResource(resource)) {
                        filePath = resource.getSystemPath();
                    }
                    this.logger().error("Unable to load compiled template: " + compiledSrc, e);
                    throw raptor.createError(new Error('Unable to load template at path "' + filePath + '". Exception: ' + e.message), e);
                }
            },
            
            /**
             * Returns true if the provided object is an Expression object, false otherwise
             * @param expression {Object} The object to test
             * @returns {Boolean} True if the provided object is an Expression object, false otherwise
             */
            isExpression: function(expression) {
                return expression instanceof Expression;
            },
            
            /**
             * 
             * @param uri
             * @param localName
             * @returns {TagHandlerNode}
             */
            createTagHandlerNode: function(uri, localName) {
                var TagHandlerNode = raptor.require("templating.taglibs.core.TagHandlerNode");
                var tag = this.taglibs.getTag(uri, localName);
                var tagHandlerNode = new TagHandlerNode(tag);
                return tagHandlerNode;
            },
            
            /**
             * 
             * @param value
             * @param type
             * @param allowExpressions
             * @returns
             */
            convertType: function(value, type, allowExpressions) {
                return TypeConverter.convert(value, type, allowExpressions);
            },
            
            addError: function(message, pos) {
                this.errors.push({message: message, pos: pos});
            },
            
            hasErrors: function() {
                return this.errors.length !== 0;
            },
            
            getErrors: function() {
                return this.errors;
            },
            
            getNodeClass: function(uri, localName) {
                var tag = this.taglibs.getTag(uri, localName);
                if (tag && tag.nodeClass) {
                    return raptor.require(tag.nodeClass);
                }
                throw raptor.createError(new Error('Node class not found for uri "' + uri + '" and localName "' + localName + '"'));
            }
        };
        
        return TemplateCompiler;
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

raptor.defineClass(
    'templating.compiler.Taglib',
    function(raptor) {
        "use strict";
        
        var Taglib = function() {
            this.uri = null;
            this.shortName = null;
            this.tags = {};
            this.textTransformers = [];
            this.attributeMap = {};
            this.functions = [];
            
            this.patternAttributes = [];
        };
        
        Taglib.prototype = {
            
            addAttribute: function(attribute) {
                if (attribute.uri) {
                    throw raptor.createError(new Error('"uri" is not allowed for taglib attributes'));
                }
                
                if (attribute.name) {
                    this.attributeMap[attribute.name] = attribute;    
                }
                else {
                    this.patternAttributes.push(attribute);
                }
            },
            
            getAttribute: function(name) {
                var attribute = this.attributeMap[name];
                if (!attribute) {
                    for (var i=0, len=this.patternAttributes.length; i<len; i++) {
                        var patternAttribute = this.patternAttributes[i];
                        if (patternAttribute.pattern.test(name)) {
                            attribute = patternAttribute;
                        }
                    }
                }
                
                return attribute;
            },
            
            addTag: function(tag) {
                var key = (tag.uri || '') + ":" + tag.name;
                tag._taglib = this;
                this.tags[key] = tag;
            },
            
            
            
            
            addTextTransformer: function(transformer) {
                this.textTransformers.push(transformer);
            },
            
            forEachTag: function(callback, thisObj) {
                raptor.forEachEntry(this.tags, function(key, tag) {
                    callback.call(thisObj, tag);
                }, this);
            },
            
            addFunction: function(func) {
                this.functions.push(func);
            }
        };
        
        Taglib.Tag = raptor.defineClass(function() {
            var Tag = function() {
                this.name = null;
                this.uri = null;
                this.handlerClass = null;
                this.dynamicAttributes = false;
                this.attributeMap = {};
                this.transformers = [];
                this.nestedVariables = [];
                this.importedVariables = [];
                this.preserveWhitespace = false;
                this._taglib = null;
                this.nestedTags = {};
            };
            
            Tag.prototype = {
                addNestedTag: function(nestedTag) {
                    var uri = nestedTag.uri || '';
                    this.nestedTags[uri + ":" + nestedTag.name] = nestedTag;
                },
                
                forEachNestedTag: function(callback, thisObj) {
                    raptor.forEachEntry(this.nestedTags, function(key, nestedTag) {
                        callback.call(thisObj, nestedTag);
                    });
                },
                
                addAttribute: function(attr) {
                    var uri = attr.uri || '';
                    this.attributeMap[uri + ':' + attr.name] = attr;
                },
                
                getAttribute: function(uri, localName) {
                    if (uri == null) {
                        uri = '';
                    }
                    
                    return this.attributeMap[uri + ':' + localName] || this.attributeMap[uri + ':*'] || this.attributeMap['*:' + localName] || this.attributeMap['*:*'];
                },
                
                getTaglibUri: function() {
                    if (!this._taglib) {
                        throw raptor.createError(new Error('Taglib not set for tag. (uri=' + this.uri + ', name=' + this.name + ')'));
                    }
                    return this._taglib.uri;
                },
                
                toString: function() {
                    return "[Tag: <" + this.uri + ":" + this.name + ">]";  
                },
                
                forEachAttribute: function(callback, thisObj) {
                    raptor.forEachEntry(this.attributeMap, function(attrName, attr) {
                        callback.call(thisObj, attr);
                    });
                },
                
                addNestedVariable: function(nestedVariable) {
                    this.nestedVariables.push(nestedVariable);
                },
                
                addImportedVariable: function(importedVariable) {
                    this.importedVariables.push(importedVariable);
                },
                
                addTransformer: function(transformer) {
                    this.transformers.push(transformer);
                }
            };
            
            return Tag;
        });
        
        Taglib.Attribute = raptor.defineClass(function() {
            var Attribute = function() {
                this.name = null;
                this.uri = null;
                this.type = null;
                this.required = false;
                this.type = "string";
                this.allowExpressions = true;
            };
            
            Attribute.prototype = {
                getAttribute: function(uri, localName) {
                    if (uri == null) {
                        uri = '';
                    }
                    if (!this.attributeMap) {
                        return null;
                    }
                    
                    return this.attributeMap[uri + ':' + localName] || this.attributeMap[uri + ':*'] || this.attributeMap['*:' + localName] || this.attributeMap['*:*'];
                },
                
                toString: function() {
                    return "[Tag: <" + this.uri + ":" + this.name + ">]";  
                }
            };
            
            return Attribute;
        });
        
        Taglib.NestedVariable = raptor.defineClass(function() {
            var NestedVariable = function() {
                this.name = null;
            };
            
            NestedVariable.prototype = {
                
            };
            
            return NestedVariable;
        });
        
        Taglib.ImportedVariable = raptor.defineClass(function() {
            var ImportedVariable = function() {
                this.targetProperty = null;
                this.expression = null;
            };
            
            ImportedVariable.prototype = {
                
            };
            
            return ImportedVariable;
        });
        
        Taglib.Transformer = raptor.defineClass(function() {
            var uniqueId = 0;
            
            var Transformer = function() {
                this.id = uniqueId++; 
                this.tag = null;
                this.className = null;
                this.after = null;
                this.before = null;
                this.instance = null;
                this.properties = {};
                
            };
            
            Transformer.prototype = {
                getInstance: function() {
                    if (!this.className) {
                        throw raptor.createError(new Error("Transformer class not defined for tag transformer (tag=" + this.tag + ")"));
                    }
                    
                    if (!this.instance) {
                        var Clazz = raptor.require(this.className);
                        if (Clazz.process) {
                            return Clazz;
                        }
                        this.instance = new Clazz();
                        this.instance.id = this.id;
                    }
                    return this.instance;
                },
                
                toString: function() {
                    return '[Taglib.Transformer: ' + this.className + ']';
                }
            
            };
            
            return Transformer;
        });
        
        Taglib.Function = raptor.defineClass(function() {
            var Function = function() {
                this.name = null;
                this.functionClass = null;
                this.bindToContext = false;
            };
            
            Function.prototype = {
                
            };
            
            return Function;
        });
        
        return Taglib;
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
 * Merges a set of taglibs for ea
 */
raptor.defineClass(
    'templating.compiler.TaglibCollection',
    function(raptor) {
        "use strict";
        
        var forEach = raptor.forEach,
            extend = raptor.extend,
            strings = raptor.strings,
            Taglib = raptor.require("templating.compiler.Taglib"),
            ElementNode = raptor.require('templating.compiler.ElementNode'),
            TextNode = raptor.require('templating.compiler.TextNode'),
            Tag = Taglib.Tag,
            Transformer = Taglib.Transformer,
            /*
             * Probably one of the more amazing regular expressions you will ever see...
             * 
             * Valid imports:
             * x, y, z from http://raptorjs.org/templates/core
             * x, y, z from core
             * x, y, z from core as my-core
             * * from core as c 
             * core
             * core as my-core
             */
            importRegExp = /^(?:(\*|(?:(?:@?[A-Za-z0-9_\-]+\s*,\s*)*@?[A-Za-z0-9_\-]+))\s+from\s+)?([^ ]*)(?:\s+as\s+([A-Za-z0-9_\-]+))?$/,
            getImported = function(lookup, localName, imports) {
                if (lookup[localName] != null) {
                    return lookup[localName];
                }
                
                var prefixEnd = localName.indexOf('-'),
                    prefix,
                    uri,
                    name;
                
                
                
                if (prefixEnd != -1) {
                    
                    
                    prefix = localName.substring(0, prefixEnd);
                    name = localName.substring(prefixEnd+1);
                    uri = imports._prefixes[prefix];
                    
                    if (uri) {
                        return {
                            uri: uri,
                            name: name,
                            prefix: prefix
                        };
                    }
                }
                
                return null;
            };
        
        var Imports = function(taglibs, importsStr) {
            this._tagImports = {};
            this._attrImports = {};
            this._prefixes = {};
            
            var parts = strings.trim(importsStr).split(/\s*;\s*/);
            forEach(parts, function(part) {
                if (!part) { //Skip empty strings
                    return;
                }
                
                var match = part.match(importRegExp),
                    imports,
                    importsLookup = {},
                    from,
                    as;
                
                if (!match) {
                    throw raptor.createError(new Error('Invalid import: "' + part + '"'));
                }
                else {
                    imports = match[1],
                    from = taglibs.resolveURI(match[2]),
                    as = match[3];

                    if (!as) {
                        as = taglibs.resolvePrefix(from) || taglibs.resolveShortName(from); //Use either the prefix (preferred) or the short name if provided
                        if (!as) {
                            throw raptor.createError(new Error('Unable to handle imports from "' + from + '". The taglib does not have a prefix or short name defined.'));
                        }
                    }
                }
                
                this._prefixes[as] = from;
                
                if (imports) {
                    forEach(imports.split(/\s*,\s*/), function(importedTagName) {
                        importsLookup[importedTagName] = true;
                    });
                }

                taglibs.forEachTag(from, function(tag, taglib) {
                    
                    if (tag.uri === from && (importsLookup['*'] || importsLookup[tag.name])) {
                        /*
                         * Import tags with a URI that matches the taglib URI
                         */
                        this._tagImports[tag.name] = { uri: from, name: tag.name, prefix: as };
                    }
                    
                    /*
                     * Allow imports for attributes that can be assigned to tags with a different URI
                     * e.g. <div c-if="someCondition"></div> --> <div c:if="someCondition"></div>
                     */
                    if (!tag.forEachAttribute) {
                        console.error('TAG w/o forEachAttribute: ', Object.keys(tag));
                    }
                    tag.forEachAttribute(function(attr) {
                        
                        if (tag.uri !== from && (importsLookup['*'] || importsLookup["@" + attr.name])) {
                            this._attrImports[attr.name] = { uri: from, name: attr.name, prefix: as };
                        }

                    }, this);
                    
                }, this);
                
            }, this);
        };
        
        Imports.prototype = {

            getImportedTag: function(localName) {
                return getImported(this._tagImports, localName, this);
            },
            
            getImportedAttribute: function(localName) {
                return getImported(this._attrImports, localName, this);
            }
        };
        
        
        
        var TaglibCollection = function() {
            this.tagTransformersLookup = {}; //Tag transformers lookup
            this.tags = {}; //Tag definitions lookup
            this.textTransformers = {};
            this.taglibsByURI = {}; //Lookup to track the URIs of taglibs that have been added to this collection
            this.shortNameToUriMapping = {};
            this.uriToShortNameMapping = {};
            this.uriToPrefixMapping = {};
            this.functionsLookup = {};
            this.nestedTags = {};
        };
        
        TaglibCollection.prototype = {
                
            getAttribute: function(tagUri, tagName, attrUri, attrName) {
                var tags = this.tags;
                
                var _findAttr = function(lookupKey) {
                    var tag = tags[lookupKey];
                    return tag ? tag.getAttribute(attrUri, attrName) : null;
                };
                
                var attr = _findAttr(tagUri + ":" + tagName) || 
                    _findAttr(tagUri + ":*") ||
                    _findAttr("*:*");
                
                if (attr && attr.uri && attr.uri !== '*') {
                    //The attribute is being imported
                    
                    var taglib = this.taglibsByURI[attr.uri];
                    if (!taglib) {
                        throw raptor.createError(new Error('Taglib with URI "' + attr.uri + '" not found for imported attribute with name "' + attrName + '"'));
                    }
                    attr = taglib.getAttribute(attrName);
                    if (!attr) {
                        throw raptor.createError(new Error('Attribute "' + attrName + '" imported from taglib with URI "' + attr.uri + '" not found in taglib.'));
                    }
                }
                
                if (!attr) {
                    var attrShortUri = this.resolveShortName(attrUri);
                    if (attrShortUri !== attrUri) {
                        return this.getAttribute(tagUri, tagName, attrShortUri, attrName);
                    }
                }
                
                return attr;
            },
            
            forEachTag: function(uri, callback, thisObj) {
                uri = this.resolveURI(uri);
                
                
                var taglib = this.taglibsByURI[uri];
                
                if (!taglib) {
                    return;
                }
                
                raptor.forEachEntry(taglib.tags, function(key, tag) {
                    
                    callback.call(thisObj, tag, taglib);
                });
            },
            
            /**
             * Checks if the provided URI is the URI of a taglib
             * 
             * @param uri {String} The URI to check
             * @returns {Boolean} Returns true if the URI is that of a taglib. False, otherwise.
             */
            isTaglib: function(uri) {
                return this.taglibsByURI[uri] != null;
            },
            
            /**
             * Adds a new taglib to the collection
             * 
             * @param taglib {templating.compiler$Taglib} The taglib to add
             */
            add: function(taglib) {
                var targetTaglib = this.taglibsByURI[taglib.uri] || taglib;
                
                this.taglibsByURI[taglib.uri] = targetTaglib; //Mark the taglib as added
                
                if (taglib.shortName) {
                    /*
                     * If the taglib has a short name then record that mapping so that we
                     * can map the short name to the full URI
                     */
                    this.taglibsByURI[taglib.shortName] = taglib; //Mark the short name as being a taglib
                    
                    if (taglib.shortName) {
                        targetTaglib.shortName = taglib.shortName;
                        
                        this.shortNameToUriMapping[taglib.shortName] = taglib.uri; //Add the mapping
                        this.uriToShortNameMapping[taglib.uri] = taglib.shortName; //Add the reverse-mapping
                    }
                    
                    if (taglib.prefix) {
                        targetTaglib.prefix = taglib.prefix;
                        
                        this.uriToPrefixMapping[taglib.uri] = taglib.prefix;
                    }
                }
                
                /*
                 * Index all of the tags in the taglib by registering them
                 * based on the tag URI and the tag name
                 */
                taglib.forEachTag(function(tag, i) {
                    
                    
                    
                    var uri = tag.uri == null ? (tag.uri = taglib.uri) : tag.uri, //If not specified, the tag URI should be the same as the taglib URI
                        name = tag.name,
                        key = uri + ":" + name; //The taglib will be registered using the combination of URI and tag name
                    
                    this.tags[key] = tag; //Register the tag using the combination of URI and tag name so that it can easily be looked up
                    
                    if (tag.transformers) { //Check if the tag has any transformers that should be applied
                        
                        var tagTransformersForTags = this.tagTransformersLookup[key] || (this.tagTransformersLookup[key] = []); //A reference to the array of the tag transformers with the same key
                        
                        //Now add all of the transformers for the node (there will typically only be one...)
                        forEach(tag.transformers, function(transformer) {
                            tagTransformersForTags.push(transformer);
                        }, this);
                    }
                    
                    tag.forEachNestedTag(function(nestedTag) {
                        this.nestedTags[tag.uri + ":" + tag.name + ":" + nestedTag.uri + ":" + nestedTag.name] = nestedTag;
                    }, this);
                }, this);
                
                /*
                 * Now register all of the text transformers that are part of the provided taglibs
                 */
                forEach(taglib.textTransformers, function(textTransformer) {
                    this.textTransformers[textTransformer.className] = textTransformer;
                }, this);
                
                
                forEach(taglib.functions, function(func) {
                    if (!func.name) {
                        throw raptor.createError(new Error("Function name not set."));
                    }
                    this.functionsLookup[taglib.uri + ":" + func.name] = func;
                    if (targetTaglib.shortName) {
                        this.functionsLookup[taglib.shortName + ":" + func.name] = func;
                    }
                }, this);
            },
            
            /**
             * Invokes a callback for eaching matching transformer that is found for the current node.
             * If the provided node is an element node then the match is based on the node's
             * URI and the local name. If the provided node is a text node then all
             * text transformers will match.
             * 
             * @param node {templating.compiler$Node} The node to match transformers to
             * @param callback {Function} The callback function to invoke for each matching transformer
             * @param thisObj {Object} The "this" object to use when invoking the callback function
             */
            forEachNodeTransformer: function(node, callback, thisObj) {
                /*
                 * Based on the type of node we have to choose how to transform it
                 */
                if (node instanceof ElementNode) {
                    this.forEachTagTransformer(node.uri, node.localName, callback, thisObj);
                }
                else if (node instanceof TextNode) {
                    this.forEachTextTransformer(callback, thisObj);
                }
            },
            
            /**
             * Resolves a taglib short name to a taglib URI.
             * 
             * <p>
             * If the provided short name is not a known short name then it is just returned.
             * 
             * @param shortName {String} The taglib short name to resolve
             * @returns {String} The resolved URI or the input string if it is not a known short name
             */
            resolveURI: function(shortName) {
                if (!shortName) {
                    return shortName;
                }
                
                return this.shortNameToUriMapping[shortName] || shortName;
            },
            
            /**
             * Resolves a taglib URI to a taglib short name.
             * 
             * <p>
             * If the provided URI is not a known short name then it is just returned.
             * 
             * @param uri {String} The taglib uri to resolve to a short name
             * @returns {String} The resolved short name or undefined if the taglib does not have a short name
             */
            resolveShortName: function(uri) {
                if (!uri) {
                    return uri;
                }
                if (this.shortNameToUriMapping[uri]) { //See if the URI is already a short name
                    return uri;
                }
                
                return this.uriToShortNameMapping[uri]; //Otherwise lookup the short name for the long URI
            },
            
            resolvePrefix: function(uri) {
                if (!uri) {
                    return uri;
                }
                uri = this.resolveURI(uri); //Resolve the short name to a long URI
                
                return this.uriToPrefixMapping[uri]; //See if there is a mapping from the long URI to a prefix
            },
            
            /**
             * Invokes a provided callback for each tag transformer that
             * matches the provided URI and tag name.
             * 
             * @param uri {String} The tag URI or an empty string if the tag is not namespaced
             * @param tagName {String} The local name of the tag (e.g. "div")
             * @param callback {Function} The callback function to invoke
             * @param thisObj {Object} The "this" object to use when invoking the callback function
             */
            forEachTagTransformer: function(uri, tagName, callback, thisObj) {
                /*
                 * If the node is an element node then we need to find all matching
                 * transformers based on the URI and the local name of the element.
                 */
                
                if (uri == null) {
                    uri = '';
                }
                
                var matchingTransformersByName = {};
                var matchingTransformers = [];
                var handled = {};
                var before = {};
                
                /*
                 * Handle all of the transformers in the tag transformers entry
                 */
                var _addTransformers = function(transformers) {
                    raptor.forEach(transformers, function(transformer) {
                        if (!matchingTransformersByName[transformer.className]) {
                            matchingTransformersByName[transformer.className] = transformer;    
                            matchingTransformers.push(transformer);
                            
                            if (transformer.before) {
                                (before[transformer.before] || (before[transformer.before] = [])).push(transformer);
                            }
                        }
                        
                    });
                };

                /*
                 * Handle all of the transformers for all possible matching transformers.
                 * 
                 * Start with the least specific and end with the most specific.
                 */
                _addTransformers(this.tagTransformersLookup["*:*"]); //Wildcard for both URI and tag name (i.e. transformers that apply to every element)
                _addTransformers(this.tagTransformersLookup[uri + ":*"]); //Wildcard for tag name but matching URI (i.e. transformers that apply to every element with a URI, regadless of tag name)
                _addTransformers(this.tagTransformersLookup[uri + ":" + tagName]); //All transformers that match the URI and tag name exactly
                
                var _handleTransformer = function(transformer) {
                    if (!handled[transformer.className]) {
                        handled[transformer.className] = true;
                        
                        if (transformer.after) { //Check if this transformer is required to run
                            _handleTransformer(matchingTransformersByName[transformer.after]); //Handle any transformers that this transformer is supposed to run after
                        }
                        
                        raptor.forEach(before[transformer.className], _handleTransformer); //Handle any transformers that are configured to run before this transformer
                        
                        callback.call(thisObj, transformer);
                    }
                    
                };
                
                matchingTransformers.forEach(function(transformer) {
                    _handleTransformer(transformer);
                }, this);
            },
            
            /**
             * Invokes a provided callback for each registered text transformer.
             * 
             * @param callback {Function} The callback function to invoke
             * @param thisObj {Object} The "this" object to use when invoking the callback function
             */
            forEachTextTransformer: function(callback, thisObj) {
                raptor.forEachEntry(this.textTransformers, function(className, textTransformer) {
                    var keepGoing = callback.call(thisObj, textTransformer);
                    if (keepGoing === false) {
                        return false;
                    }
                    return true;
                });
            },
            
            /**
             * Returns the definition of a tag that was loaded from the taglib with the specified
             * URI and with the matching 
             * @param uri
             * @param localName
             * @returns
             */
            getTag: function(uri, localName) {
                var tag = this.tags[uri + ":" + localName];
                if (!tag) {
                    tag = this.tags[uri + ":*"]; //See if there was a wildcard tag definition in the taglib
                }
                
                return tag;
            },
            
            getNestedTag: function(parentTagUri, parentTagName, nestedTagUri, nestedTagName) {
                parentTagUri = parentTagUri || '';
                nestedTagUri = nestedTagUri || '';
                return this.nestedTags[parentTagUri + ":" + parentTagName + ":" + nestedTagUri + ":" + nestedTagName];
            },
            
            getFunction: function(uri, functionName) {
                return this.functionsLookup[uri + ":" + functionName];
            },
            
            getImports: function(importsStr) {
                return new Imports(this, importsStr);
            }
        };
        
        return TaglibCollection;
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

raptor.define(
    "templating.compiler", 
    function(raptor) {
        "use strict";
        
        var TaglibCollection = raptor.require('templating.compiler.TaglibCollection'),
            taglibs = new TaglibCollection(),
            extend = raptor.extend,
            ExpressionParser = raptor.require('templating.compiler.ExpressionParser'),
            defaultOptions = {
                minify: false,
                preserveWhitespace: {
                    'pre': true,
                    'textarea': true
                },
                allowSelfClosing: { //Conditionally enable self-closing tags for specific elements. Self-closing tag: <div /> Not self-closing tag: <div></div>
                    //'pre': true
                },
                startTagOnly: {
                    'img': true,
                    'br': true,
                    'input': true
                }
            };
        
        
        
        return {

            /**
             * Creates a new object that can be used to compile templates with the
             * provided options.
             * 
             * <p>
             * Allowed options:
             * <ul>
             *  <li>
             *      <b>preserveWhitespace</b> (object|boolean): An object that defines which elements should
             *          have their whitespace preserved. While most whitespace gets normalized
             *          in HTML documents, some HTML elements make use of their whitespace (e.g. PRE and TEXTAREA tags).
             *          If this option is set to "true" then all whitespace is preserved.
             *          
             *          <p>
             *          Default value:
<pre>
{
    'pre': true,
    'textarea': true
}
</pre>
             *  </li>
             *  <li>
             *      <b>allowSelfClosing</b> (object): An object that defines which elements are allowed
             *          to be self-closing. By default, all elements are allowed to be self-closing.
             *          Some browsers do not handle certain HTML elements that are self-closing
             *          and require a separate ending tag.
             *          
             *          <p>
             *          Default value:
<pre>
allowSelfClosing: {
    'script': false,
    'div': false
}
</pre>
             *  </li>
             *  <li>
             *      <b>startTagOnly</b> (object): An object that defines which elements should only be
             *          written out with the opening tag and not the closing tags. For HTML5
             *          output that is not well-formed XML it is acceptable to write
             *          certain elements with the opening tag only.
             *          
             *          <p>
             *          Default value:
<pre>
startTagOnly: {
    'img': true,
    'br': true
}
</pre>
             *  </li>
             * </ul>
             * 
             * @param options Compiler options (see above)
             * @returns {templating.compiler$TemplateCompiler} The newly created compiler
             */
            createCompiler: function(options) {
                if (this.discoverTaglibs) { //Only discover taglibs if that method is implemented
                    this.discoverTaglibs(); //The discoverTaglibs method is implemented on the server so execute it now
                }
                
                var TemplateCompiler = raptor.require("templating.compiler.TemplateCompiler"); //Get a reference to the TemplateCompiler class 
                if (options) {
                    /*
                     * If options were provided then they should override the default options.
                     * NOTE: Only top-level properties are overridden
                     */
                    options = extend(
                            extend({}, defaultOptions), //Create a clone of the default options that can be extended 
                            options);
                }
                else {
                    options = defaultOptions; //Otherwise, no options were provided so use the default options
                }
                return new TemplateCompiler(taglibs, options);
            },
            
            /**
             * Compiles an XML template by creating a new compiler using the provided options and
             * then passing along the XML source code for the template to be compiled. 
             * 
             * For a list of options see {@link templating.compiler.createCompiler}
             * 
             * @param xmlSource {String} The XML source code for the template to compile
             * @param path {String} The path to the template (for debugging/error reporting purposes only)
             * @returns {String} The JavaScript code for the compiled template.
             */
            compile: function(xmlSource, path, options) {
                return this.createCompiler(options).compile(xmlSource, path);
            },
            
            /**
             * 
             * @param xmlSource {String} The XML source code for the template to compile
             * @param path {String} The path to the template (for debugging/error reporting purposes only)
             * @returns {void}
             */
            compileAndLoad: function(xmlSource, path, options) {
                this.createCompiler(options).compileAndLoad(xmlSource, path);
            },
            

            /**
             * 
             * @param taglibXml
             * @param path
             * @returns
             */
            loadTaglibXml: function(taglibXml, path) {
                var TaglibXmlLoader = raptor.require("templating.compiler.TaglibXmlLoader");
                var taglib = TaglibXmlLoader.load(taglibXml, path);
                this.addTaglib(taglib);
                return taglib;
            },
            
            /**
             * Adds a {@link templating.compiler$Taglib} instance to the internal {@link templating.compiler$TaglibCollection} so
             * that the taglib is available to all compilers.
             * 
             * @param taglib {templating.compiler$Taglib} The taglib to add
             * @returns {void}
             */
            addTaglib: function(taglib) {
                taglibs.add(taglib); 
            },
            
            clearTaglibs: function() {
                taglibs = new TaglibCollection();
            },
            
            hasTaglib: function(uri) {
                return taglibs.isTaglib(uri);
            },
            
            /**
             * 
             * Registers a custom expression handler with the given name and handler function.
             * 
             * <p>
             * Custom expression handlers are functions that can be used to control the compiled output
             * of certain expressions. Custom expression handlers are of the following form:
             * ${<handler-name>:<custom-expression>}
             * 
             * <p>
             * When a custom expression handler is used in a template then the provided handler
             * function will be invoked with two arguments:
             * <ul>
             *  <li><b>customExpression</b> (String) The custom expression provided in the template the (the part after the colon)</li>
             *  <li><b>helper</b> (ExpressionParserHelper) The helper that can be used to control the compiled output</li>
             * </ul>
             * 
             * @param name
             * @param func
             * @returns
             */
            registerCustomExpressionHandler: function(name, func) {
                ExpressionParser.custom[name] = func;
            },
            
            defaultOptions: defaultOptions,
            
            taglibs: taglibs
        };
    });

/*
 * Add a global function that can be used to register taglibs
 */
raptor.global.$rtld = function(taglib) {
    "use strict";
    raptor.require('templating.compiler').addTaglib(taglib);
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

raptor.defineClass(
    'templating.compiler.Node',
    function(raptor) {
        "use strict";
        
        var forEachEntry = raptor.forEachEntry,
            forEach = raptor.forEach,
            isArray = raptor.isArray,
            isEmpty = raptor.require('objects').isEmpty;
        
        var Node = function(nodeType) {
            if (!this.nodeType) {
                this._isRoot = false;
                this.preserveWhitespace = null;
                this.wordWrapEnabled = null;
                this.nodeType = nodeType;
                this.parentNode = null;
                this.previousSibling = null;
                this.nextSibling = null;
                this.firstChild = null;
                this.lastChild = null;
                this.namespaceMappings = {};
                this.prefixMappings = {};
                this.transformersApplied = {};
                this.properties = {};
            }
        };
        
        Node.prototype = {
            setRoot: function(isRoot) {
                this._isRoot = isRoot;
            },
            
            getPosition: function() {
                var pos = this.pos || this.getProperty("pos") || {
                    toString: function() {
                        return "(unknown position)";
                    }
                };
                
                return pos;
                
            },
            
            
            addError: function(error) {
                var compiler = this.compiler,
                    curNode = this;
                
                while (curNode != null && !compiler) {
                    compiler = curNode.compiler;
                    if (compiler) {
                        break;
                    }
                    curNode = curNode.parentNode;
                }
                
                if (!compiler) {
                    throw raptor.createError(new Error("Template compiler not set for node " + this));
                }
                var pos = this.getPosition();
                compiler.addError(error + " (" + this.toString() + ")", pos);
            },
            
            setProperty: function(name, value) {
                this.setPropertyNS(null, name, value);
            },
            
            setPropertyNS: function(uri, name, value) {
                if (!uri) {
                    uri = "";
                }
                var namespacedProps = this.properties[uri];
                if (!namespacedProps) {
                    namespacedProps = this.properties[uri] = {};
                }
                namespacedProps[name] = value;
            },
            
            setProperties: function(props) {
                this.setPropertiesNS(null, props);
            },
            
            setPropertiesNS: function(uri, props) {
                if (!uri) {
                    uri = "";
                }
                
                forEachEntry(props, function(name, value) {
                    this.setPropertyNS(uri, name, value);
                }, this);
            },
            
            getPropertyNamespaces: function() {
                return raptor.keys(this.properties);
            },
            
            getProperties: function(uri) {
                return this.getPropertiesNS(null);
            },
            
            hasProperty: function(name) {
                return this.hasPropertyNS('', name);
            },
            
            hasPropertyNS: function(uri, name) {
                if (!uri) {
                    uri = "";
                }
                var namespaceProps = this.properties[uri];
                return namespaceProps.hasOwnProperty(name);
            },
            
            getPropertiesByNS: function() {
                return this.properties;
            },
            
            getPropertiesNS: function(uri) {
                if (!uri) {
                    uri = "";
                }
                
                return this.properties[uri];
            },
            
            forEachProperty: function(callback, thisObj) {
                forEachEntry(this.properties, function(uri, properties) {
                    forEachEntry(properties, function(name, value) {
                        callback.call(thisObj, uri, name, value);
                    }, this);
                }, this);
            },
            
            getProperty: function(name) {
                return this.getPropertyNS(null, name);
            },
            
            getPropertyNS: function(uri, name) {
                if (!uri) {
                    uri = "";
                }
                
                var namespaceProps = this.properties[uri];
                return namespaceProps ? namespaceProps[name] : undefined;
            },
            
            removeProperty: function(name) {
                this.removePropertyNS("", name);
            },
            
            removePropertyNS: function(uri, name) {
                if (!uri) {
                    uri = "";
                }
                var namespaceProps = this.properties[uri];
                if (namespaceProps) {
                    delete namespaceProps[name];
                }
                
                if (isEmpty(namespaceProps)) {
                    delete this.properties[uri];
                }
                
            },
            
            removePropertiesNS: function(uri) {
                delete this.properties[uri];
            },
            
            forEachPropertyNS: function(uri, callback, thisObj) {
                if (uri == null) {
                    uri = '';
                }
                
                var props = this.properties[uri];
                if (props) {
                    forEachEntry(props, function(name, value) {
                        callback.call(thisObj, name, value);
                    }, this);
                }
            },
            
            forEachChild: function(callback, thisObj) {
                if (!this.firstChild) {
                    return;
                }
                
                /*
                 * Convert the child linked list to an array so that
                 * if the callback code manipulates the child nodes
                 * looping won't break
                 */
                var children = [];
                
                var curChild = this.firstChild;
                while(curChild) {
                    children.push(curChild);
                    curChild = curChild.nextSibling;
                }
                
                for (var i=0, len=children.length; i<len; i++) {
                    curChild = children[i];
                    if (curChild.parentNode === this) {
                        //Make sure the node is still a child of this node
                        if (false === callback.call(thisObj, curChild)) {
                            return;
                        }
                    }
                }
            },
            
            getExpression: function(template, childrenOnly) {
                if (!template) {
                    throw raptor.createError(new Error("template argument is required"));
                }
                
                var _this = this;
                return template.makeExpression({
                    toString: function() {
                        return template.captureCode(function() {
                            template.code("context.captureString(function() {\n")
                                .indent(function() {
                                    if (childrenOnly === true) {
                                        _this.generateCodeForChildren(template);
                                    }
                                    else {
                                        _this.generateCode(template);
                                    }
                                    
                                })
                                .code(template.indentStr() + "})");    
                        });
                        
                    }
                });
            },
            
            getBodyContentExpression: function(template) {
                return this.getExpression(template, true);
            },
        
            isTransformerApplied: function(transformer) {
                return this.transformersApplied[transformer.id] === true;
            },
            
            setTransformerApplied: function(transformer) {
                this.transformersApplied[transformer.id] = true;
            },
            
            hasChildren: function() {
                return this.firstChild != null;
            },
            
            appendChild: function(childNode) {
                
                if (childNode.parentNode) {
                    childNode.parentNode.removeChild(childNode);
                }
                
                if (!this.firstChild) {
                    this.firstChild = this.lastChild = childNode;
                    childNode.nextSibling = null;
                    childNode.previousSibling = null;
                }
                else {
                    this.lastChild.nextSibling = childNode;
                    childNode.previousSibling = this.lastChild;
                    this.lastChild = childNode;
                }
                
                childNode.parentNode = this;
            },
            
            appendChildren: function(childNodes) {
                if (!childNodes) {
                    return;
                }
                
                raptor.forEach(childNodes, function(childNode) {
                    this.appendChild(childNode);
                }, this);
            },
            
            isRoot: function() {
                return this._isRoot === true;
            },
            
            detach: function() {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            },
            
            removeChild: function(childNode) {
                
                if (childNode.parentNode !== this) { //Check if the child node is a child of the parent
                    return null;
                }
                
                var previousSibling = childNode.previousSibling,
                    nextSibling = childNode.nextSibling;
                
                if (this.firstChild === childNode && this.lastChild === childNode) {
                    //The child node is the one and only child node being removed
                    this.firstChild = this.lastChild = null;
                }
                else if (this.firstChild === childNode) {
                    //The child node being removed is the first child and there is another child after it
                    this.firstChild = this.firstChild.nextSibling; //Make the next child the first child
                    this.firstChild.previousSibling = null;
                }
                else if (this.lastChild === childNode) {
                    //The child node being removed is the last child and there is another child before it
                    this.lastChild = this.lastChild.previousSibling; //Make the previous child the last child
                    this.lastChild.nextSibling = null;
                }
                else {
                    previousSibling.nextSibling = nextSibling;
                    nextSibling.previousSibling = previousSibling;
                }
                
                //Make sure the removed node is completely detached
                childNode.parentNode = null;
                childNode.previousSibling = null;
                childNode.nextSibling = null;
                
                return childNode;
            },
            
            removeChildren: function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            },

            replaceChild: function(newChild, replacedChild) {
                
                if (newChild === replacedChild) {
                    return false;
                }
                
                if (!replacedChild) {
                    return false;
                }
                
                if (replacedChild.parentNode !== this) {
                    return false; //The parent does not have the replacedChild as a child... nothing to do
                }
                
                if (this.firstChild === replacedChild && this.lastChild === replacedChild) {
                    this.firstChild = newChild;
                    this.lastChild = newChild;
                    newChild.previousSibling = null;
                    newChild.nextSibling = null;
                }
                else if (this.firstChild === replacedChild) {
                    newChild.nextSibling = replacedChild.nextSibling;
                    replacedChild.nextSibling.previousSibling = newChild;
                    this.firstChild = newChild;
                }
                else if (this.lastChild === replacedChild) {
                    newChild.previousSibling = replacedChild;
                    replacedChild.previousSibling.nextSibling = newChild;
                    this.lastChild = newChild;
                }
                else {
                    replacedChild.nextSibling.previousSibling = newChild;
                    replacedChild.previousSibling.nextSibling = newChild;
                    newChild.nextSibling = replacedChild.nextSibling;
                    newChild.previousSibling = replacedChild.previousSibling;
                }
                
                newChild.parentNode = this;
                
                replacedChild.parentNode = null;
                replacedChild.previousSibling = null;
                replacedChild.nextSibling = null;
                
                return true;
            },
            
            insertAfter: function(node, referenceNode) {
                if (!node) {
                    return false;
                }
                
                if (referenceNode && referenceNode.parentNode !== this) {
                    return false;
                }
                
                if (isArray(node)) {
                    raptor.forEach(node, function(node) {
                        this.insertAfter(node, referenceNode);
                        referenceNode = node;
                    }, this);
                    return true;
                }
                
                if (node === referenceNode) {
                    return false;
                }
                
                if (referenceNode === this.lastChild) {
                    this.appendChild(node);
                    return true;
                }
                
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                
                if (!referenceNode || referenceNode === this.lastChild) {
                    this.appendChild(node);
                    return true;
                }
                else {
                    referenceNode.nextSibling.previousSibling = node;
                    node.nextSibling = referenceNode.nextSibling; 
                    node.previousSibling = referenceNode;
                    referenceNode.nextSibling = node;
                }
                
                node.parentNode = this;
                
                return true;
            },
            
            insertBefore: function(node, referenceNode) {
                if (!node) {
                    return false;
                }
                
                if (referenceNode && referenceNode.parentNode !== this) {
                    return false;
                }
                
                if (isArray(node)) {
                    
                    var nodes = node,
                        i;
                    
                    for (i=nodes.length-1;i>=0; i--) {
                        this.insertBefore(nodes[i], referenceNode);
                        referenceNode = nodes[i];
                    }
                    return true;
                }
                
                if (node === referenceNode) {
                    return false;
                }
                
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                
                if (!referenceNode) {
                    this.appendChild(node);
                }
                else if (this.firstChild === referenceNode) {
                    this.firstChild = node;
                    this.firstChild.nextSibling = referenceNode;
                    this.firstChild.previousSibling = null;
                    
                    referenceNode.previousSibling = this.firstChild;
                    node.parentNode = this;
                }
                else {
                    this.insertAfter(node, referenceNode.previousSibling);     
                }

                return true;
            },
            
            isTextNode: function() {
                return false;
            },
            
            isElementNode: function() {
                return false;
            },
            
            setStripExpression: function(stripExpression) {
                this.stripExpression = stripExpression;
            },
            
            normalizeText: function() {
                if (this.isTextNode()) {
                    var normalizedText = this.getText();
                    var curChild = this.nextSibling;
                    while(curChild && curChild.isTextNode()) {
                        normalizedText += curChild.getText();
                        var nodeToRemove = curChild;
                        curChild = curChild.nextSibling;
                        nodeToRemove.detach(); 
                    }
                    this.setText(normalizedText);
                }
            },
            
            generateCode: function(template) {
                this.compiler = template.compiler;
                
                var preserveWhitespace = this.isPreserveWhitespace();
                if (preserveWhitespace == null) {
                    preserveWhitespace = template.options.preserveWhitespace;
                    if (preserveWhitespace === true || (preserveWhitespace && preserveWhitespace["*"])) {
                        this.setPreserveWhitespace(true);
                    }
                    else {
                        this.setPreserveWhitespace(false);
                    }
                }
                
                var wordWrapEnabled = this.isWordWrapEnabled();
                if (wordWrapEnabled == null) {
                    wordWrapEnabled = template.options.wordWrapEnabled;
                    if (wordWrapEnabled !== false) {
                        this.setWordWrapEnabled(true);
                    }
                }
                
                if (this.isTextNode()) {
                    /*
                     * After all of the transformation of the tree we
                     * might have ended up with multiple text nodes
                     * as siblings. We want to normalize adjacent
                     * text nodes so that whitespace removal rules
                     * will be correct
                     */
                    this.normalizeText();    
                }
                
                try
                {
                    if (!this.stripExpression || this.stripExpression.toString() === 'false') {
                        this.doGenerateCode(template);
                    }
                    else if (this.stripExpression.toString() === 'true') {
                        this.generateCodeForChildren(template);
                    }
                    else {
                        //There is a strip expression
                        if (!this.generateBeforeCode || !this.generateAfterCode) {
                            this.addError("The c:strip directive is not supported for node " + this);
                            this.generateCodeForChildren(template);
                            return;
                        }
                        
                        var nextStripVarId = template.getAttribute("nextStripVarId");
                        if (nextStripVarId == null) {
                            nextStripVarId = template.setAttribute("nextStripVarId", 0);
                        }
                        var varName = '__strip' + (nextStripVarId++);
                        
                        template.statement('var ' + varName + ' = !(' + this.stripExpression + ');');
                        
                        template
                            .statement('if (' + varName + ') {')
                            .indent(function() {
                                this.generateBeforeCode(template);        
                            }, this)
                            .line("}");

                        
                        this.generateCodeForChildren(template);
                        
                        template
                            .statement('if (' + varName + ') {')
                            .indent(function() {
                                this.generateAfterCode(template);        
                            }, this)
                            .line("}");
                    }
                }
                catch(e) {
                    throw raptor.createError(new Error("Unable to generate code for node " + this + " at position [" + this.getPosition() + "]. Exception: " + e), e);
                }
            },
            
            /**
             * 
             * @returns {Boolean}
             */
            isPreserveWhitespace: function() {
                return this.preserveWhitespace; 
            },
            
            
            
            
            
            /**
             * 
             * @param preserve
             */
            setPreserveWhitespace: function(preserve) {
                this.preserveWhitespace = preserve;
            },
            
            isWordWrapEnabled: function() {
                return this.wordWrapEnabled; 
            },
            
            setWordWrapEnabled: function(enabled) {
                this.wordWrapEnabled = enabled;
            },
            
            doGenerateCode: function(template) {
                
                this.generateCodeForChildren(template);
            },
            
            generateCodeForChildren: function(template, indent) {
                if (!template) {
                    throw raptor.createError(new Error('The "template" argument is required'));
                }
                if (indent === true) {
                    template.incIndent();
                }
                
                this.forEachChild(function(childNode) {
                    if (childNode.isPreserveWhitespace() == null) {
                        childNode.setPreserveWhitespace(this.isPreserveWhitespace() === true);
                    }
                    
                    if (childNode.isWordWrapEnabled() == null) {
                        childNode.setWordWrapEnabled(this.isWordWrapEnabled() === true);
                    }
                    
                    childNode.generateCode(template);
                }, this);
                
                if (indent === true) {
                    template.decIndent();
                }
            },
            
            addNamespaceMappings: function(namespaceMappings) {
                if (!namespaceMappings) {
                    return;
                }
                var existingNamespaceMappings = this.namespaceMappings;
                var prefixMappings = this.prefixMappings;
                
                forEachEntry(namespaceMappings, function(prefix, uri) {
                    existingNamespaceMappings[prefix] = uri;
                    prefixMappings[uri] = prefix;
                });
            },
            
            resolveNamespacePrefix: function(uri) {
                var prefix = this.prefixMappings[uri];
                return (!prefix && this.parentNode) ?
                        this.parentNode.resolveNamespacePrefix() :
                        prefix;
            },
            
            getNodeClass: function() {
                return this.nodeClass || this.getClass();
            },
            
            setNodeClass: function(nodeClass) {
                this.nodeClass = nodeClass;
            },
            
            prettyPrintTree: function() {
                var out = [];
                var printNode = function(node, indent) {
                    out.push(indent + node.toString() + '\n');
                    
                    node.forEachChild(function(child) {
                        printNode(child, indent + "  ");
                    }, this);
                };
                
                printNode(this, "");
                
                return out.join('');
            }
        };
        
        return Node;
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

raptor.defineClass(
    'templating.compiler.ElementNode',
    'templating.compiler.Node',
    function() {
        "use strict";
        
        var forEachEntry = raptor.forEachEntry,
            forEach = raptor.forEach,
            objects = raptor.require('objects'),
            escapeXmlAttr = raptor.require("xml.utils").escapeXmlAttr,
            XML_URI = 'http://www.w3.org/XML/1998/namespace',
            XML_URI_ALT = 'http://www.w3.org/XML/1998/namespace',
            ExpressionParser = raptor.require('templating.compiler.ExpressionParser');
        
        var ElementNode = function(localName, uri, prefix) {
            ElementNode.superclass.constructor.call(this, 'element');
            
            if (!this._elementNode) {
                this._elementNode = true;

                this.dynamicAttributesExpression = null;
                this.attributesByNS = {};
                
                this.prefix = prefix;
                this.localName = this.tagName = localName;
                this.uri = uri;  
                
                this.allowSelfClosing = false;
                this.startTagOnly = false;
            }
            
        };
        
        ElementNode.prototype = {
                
            getQName: function() {
                return this.localName ? (this.prefix ? this.prefix + ":" : "") + this.localName : null;
            },
            
            /**
             * 
             * @param startTagOnly
             */
            setStartTagOnly: function(startTagOnly) {
                this.startTagOnly = true;
            },
            
            /**
             * 
             * @param allowSelfClosing
             */
            setAllowSelfClosing: function(allowSelfClosing) {
                this.allowSelfClosing = allowSelfClosing;
            },
            
            /**
             * 
             * @returns {Boolean}
             */
            isElementNode: function() {
                return true;
            },
            
            /**
             * 
             * @returns {Boolean}
             */
            isTextNode: function() {
                return false;
            },
            
            getAllAttributes: function() {
                var allAttrs = [];
                forEachEntry(this.attributesByNS, function(uri, attrs) {
                    forEachEntry(attrs, function(name, attr) {
                        allAttrs.push(attr);
                    });
                }, this);
                
                return allAttrs;
            },
            
            forEachAttributeAnyNS: function(callback, thisObj) {
                forEachEntry(this.attributesByNS, function(uri, attrs) {
                    forEachEntry(attrs, function(name, attr) {
                        callback.call(thisObj, attr);
                    });
                });
            },
            
            /**
             * 
             * @returns {Array}
             */
            getAttributes: function() {
                var attributes = [];
                forEachEntry(this.attributes, function(name, attr) {
                    attributes.push(attr);
                }, this);
                return attributes;
            },
            
            /**
             * 
             * @param name
             * @returns
             */
            getAttribute: function(name) {
                return this.getAttributeNS(null, name);
            },
            
            /**
             * 
             * @param uri
             * @param localName
             * @returns
             */
            getAttributeNS: function(uri, localName) {
                var attrNS = this.attributesByNS[uri || ''];
                var attr = attrNS ? attrNS[localName] : undefined;
                return attr ? attr.value : undefined;
            },
            
            /**
             * 
             * @param localName
             * @param value
             */
            setAttribute: function(localName, value) {
                this.setAttributeNS(null, localName, value);
            },
            
            /**
             * 
             * @param uri
             * @param localName
             * @param value
             * @param prefix
             */
            setAttributeNS: function(uri, localName, value, prefix) {
                
                var attrNS = this.attributesByNS[uri || ''] || (this.attributesByNS[uri || ''] = {});
                
                attrNS[localName] = {
                    localName: localName,
                    value: value,
                    prefix: prefix,
                    uri: uri,
                    qName: prefix ? (prefix + ":" + localName) : localName,
                    name: uri ? (uri + ":" + localName) : localName,
                    toString: function() {
                        return this.name;
                    }
                };
            },
            
            /**
             * 
             * @param name
             */
            setEmptyAttribute: function(name) {
                this.setAttribute(name, null);
            },
            
            /**
             * 
             * @param localName
             */
            removeAttribute: function(localName) {
                this.removeAttributeNS(null, localName);
            },
            
            /**
             * 
             * @param uri
             * @param localName
             */
            removeAttributeNS: function(uri, localName) {
                var attrNS = this.attributesByNS[uri || ''] || (this.attributesByNS[uri || ''] = {});
                if (attrNS) {
                    delete attrNS[localName];
                    if (objects.isEmpty(attrNS)) {
                        delete this.attributesByNS[uri || ''];
                    }
                }
            },
            
            /**
             * 
             * @returns {Boolean}
             */
            isPreserveWhitespace: function() {
                var preserveSpace = ElementNode.superclass.isPreserveWhitespace.call(this);
                
                if (preserveSpace === true) {
                    return true;
                }
                
                var preserveAttr = this.getAttributeNS(XML_URI, "space") || this.getAttributeNS(XML_URI_ALT, "space") || this.getAttribute("xml:space") === "preserve";
                if (preserveAttr === 'preserve') {
                    return true;
                }
                
                
                return preserveSpace; 
            },
            
            hasAttributesAnyNS: function() {
                return !objects.isEmpty(this.attributesByNS);
            },
            
            hasAttributes: function() {
                return this.hasAttributesNS('');
            },
            
            hasAttributesNS: function(uri) {
                return this.attributesByNS[uri || ''] !== undefined;
            },
            
            hasAttribute: function(localName) {
                return this.hasAttributeNS('', localName);
            },
            
            hasAttributeNS: function(uri, localName) {
                var attrsNS = this.attributesByNS[uri || ''];
                return attrsNS ? attrsNS.hasOwnProperty(localName) : false;
            },
            
            removePreserveSpaceAttr: function() {
                this.removeAttributeNS(XML_URI, "space");
                this.removeAttributeNS(XML_URI_ALT, "space");
                this.removeAttribute("space");
            },
            
            setStripExpression: function(stripExpression) {
                this.stripExpression = stripExpression;
            },
            
            /**
             * 
             * @param template
             */
            doGenerateCode: function(template) {
                this.generateBeforeCode(template);
                this.generateCodeForChildren(template);
                this.generateAfterCode(template);
            },
            
            generateBeforeCode: function(template) {
                var preserveWhitespace = this.preserveWhitespace = this.isPreserveWhitespace();
                
                var name = this.prefix ? (this.prefix + ":" + this.localName) : this.localName;
                
                if (preserveWhitespace) {
                    this.removePreserveSpaceAttr();
                }
                
                template.text("<" + name);
                
                this.forEachAttributeAnyNS(function(attr) {
                    var prefix = attr.prefix;
                    if (!prefix && attr.uri) {
                        prefix = this.resolveNamespacePrefix(attr.uri);
                    }
                    
                    if (prefix) {
                        name = prefix + (attr.localName ? (":" + attr.localName) : "");
                    }
                    else {
                        name = attr.localName;
                    }
                    
                    if (attr.value === null || attr.value === undefined) {
                        template.text(' ' + name);
                    }
                    else if (template.isExpression(attr.value)) {
                        
                        template.attr(name, attr.value);
                    }
                    else {
                        
                        var attrParts = [],
                            hasExpression = false,
                            invalidAttr = false;
                        
                        ExpressionParser.parse(
                                attr.value,
                                {
                                    text: function(text) {
                                        attrParts.push({
                                            text: text
                                        });
                                    },
                                    xml: function(text) {
                                        attrParts.push({
                                            xml: text
                                        });
                                    },
                                    expression: function(expression) {
                                        hasExpression = true;
                                        
                                        attrParts.push({
                                            expression: expression
                                        });
                                    },
                                    error: function(message) {
                                        invalidAttr = true;
                                        this.addError('Invalid expression found in attribute "' + name + '". ' + message);
                                    }
                                },
                                this,
                                {
                                    custom: {
                                        "entity": function(expression, helper) {
                                            helper.add('xml', "&" + expression + ";"); 
                                        }
                                    }
                                });
                        if (invalidAttr) {
                            template.text(name + '="' + escapeXmlAttr(attr.value) + '"');    
                        }
                        else {
                            if (hasExpression && attrParts.length === 1) {
                                template.attr(name, attrParts[0].expression);
                            }
                            else {
                                template.text(' ' + name + '="');
                                forEach(attrParts, function(part) {
                                   if (part.text) {
                                       template.text(escapeXmlAttr(part.text));
                                   } 
                                   else if (part.xml) {
                                       template.text(part.xml);
                                   }
                                   else if (part.expression) {
                                       template.write(part.expression, {escapeXmlAttr: true});
                                   }
                                   else {
                                       throw raptor.createError(new Error("Illegal state"));
                                   }
                                });
                                template.text('"');
                            }
                        }
                        
                        
                    }
                }, this);
                
                
                if (this.dynamicAttributesExpression) {
                    template.attrs(this.dynamicAttributesExpression);
                }
                
                if (this.hasChildren()) {
                    template.text(">");
                }
                else {
                    if (this.startTagOnly) {
                        template.text(">");
                    }
                    else if (this.allowSelfClosing) {
                        template.text("/>");
                    }
                }
            },
            
            generateAfterCode: function(template) {
                var name = this.prefix ? (this.prefix + ":" + this.localName) : this.localName;
                
                if (this.hasChildren()) {
                    template.text("</" + name + ">");
                }
                else {
                    if (!this.startTagOnly && !this.allowSelfClosing) {
                        template.text("></" + name + ">");
                    }
                }
            },
            
            toString: function() {
                return "<" + (this.prefix ? (this.prefix + ":" + this.localName) : this.localName) + ">";
            }
        
        };
        
        return ElementNode;
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

raptor.defineClass(
    'templating.compiler.TextNode',
    'templating.compiler.Node',
    function() {
        "use strict";
        
        var strings = raptor.require('strings');
        
        var TextNode = function(text) {
            TextNode.superclass.constructor.call(this, 'text');
            this.text = text;
        };
        
        TextNode.prototype = {
            doGenerateCode: function(template) {
                var text = this.text;
                if (text) {
                    var preserveWhitespace = this.isPreserveWhitespace();
                    
                    if (!preserveWhitespace) {
                        
                        if (!this.previousSibling) {
                            //First child
                            text = text.replace(/^\n\s*/g, "");  
                        }
                        if (!this.nextSibling) {
                            //Last child
                            text = text.replace(/\n\s*$/g, ""); 
                        }
                        
                        if (/^\n\s*$/.test(text)) { //Whitespace between elements
                            text = '';
                        }
                        
                        text = text.replace(/\s+/g, " ");
                        
                        
                        if (this.isWordWrapEnabled() && text.length > 80) {
                            
                            var start=0,
                                end;
                            
                            while (start < text.length) {
                                end = Math.min(start+80, text.length);
                                
                                var lastSpace = text.substring(start, end).lastIndexOf(' ');
                                if (lastSpace != -1) {
                                    lastSpace = lastSpace + start; //Adjust offset into original string
                                }
                                else {
                                    lastSpace = text.indexOf(' ', end); //No space before the 80 column mark... search for the first space after to break on
                                }
                                
                                if (lastSpace != -1) {
                                    text = text.substring(0, lastSpace) + "\n" + text.substring(lastSpace+1);
                                    start = lastSpace + 1;
                                }
                                else {
                                    break;
                                }
                                
                            }
                        }
                    }

                    template.text(text);
                }
            },
            
            getText: function() {
                return this.text;
            },
            
            setText: function(text) {
                this.text = text;
            },
            
            isTextNode: function() {
                return true;
            },
            
            isElementNode: function() {
                return false;
            },
            
            toString: function() {
                var text = this.text && this.text.length > 25 ? this.text.substring(0, 25) + '...' : this.text;
                text = text.replace(/[\n]/g, '\\n');
                return "[text: " + text + "]";
            }
        };
        
        return TextNode;
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

raptor.defineClass(
    'templating.compiler.ParseTreeBuilder',
    function() {
        "use strict";
        
        var sax = raptor.require("xml.sax"),
            forEach = raptor.forEach,
            TextNode = raptor.require('templating.compiler.TextNode'),
            ElementNode = raptor.require('templating.compiler.ElementNode');
            
          
        var ParseTreeBuilder = function() {
        };
        
        ParseTreeBuilder.parse = function(src, filePath, taglibs) {
            var builder = new ParseTreeBuilder();
            return builder.parse(src, filePath, taglibs);
        };
        
        ParseTreeBuilder.prototype = {
            /**
             * @param src {String} The XML source code to parse
             * @param src {String} The file path (for debugging and error reporting purposes)
             * @param taglibs {templating.compiler$TaglibCollection} The taglib collection. Required for resolving taglib URIs when short names are used. 
             */
            parse: function(src, filePath, taglibs) {
                var logger = this.logger(),
                    parentNode = null,
                    rootNode = null,
                    prevTextNode = null,
                    imports;
                
                var parser = sax.createParser({
                        trim: false,
                        normalize: false,
                        dom: src.documentElement != null
                    });
                
                
                parser.on({
                    error: function(e) {
                        throw raptor.createError(e);
                    },
                    
                    characters: function(t) {
                        if (!parentNode) {
                            return; //Some bad XML parsers allow text after the ending element...
                        }
                        if (prevTextNode) {
                            prevTextNode.text += t;
                        }
                        else {
                            prevTextNode = new TextNode(t);
                            prevTextNode.pos = parser.getPos();
                            parentNode.appendChild(prevTextNode);
                        }
                        
                    },
                    
                    startElement: function(el) {
                        prevTextNode = null;
                        var importsAttr,
                            importedAttr,
                            importedTag;
                        
                        var elementNode = new ElementNode(
                                el.getLocalName(),
                                taglibs.resolveURI(el.getNamespaceURI()),
                                el.getPrefix());
                        
                        
                        elementNode.addNamespaceMappings(el.getNamespaceMappings());
                        
                        elementNode.pos = parser.getPos();
                        
                        forEach(el.getAttributes(), function(attr) {
                            if (attr.getLocalName() === 'imports' && !attr.getNamespaceURI()) {
                                importsAttr = attr.getValue();
                            }
                        }, this);
                        
                        
                        
                        if (parentNode) {
                            
                            parentNode.appendChild(elementNode);
                        }
                        else {
                            rootNode = elementNode;
                            if (importsAttr) {
                                imports = taglibs.getImports(importsAttr);
                            }
                        }
                        
                        forEach(el.getAttributes(), function(attr) {
                            var attrURI = taglibs.resolveURI(attr.getNamespaceURI()),
                                attrLocalName = attr.getLocalName(),
                                attrPrefix = attr.getPrefix();
                            
                            
                            if (!attrURI && imports && (importedAttr = imports.getImportedAttribute(attrLocalName))) {     
                                attrURI = importedAttr.uri;
                                attrLocalName = importedAttr.name;
                                attrPrefix = importedAttr.prefix;
                            }
                            
                            elementNode.setAttributeNS(
                                    attrURI, 
                                    attrLocalName, 
                                    attr.getValue(), 
                                    attrPrefix);
                        }, this);
                        
                        if (!elementNode.uri && imports && (importedTag = imports.getImportedTag(elementNode.localName))) {
                            elementNode.uri = importedTag.uri;
                            elementNode.localName = importedTag.name;
                            elementNode.prefix = importedTag.prefix;
                        }
                        
                        parentNode = elementNode;
                    },
                    
                    endElement: function () {
                        prevTextNode = null;
                        
                        parentNode = parentNode.parentNode;
                    }
                }, this);
                
                parser.parse(src, filePath);
                
                rootNode.setRoot(true);
                
                return rootNode;
            },
            
            getRootNode: function() {
                return this.rootNode;
            }
        };
        
        return ParseTreeBuilder;
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

raptor.defineClass(
    "templating.compiler.TaglibXmlLoader",
    function(raptor) {
        "use strict";
        
        var objectMapper = raptor.require('xml.sax.object-mapper'),
            regexp = raptor.require('regexp'),
            Taglib = raptor.require('templating.compiler.Taglib'),
            Tag = Taglib.Tag,
            Attribute = Taglib.Attribute,
            NestedVariable = Taglib.NestedVariable,
            ImportedVariable = Taglib.ImportedVariable,
            Transformer = Taglib.Transformer,
            Function = Taglib.Function,
            STRING = "string",
            BOOLEAN = "boolean",
            OBJECT = "object";
        
        var TaglibXmlLoader = function(src, path) {
            this.src = src;
            this.filePath = path;
        };
        
        TaglibXmlLoader.load = function(src, filePath) {
            var loader = new TaglibXmlLoader(src, filePath);
            return loader.load();
        };
        
        TaglibXmlLoader.prototype = {
            load: function() {
                var src = this.src, 
                    filePath = this.filePath,
                    logger = this.logger(),
                    tagsById = {},
                    extendTag = function(subTag) {
                        var extendsId = subTag['extends'];
                        
                        delete subTag['extends'];
                        
                        var superTag = tagsById[extendsId];
                        if (!superTag) {
                            throw raptor.createError(new Error('Parent tag with ID "' + extendsId + '" not found in taglib at path "' + filePath + '"'));
                        }
                        
                        if (superTag['extends']) {
                            extendTag(superTag);
                        }
                        
                        /*
                         * Have the sub tag inherit any properties from the super tag that are not in the sub tag
                         */
                        raptor.forEachEntry(superTag, function(k, v) {
                            if (subTag[k] === undefined) {
                                subTag[k] = v;
                            }
                        });
                        
                        /*
                         * Copy any attributes from the super tag that are not found in the sub tag 
                         */
                        if (subTag.attributeMap && superTag.attributeMap && subTag.attributeMap !== superTag.attributeMap) {
                            raptor.forEachEntry(superTag.attributeMap, function(k, v) {
                                if (!subTag.attributeMap[k]) {
                                    subTag.attributeMap[k] = v;
                                }
                            });
                        }
                        else if (superTag.attributeMap) {
                            subTag.attributemap = superTag.attributeMap; 
                        }
                    },
                    handleExtends = function(tags) {

                        if (!tags) {
                            return;
                        }
                        
                        for (var i=0, len=tags.length; i<len; i++) {
                            var tag = tags[i];
                            if (tag['extends']) {
                                extendTag(tag);
                            }
                        }
                    };
                    
                var taglib;
                var attributeHandler = {
                        _type: OBJECT,
                        
                        _begin: function() {
                            return new Attribute(); 
                            
                        },
                        _end: function(attr, parent) {
                            parent.addAttribute(attr);
                        },
                        
                        "name": {
                            _type: STRING
                        },
                        
                        "pattern": {
                            _type: STRING,
                            _set: function(parent, name, value) {
                                var patternRegExp = regexp.simple(value);
                                parent.pattern = patternRegExp;
                            }
                        },
                        
                        "target-property": {
                            _type: STRING,
                            _targetProp: "targetProperty"
                        },
                        
                        "uri": {
                            _type: STRING
                        },
                        
                        "deprecated": {
                            _type: STRING
                        },
                        
                        "required": {
                            _type: BOOLEAN
                        },
                        
                        "type": {
                            _type: STRING
                        },
                        
                        "allow-expressions": {
                            _type: BOOLEAN,
                            _targetProp: "allowExpressions"
                        }
                    };
                
                var handlers = {
                        "raptor-taglib": { 
                            _type: OBJECT,
                            
                            _begin: function() {
                                var newTaglib = new Taglib();
                                
                                if (!taglib) {
                                    taglib = newTaglib;
                                }
                                
                                
                                return newTaglib;
                            },
                            
                            "attribute": attributeHandler,
                            
                            "tlib-version": {
                                _type: STRING,
                                _targetProp: "version"
                            },
                            
                            "short-name": {
                                _type: STRING,
                                _targetProp: "shortName"
                            },
                            "uri": {
                                _type: STRING
                            },
                            
                            "prefix": {
                                _type: STRING
                            },
                            
                            "tag": {
                                _type: OBJECT,
                                
                                _begin: function() {
                                    return new Tag();
                                },
                                
                                _end: function(tag) {
                                    if (tag.uri === null) {
                                        tag.uri = taglib.uri;
                                    }
                                    
                                    taglib.addTag(tag);
                                    
                                    if (tag.id) {
                                        tagsById[tag.id] = tag;
                                    }
                                },
                                
                                "name": {
                                    _type: STRING,
                                    _targetProp: "name"
                                },
                                "uri": {
                                    _type: STRING,
                                    _set: function(tag, name, value, context) {
                                        tag.uri = value || '';
                                    }
                                },
                                "id": {
                                    _type: STRING
                                },
                                "preserveSpace": {
                                    _type: BOOLEAN,
                                    _targetProp: "preserveWhitespace"
                                },
                                "preserve-space": {
                                    _type: BOOLEAN,
                                    _targetProp: "preserveWhitespace"
                                },
                                "preserve-whitespace": {
                                    _type: BOOLEAN,
                                    _targetProp: "preserveWhitespace"
                                },
                                "preserveWhitespace": {
                                    _type: BOOLEAN,
                                    _targetProp: "preserveWhitespace"
                                },
                                "extends": {
                                    _type: STRING,
                                    _targetProp: "extends"
                                },
                                "handler-class": {
                                    _type: STRING,
                                    _targetProp: "handlerClass"
                                },
                                "node-class": {
                                    _type: STRING,
                                    _targetProp: "nodeClass"
                                },
                                "dynamic-attributes": {
                                    _type: BOOLEAN,
                                    _targetProp: "dynamicAttributes"
                                },
                                
                                "attribute": attributeHandler,
                                
                                "<nested-tag>": {
                                    _type: OBJECT,
                                    
                                    _begin: function() {
                                        return new Tag();
                                    },
                                    
                                    _end: function(nestedTag, tag) {
                                        if (nestedTag.uri === null || nestedTag.uri === undefined) {
                                            nestedTag.uri = taglib.uri;
                                        }
                                        
                                        nestedTag.targetProperty = nestedTag.targetProperty || nestedTag.name;
                                        
                                        if (!nestedTag.name) {
                                            throw raptor.createError(new Error('The "name" property is required for a <nested-tag>'));
                                        }
                                        
                                        tag.addNestedTag(nestedTag);
                                    },
                                    
                                    "name": {
                                        _type: STRING
                                    },
                                    
                                    "type": {
                                        _type: STRING
                                    },
                                    
                                    "target-property": {
                                        _type: STRING,
                                        _targetProp: "targetProperty"
                                    }
                                },
                                
                                "nested-variable": {
                                    _type: OBJECT,
                                    
                                    _begin: function() {
                                        return new NestedVariable();
                                    },
                                    _end: function(nestedVariable, tag) {
                                        
                                        if (!nestedVariable.name) {
                                            throw raptor.createError(new Error('The "name" attribute is required for a nested variable'));
                                        }

                                        tag.addNestedVariable(nestedVariable);
                                    },
                                    
                                    "name": {
                                        _type: STRING,
                                        _targetProp: "name"
                                    }
                                },
                                
                                "imported-variable": {
                                    _type: OBJECT,
                                    
                                    _begin: function() {
                                        return new ImportedVariable();
                                    },
                                    _end: function(importedVariable, tag) {
                                        if (!importedVariable.targetProperty) {
                                            throw raptor.createError(new Error('The "target-property" attribute is required for an imported variable'));
                                        }
                                        if (!importedVariable.expression) {
                                            throw raptor.createError(new Error('The "expression" attribute is required for an imported variable'));
                                        }
                                        tag.addImportedVariable(importedVariable);
                                    },
                                    
                                    "target-property": {
                                        _type: STRING,
                                        _targetProp: "targetProperty"
                                    },
                                    
                                    "expression": {
                                        _type: STRING
                                    }
                                },
                                
                                "transformer-class": {
                                    _type: STRING,
                                    _set: function(tag, name, value) {
                                        var transformer = new Transformer();
                                        transformer.className = value;
                                        tag.addTransformer(transformer);
                                    }
                                },
                                
                                "transformer": {
                                    _type: OBJECT,
                                    
                                    _begin: function() {
                                        return new Transformer();
                                    },
                                    
                                    _end: function(transformer, tag) {
                                        tag.addTransformer(transformer);
                                    },
                                    
                                    "class-name": {
                                        _type: STRING,
                                        _targetProp: "className"
                                    },
                                    
                                    "after": {
                                        _type: STRING,
                                        _targetProp: "after"
                                    },
                                    
                                    "before": {
                                        _type: STRING,
                                        _targetProp: "before"
                                    },
                                    
                                    "<properties>": {
                                        _type: OBJECT,
                                        
                                        _begin: function(parent) {
                                            return (parent.properties = {});
                                        },
                                        
                                        "<*>": {
                                            _type: STRING
                                        }
                                    }
                                }
                            },
                            //end "tag"
                            
                            "text-transformer": {
                                _type: OBJECT,
                                
                                _begin: function() {
                                    return new Transformer();
                                },
                                
                                _end: function(textTransformer) {
                                    taglib.addTextTransformer(textTransformer);
                                },
                                
                                "class-name": {
                                    _type: STRING,
                                    _targetProp: "className"
                                }
                            },
                            
                            "import-taglib": {
                                _type: OBJECT,
                                
                                _begin: function() {
                                    return {};
                                    
                                },
                                
                                _end: function(importedTaglib) {
                                    var path = importedTaglib.path,
                                        taglibResource = raptor.require('resources').findResource(path),
                                        importedXmlSource;
                                    
                                    if (!taglibResource.exists()) {
                                        throw raptor.createError(new Error('Imported taglib with path "' + path + '" not found in taglib at path "' + filePath + '"'));
                                    }
                                    
                                    importedXmlSource = taglibResource.readAsString();
                                    
                                    objectMapper.read(
                                            importedXmlSource, 
                                            taglibResource.getSystemPath(),  
                                            handlers);
                                    
                                },
                                
                                "path": {
                                    _type: STRING
                                }
                            },
                            
                            "function": {
                                _type: OBJECT,
                                
                                _begin: function() {
                                    return new Function();
                                },
                                
                                _end: function(func) {
                                    taglib.addFunction(func);
                                },
                                
                                "name": {
                                    _type: STRING
                                },
                                
                                "class": {
                                    _type: STRING,
                                    _targetProp: "functionClass"
                                },
                                
                                "bind-to-context": {
                                    _type: BOOLEAN,
                                    _targetProp: "bindToContext"
                                }
                            }
                            
                        }
                    };
                
                objectMapper.read(
                    src, 
                    filePath,  
                    handlers);
                
                handleExtends(taglib.tags);
                
                return taglib;
            }
        };
        
        return TaglibXmlLoader;
        
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
 * @extension Server
 */
raptor.extend(
    "templating.compiler",
    function(raptor, compiler) {
        "use strict";
        
        var discoveryComplete = false;
        
        return {
            
            /**
             * 
             * @returns
             */
            discoverTaglibs: function() {
                if (discoveryComplete) {
                    return;
                }
                discoveryComplete = true;
                
                var taglibPaths = $rget("rtld");
                
                raptor.forEach(taglibPaths, function(path) {
                    var resource = raptor.require('resources').findResource(path);
                    if (resource && resource.exists()) {
                        this.loadTaglibXml(resource.readAsString(), resource.getPath());    
                    }
                    
                }, this);
            }
           
        };
    });