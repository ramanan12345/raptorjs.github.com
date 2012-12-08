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

/*jshint strict:false */
$renv='client';
// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Sch�fer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta Copyright (C) 2011 MIT Licence
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy (C) 2011 Creative Commons Zero (public domain)
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola Copyright (C) 2011 MIT License
// -- xavierm02 Montillet Xavier Copyright (C) 2011 MIT License
// -- Raynos Jake Verbaten Copyright (C) 2011 MIT Licence
// -- samsonjs Sami Samhuri Copyright (C) 2010 MIT License
// -- rwldrn Rick Waldron Copyright (C) 2011 MIT License
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

// Module systems magic dance
//(function (definition) {
//    // RequireJS
//    if (typeof define == "function") {
//        define(definition);
//    // YUI3
//    } else if (typeof YUI == "function") {
//        YUI.add("es5", definition);
//    // CommonJS and <script>
//    } else {
//        definition();
//    }
//})

(function () {

/*jshint evil: true, strict: false, regexp: false */

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer
var toInteger = function (n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
};

var prepareString = "a"[0] != "a";
    // ES5 9.9
    // http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    // If the implementation doesn't support by-index access of
    // string characters (ex. IE < 9), split the string
    if (prepareString && typeof o == "string" && o) {
        return o.split("");
    }
    return Object(o);
};

var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var F = function(){};
                F.prototype = target.prototype;
                var self = new F;

                var result = target.apply(
                    self,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // XXX bound.length is never writable, so don't even try
        //
        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.
        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.

// Having a toString local variable name breaks in Opera so use _toString.
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

//// If JS engine supports accessors creating shortcuts.
//var defineGetter;
//var defineSetter;
//var lookupGetter;
//var lookupSetter;
//var supportsAccessors;
//if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
//    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
//    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
//    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
//    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
//}

//
// Array
// =====
//

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var self = toObject(this),
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object context
                fun.call(thisp, self[i], i, self);
            }
        }
    };
}

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, self);
        }
        return result;
    };
}

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, self)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, self)) {
                return false;
            }
        }
        return true;
    };
}

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, self)) {
                return true;
            }
        }
        return false;
    };
}

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, self);
            }
        }

        return result;
    };
}

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, self);
            }
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}

//
// Object
// ======
//

//// ES5 15.2.3.2
//// http://es5.github.com/#x15.2.3.2
//if (!Object.getPrototypeOf) {
//    // https://github.com/kriskowal/es5-shim/issues#issue/2
//    // http://ejohn.org/blog/objectgetprototypeof/
//    // recommended by fschaefer on github
//    Object.getPrototypeOf = function getPrototypeOf(object) {
//        return object.__proto__ || (
//            object.constructor
//                ? object.constructor.prototype
//                : prototypeOfObject
//        );
//    };
//}
//
//// ES5 15.2.3.3
//// http://es5.github.com/#x15.2.3.3
//if (!Object.getOwnPropertyDescriptor) {
//    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a non-object: ";
//
//    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
//        if ((typeof object != "object" && typeof object != "function") || object === null) {
//            throw new TypeError(ERR_NON_OBJECT + object);
//        }
//        // If object does not owns property return undefined immediately.
//        if (!owns(object, property)) {
//            return;
//        }
//
//        // If object has a property then it's for sure both `enumerable` and
//        // `configurable`.
//        var descriptor =  { enumerable: true, configurable: true };
//
//        // If JS engine supports accessor properties then property may be a
//        // getter or setter.
//        if (supportsAccessors) {
//            // Unfortunately `__lookupGetter__` will return a getter even
//            // if object has own non getter property along with a same named
//            // inherited getter. To avoid misbehavior we temporary remove
//            // `__proto__` so that `__lookupGetter__` will return getter only
//            // if it's owned by an object.
//            var prototype = object.__proto__;
//            object.__proto__ = prototypeOfObject;
//
//            var getter = lookupGetter(object, property);
//            var setter = lookupSetter(object, property);
//
//            // Once we have getter and setter we can put values back.
//            object.__proto__ = prototype;
//
//            if (getter || setter) {
//                if (getter) {
//                    descriptor.get = getter;
//                }
//                if (setter) {
//                    descriptor.set = setter;
//                }
//                // If it was accessor property we're done and return here
//                // in order to avoid adding `value` to the descriptor.
//                return descriptor;
//            }
//        }
//
//        // If we got this far we know that object has an own property that is
//        // not an accessor so we set it as a value and return descriptor.
//        descriptor.value = object[property];
//        return descriptor;
//    };
//}
//
//// ES5 15.2.3.4
//// http://es5.github.com/#x15.2.3.4
//if (!Object.getOwnPropertyNames) {
//    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
//        return Object.keys(object);
//    };
//}
//
//// ES5 15.2.3.5
//// http://es5.github.com/#x15.2.3.5
//if (!Object.create) {
//    Object.create = function create(prototype, properties) {
//        var object;
//        if (prototype === null) {
//            object = { "__proto__": null };
//        } else {
//            if (typeof prototype != "object") {
//                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
//            }
//            var Type = function () {};
//            Type.prototype = prototype;
//            object = new Type();
//            // IE has no built-in implementation of `Object.getPrototypeOf`
//            // neither `__proto__`, but this manually setting `__proto__` will
//            // guarantee that `Object.getPrototypeOf` will work as expected with
//            // objects created using `Object.create`
//            object.__proto__ = prototype;
//        }
//        if (properties !== void 0) {
//            Object.defineProperties(object, properties);
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.6
//// http://es5.github.com/#x15.2.3.6
//
//// Patch for WebKit and IE8 standard mode
//// Designed by hax <hax.github.com>
//// related issue: https://github.com/kriskowal/es5-shim/issues#issue/5
//// IE8 Reference:
////     http://msdn.microsoft.com/en-us/library/dd282900.aspx
////     http://msdn.microsoft.com/en-us/library/dd229916.aspx
//// WebKit Bugs:
////     https://bugs.webkit.org/show_bug.cgi?id=36423
//
//function doesDefinePropertyWork(object) {
//    try {
//        Object.defineProperty(object, "sentinel", {});
//        return "sentinel" in object;
//    } catch (exception) {
//        // returns falsy
//    }
//}
//
//// check whether defineProperty works if it's given. Otherwise,
//// shim partially.
//if (Object.defineProperty) {
//    var definePropertyWorksOnObject = doesDefinePropertyWork({});
//    var definePropertyWorksOnDom = typeof document == "undefined" ||
//        doesDefinePropertyWork(document.createElement("div"));
//    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
//        var definePropertyFallback = Object.defineProperty;
//    }
//}
//
//if (!Object.defineProperty || definePropertyFallback) {
//    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
//    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
//    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
//                                      "on this javascript engine";
//
//    Object.defineProperty = function defineProperty(object, property, descriptor) {
//        if ((typeof object != "object" && typeof object != "function") || object === null) {
//            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
//        }
//        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null) {
//            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
//        }
//        // make a valiant attempt to use the real defineProperty
//        // for I8's DOM elements.
//        if (definePropertyFallback) {
//            try {
//                return definePropertyFallback.call(Object, object, property, descriptor);
//            } catch (exception) {
//                // try the shim if the real one doesn't work
//            }
//        }
//
//        // If it's a data property.
//        if (owns(descriptor, "value")) {
//            // fail silently if "writable", "enumerable", or "configurable"
//            // are requested but not supported
//            /*
//            // alternate approach:
//            if ( // can't implement these features; allow false but not true
//                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
//                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
//                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
//            )
//                throw new RangeError(
//                    "This implementation of Object.defineProperty does not " +
//                    "support configurable, enumerable, or writable."
//                );
//            */
//
//            if (supportsAccessors && (lookupGetter(object, property) ||
//                                      lookupSetter(object, property)))
//            {
//                // As accessors are supported only on engines implementing
//                // `__proto__` we can safely override `__proto__` while defining
//                // a property to make sure that we don't hit an inherited
//                // accessor.
//                var prototype = object.__proto__;
//                object.__proto__ = prototypeOfObject;
//                // Deleting a property anyway since getter / setter may be
//                // defined on object itself.
//                delete object[property];
//                object[property] = descriptor.value;
//                // Setting original `__proto__` back now.
//                object.__proto__ = prototype;
//            } else {
//                object[property] = descriptor.value;
//            }
//        } else {
//            if (!supportsAccessors) {
//                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
//            }
//            // If we got that far then getters and setters can be defined !!
//            if (owns(descriptor, "get")) {
//                defineGetter(object, property, descriptor.get);
//            }
//            if (owns(descriptor, "set")) {
//                defineSetter(object, property, descriptor.set);
//            }
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.7
//// http://es5.github.com/#x15.2.3.7
//if (!Object.defineProperties) {
//    Object.defineProperties = function defineProperties(object, properties) {
//        for (var property in properties) {
//            if (owns(properties, property) && property != "__proto__") {
//                Object.defineProperty(object, property, properties[property]);
//            }
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.8
//// http://es5.github.com/#x15.2.3.8
//if (!Object.seal) {
//    Object.seal = function seal(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// ES5 15.2.3.9
//// http://es5.github.com/#x15.2.3.9
//if (!Object.freeze) {
//    Object.freeze = function freeze(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// detect a Rhino bug and patch it
//try {
//    Object.freeze(function () {});
//} catch (exception) {
//    Object.freeze = (function freeze(freezeObject) {
//        return function freeze(object) {
//            if (typeof object == "function") {
//                return object;
//            } else {
//                return freezeObject(object);
//            }
//        };
//    })(Object.freeze);
//}
//
//// ES5 15.2.3.10
//// http://es5.github.com/#x15.2.3.10
//if (!Object.preventExtensions) {
//    Object.preventExtensions = function preventExtensions(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// ES5 15.2.3.11
//// http://es5.github.com/#x15.2.3.11
//if (!Object.isSealed) {
//    Object.isSealed = function isSealed(object) {
//        return false;
//    };
//}
//
//// ES5 15.2.3.12
//// http://es5.github.com/#x15.2.3.12
//if (!Object.isFrozen) {
//    Object.isFrozen = function isFrozen(object) {
//        return false;
//    };
//}
//
//// ES5 15.2.3.13
//// http://es5.github.com/#x15.2.3.13
//if (!Object.isExtensible) {
//    Object.isExtensible = function isExtensible(object) {
//        // 1. If Type(O) is not Object throw a TypeError exception.
//        if (Object(object) !== object) {
//            throw new TypeError(); // TODO message
//        }
//        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
//        var name = '';
//        while (owns(object, name)) {
//            name += '?';
//        }
//        object[name] = true;
//        var returnValue = owns(object, name);
//        delete object[name];
//        return returnValue;
//    };
//}

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if ((typeof object != "object" && typeof object != "function") || object === null) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}

////
//// Date
//// ====
////
//
//// ES5 15.9.5.43
//// http://es5.github.com/#x15.9.5.43
//// This function returns a String value represent the instance in time
//// represented by this Date object. The format of the String is the Date Time
//// string format defined in 15.9.1.15. All fields are present in the String.
//// The time zone is always UTC, denoted by the suffix Z. If the time value of
//// this object is not a finite Number a RangeError exception is thrown.
//if (!Date.prototype.toISOString || (new Date(-62198755200000).toISOString().indexOf('-000001') === -1)) {
//    Date.prototype.toISOString = function toISOString() {
//        var result, length, value, year;
//        if (!isFinite(this)) {
//            throw new RangeError("Date.prototype.toISOString called on non-finite value.");
//        }
//
//        // the date time string format is specified in 15.9.1.15.
//        result = [this.getUTCMonth() + 1, this.getUTCDate(),
//            this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
//        year = this.getUTCFullYear();
//        year = (year < 0 ? '-' : (year > 9999 ? '+' : '')) + ('00000' + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6);
//
//        length = result.length;
//        while (length--) {
//            value = result[length];
//            // pad months, days, hours, minutes, and seconds to have two digits.
//            if (value < 10) {
//                result[length] = "0" + value;
//            }
//        }
//        // pad milliseconds to have three digits.
//        return year + "-" + result.slice(0, 2).join("-") + "T" + result.slice(2).join(":") + "." +
//            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z";
//    }
//}
//
//// ES5 15.9.4.4
//// http://es5.github.com/#x15.9.4.4
//if (!Date.now) {
//    Date.now = function now() {
//        return new Date().getTime();
//    };
//}
//
//// ES5 15.9.5.44
//// http://es5.github.com/#x15.9.5.44
//// This function provides a String representation of a Date object for use by
//// JSON.stringify (15.12.3).
//if (!Date.prototype.toJSON) {
//    Date.prototype.toJSON = function toJSON(key) {
//        // When the toJSON method is called with argument key, the following
//        // steps are taken:
//
//        // 1.  Let O be the result of calling ToObject, giving it the this
//        // value as its argument.
//        // 2. Let tv be ToPrimitive(O, hint Number).
//        // 3. If tv is a Number and is not finite, return null.
//        // XXX
//        // 4. Let toISO be the result of calling the [[Get]] internal method of
//        // O with argument "toISOString".
//        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
//        if (typeof this.toISOString != "function") {
//            throw new TypeError('toISOString property is not callable');
//        }
//        // 6. Return the result of calling the [[Call]] internal method of
//        //  toISO with O as the this value and an empty argument list.
//        return this.toISOString();
//
//        // NOTE 1 The argument is ignored.
//
//        // NOTE 2 The toJSON function is intentionally generic; it does not
//        // require that its this value be a Date object. Therefore, it can be
//        // transferred to other kinds of objects for use as a method. However,
//        // it does require that any such object have a toISOString method. An
//        // object is free to use the argument key to filter its
//        // stringification.
//    };
//}
//
//// ES5 15.9.4.2
//// http://es5.github.com/#x15.9.4.2
//// based on work shared by Daniel Friesen (dantman)
//// http://gist.github.com/303249
//if (!Date.parse || Date.parse("+275760-09-13T00:00:00.000Z") !== 8.64e15) {
//    // XXX global assignment won't work in embeddings that use
//    // an alternate object for the context.
//    Date = (function(NativeDate) {
//
//        // Date.length === 7
//        var Date = function Date(Y, M, D, h, m, s, ms) {
//            var length = arguments.length;
//            if (this instanceof NativeDate) {
//                var date = length == 1 && String(Y) === Y ? // isString(Y)
//                    // We explicitly pass it through parse:
//                    new NativeDate(Date.parse(Y)) :
//                    // We have to manually make calls depending on argument
//                    // length here
//                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
//                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
//                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
//                    length >= 4 ? new NativeDate(Y, M, D, h) :
//                    length >= 3 ? new NativeDate(Y, M, D) :
//                    length >= 2 ? new NativeDate(Y, M) :
//                    length >= 1 ? new NativeDate(Y) :
//                                  new NativeDate();
//                // Prevent mixups with unfixed Date object
//                date.constructor = Date;
//                return date;
//            }
//            return NativeDate.apply(this, arguments);
//        };
//
//        // 15.9.1.15 Date Time String Format.
//        var isoDateExpression = new RegExp("^" +
//            "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign + 6-digit extended year
//            "(?:-(\\d{2})" + // optional month capture
//            "(?:-(\\d{2})" + // optional day capture
//            "(?:" + // capture hours:minutes:seconds.milliseconds
//                "T(\\d{2})" + // hours capture
//                ":(\\d{2})" + // minutes capture
//                "(?:" + // optional :seconds.milliseconds
//                    ":(\\d{2})" + // seconds capture
//                    "(?:\\.(\\d{3}))?" + // milliseconds capture
//                ")?" +
//            "(?:" + // capture UTC offset component
//                "Z|" + // UTC capture
//                "(?:" + // offset specifier +/-hours:minutes
//                    "([-+])" + // sign capture
//                    "(\\d{2})" + // hours offset capture
//                    ":(\\d{2})" + // minutes offset capture
//                ")" +
//            ")?)?)?)?" +
//        "$");
//
//        // Copy any custom methods a 3rd party library may have added
//        for (var key in NativeDate) {
//            Date[key] = NativeDate[key];
//        }
//
//        // Copy "native" methods explicitly; they may be non-enumerable
//        Date.now = NativeDate.now;
//        Date.UTC = NativeDate.UTC;
//        Date.prototype = NativeDate.prototype;
//        Date.prototype.constructor = Date;
//
//        // Upgrade Date.parse to handle simplified ISO 8601 strings
//        Date.parse = function parse(string) {
//            var match = isoDateExpression.exec(string);
//            if (match) {
//                match.shift(); // kill match[0], the full match
//                // parse months, days, hours, minutes, seconds, and milliseconds
//                for (var i = 1; i < 7; i++) {
//                    // provide default values if necessary
//                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
//                    // match[1] is the month. Months are 0-11 in JavaScript
//                    // `Date` objects, but 1-12 in ISO notation, so we
//                    // decrement.
//                    if (i == 1) {
//                        match[i]--;
//                    }
//                }
//
//                // parse the UTC offset component
//                var minuteOffset = +match.pop(), hourOffset = +match.pop(), sign = match.pop();
//
//                // compute the explicit time zone offset if specified
//                var offset = 0;
//                if (sign) {
//                    // detect invalid offsets and return early
//                    if (hourOffset > 23 || minuteOffset > 59) {
//                        return NaN;
//                    }
//
//                    // express the provided time zone offset in minutes. The offset is
//                    // negative for time zones west of UTC; positive otherwise.
//                    offset = (hourOffset * 60 + minuteOffset) * 6e4 * (sign == "+" ? -1 : 1);
//                }
//
//                // Date.UTC for years between 0 and 99 converts year to 1900 + year
//                // The Gregorian calendar has a 400-year cycle, so
//                // to Date.UTC(year + 400, .... ) - 12622780800000 == Date.UTC(year, ...),
//                // where 12622780800000 - number of milliseconds in Gregorian calendar 400 years
//                var year = +match[0];
//                if (0 <= year && year <= 99) {
//                    match[0] = year + 400;
//                    return NativeDate.UTC.apply(this, match) + offset - 12622780800000;
//                }
//
//                // compute a new UTC date value, accounting for the optional offset
//                return NativeDate.UTC.apply(this, match) + offset;
//            }
//            return NativeDate.parse.apply(this, arguments);
//        };
//
//        return Date;
//    })(Date);
//}

//
// String
// ======
//

// ES5 15.5.4.20
// http://es5.github.com/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        if (this === undefined || this === null) {
            throw new TypeError("can't convert "+this+" to object");
        }
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    };
}

}());
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

(function() {
    /*jshint strict:false */
    
    var global = this,
        isClient = $renv === 'client',
        _Array = Array,
        lookup = {},
        loaders = [],
        slice = _Array.prototype.slice,
        isArray = _Array.isArray,
        extend = function(dest, source) {
            if (dest == null) dest = {};
            if (source != null)
            {  
                for (var k in source)
                {
                    if (source.hasOwnProperty(k))
                    {
                        dest[k] = source[k];
                    }
                }
            }
            return dest;
        },
        arrayFromArguments = function(args, startIndex) {
            if (!args) return [];
            
            if (isArray(args) && !startIndex) {
                return args;
            }
            
            if (startIndex != null)
            {
                if (startIndex < args.length)
                {
                    return slice.call(args, startIndex);
                }
                else
                {
                    return [];
                }
            }
            else
            {
                return slice.call(args);
            }
        },
        load = function(instance) {        
            var len = loaders.length;
            for (var i=0; i<len; i++)
            {
                var loaderFunc = loaders[i];
                loaderFunc(instance);
            }
            
            instance.newInstance = function(raptor) {        
                return load({});
            };
            
            return instance;
        };
    
    raptorBuilder = {
        createRaptor: function(config) {
            if (!config) config = {};
            
            /**
             * The core object for the RaptorJS runtime. A new "raptor" object can
             * be created using the global "raptorBuilder" object. For example:
             * <js>
             * window.raptor = raptorBuilder.createRaptor(config);
             * </js>
             * 
             * The "raptor" object consists of core modules (including env, logging and errors).
             * 
             * The "oop" modules extends the "raptor" object to support 
             * modules, classes, mixins and enums.
             * 
             * @namespace
             * @name raptor
             * @raptor
             * @borrows oop.require as require
             * @borrows oop.find as find
             * @borrows oop.defineClass as defineClass
             * @borrows oop.defineEnum as defineEnum
             * @borrows oop.defineModule as defineModule
             * @borrows oop.define as define
             * @borrows oop.defineMixin as defineMixin
             * @borrows oop.extend as extend
             * @borrows oop.inherit as inherit
             */
            var newRaptor = {
                    /**
                     * The global object for the environment.
                     * 
                     * This object normalizes the JavaScript global object across multiple environments. 
                     * In a browser, the global object will be the "window" object. In a NodeJS environment
                     * the global object will be the GLOBAL object.
                     * 
                     * @type {global}
                     */
                    global: global,
                    
                    
                    /**
                     * 
                     * @returns
                     */
                    getConfig: function() {
                        return config;
                    },
                    
                    /**
                     * 
                     * @param moduleName
                     * @returns {Boolean}
                     */
                    getModuleConfig: function(moduleName) {
                        return this.getConfig()[moduleName] || {};
                    },
                    
                    /**
                     * 
                     * @param moduleName
                     * @param mixins
                     */
                    extendCore: function(moduleName, mixins) {
                        extend(this[moduleName], mixins);
                    },
                    
                    /**
                     * 
                     * @returns {String}
                     */
                    toString: function() {
                        return "[raptor]";
                    },
                    
                    /**
                     * @function
                     * @param dest
                     * @param source
                     */
                    extend: extend,
                    
                    /**
                     * Traverses all of the properties for an object and invokes
                     * the provided callback function for each property found.
                     * 
                     * The parameters passed to the callback function are the "key" and the "value".
                     * If the callback function returns "false" then iteration is stopped.
                     * 
                     * @param o {object} The object to operate on
                     * @param fun {function} The callback function
                     * @param thisp {object} The object to use as "this" for the callback function
                     * 
                     * @return {void}
                     * 
                     */
                    forEachEntry: function(o, fun, thisp) {
                        for (var k in o)
                        {
                            if (o.hasOwnProperty(k))
                            {
                                var v = o[k];
                                var result = fun.call(thisp, k, v);
                                if (result === false) return;
                            }
                        }
                    },
                    
                    /**
                     * Checks if the provided object is an array 
                     * @function
                     * @param object {object} The object to check
                     * @returns {boolean} Returns true if the object is an array (i.e. the constructor of the object is the Array type). False, otherwise
                     */
                    isArray: isArray,
                    
                    /**
                     * 
                     * @param s
                     * @returns {Boolean}
                     */
                    isString: function(s) {
                        return typeof s == 'string';
                    },
                    
                    /**
                     * 
                     * @param object
                     * @returns {Boolean}
                     */
                    isNumber : function(object) {
                        return (typeof(object) === 'number');
                    },
                    
                    /**
                     * 
                     * @param s
                     * @returns {Boolean}
                     */
                    isFunction: function(f) {
                        return typeof f == 'function';
                    },
                    
                    /**
                     * 
                     * @param o
                     * @returns {Boolean}
                     */
                    isObject: function(o) {
                        return typeof o == 'object';
                    },
                    
                    /**
                     * 
                     * @param object
                     * @returns {Boolean}
                     */
                    isBoolean : function(object) {
                        return (typeof(object) === 'boolean');
                    },
                    
                    /**
                     * 
                     * Iterates over the elements in an array and invokes a provided callback function with the current element for each iteration.
                     * 
                     * @param {array|object|null} a The array to iterate over
                     * @param {function} fun The callback function to use for each iteration of the array. The following parameters are passed to the callback function: 1) element 2) index 3) the array itself
                     * @param thisp The "this" object to use for the callback function
                     */
                    forEach: function(a, func, thisp) {
                        if (a != null) {
                            (isArray(a) === true ? a : [a]).forEach(func, thisp);    
                        }
                        
//                        if (Array.isArray(a) === false) {
//                            if (a == null) {
//                                return;
//                            }
//                            a = [a];
//                        }
//                        for (var i=0, len=a.length; i<len; i++) {
//                            func.call(thisp, a[i], i);
//                        }
                    },

                    /**
                     * @function
                     * @param arguments
                     */
                    arrayFromArguments: arrayFromArguments,
                    
                    /**
                     * 
                     * @param o
                     * @returns {Array}
                     */
                    keys: function(o)
                    {
                        return Object.keys(o);
                    },
                    
                    isServer: function() {
                        return !isClient;
                    },
                    
                    isClient: function() {
                        return isClient;
                    }
                    
                };
            
            load(newRaptor);
            return newRaptor;
        }
    };
    
    $rload = function(loaderFunc) {
        loaders.push(loaderFunc);
        
        if (global.raptor) {
            loaderFunc(raptor);
        }
    };
    
    $rcreate = function(config) {
        raptor = raptorBuilder.createRaptor(config);
    };
    
    $rset = function(category, key, data) {
        var catData = lookup[category];
        if (!catData) {
            catData = lookup[category] = {};
        }
        catData[key] = data;
    };
    
    $radd = function(category, data) {
        var catData = lookup[category];
        if (!catData) {
            catData = lookup[category] = [];
        }
        catData.push(data);
    };
    
    $rget = function(category, key) {
        var catData = lookup[category];
        return arguments.length === 2 ? catData && catData[key] : catData; 
    };

}());


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
    /*jshint strict:false */
    
    /**
     * @class
     * @name logging-VoidLogger
     */
    
    /**
     * 
     */
    var EMPTY_FUNC = function() {
            return false;
        },
        /**
         * @name logging.voidLogger
         */
        voidLogger = {
            
            /**
             * 
             */
            isDebugEnabled: EMPTY_FUNC,
            
            /**
             * 
             */
            isInfoEnabled: EMPTY_FUNC,
            
            /**
             * 
             */
            isWarnEnabled: EMPTY_FUNC,
            
            /**
             * 
             */
            isErrorEnabled: EMPTY_FUNC,
            
            /**
             * 
             */
            isFatalEnabled: EMPTY_FUNC,
            
            /**
             * 
             */
            dump: EMPTY_FUNC,
            
            /**
             * 
             */
            debug: EMPTY_FUNC,
            
            /**
             * 
             */
            info: EMPTY_FUNC,
            
            /**
             * 
             */
            warn: EMPTY_FUNC,
            
            /**
             * 
             */
            error: EMPTY_FUNC,
            
            /**
             * 
             */
            fatal: EMPTY_FUNC,
            
            /**
             * 
             */
            alert: EMPTY_FUNC,
            
            /**
             * 
             */
            trace: EMPTY_FUNC
        };

    /**
     * @namespace
     * @name logging
     * @raptor
     */
    raptor.logging = {
        /**
         * 
         * @param className
         * @returns
         */
        logger: function(className)
        {
            return voidLogger;
        },

        /**
         * 
         */
        makeLogger: function(obj, className)
        {
            raptor.extend(obj, voidLogger);
        },
        
        voidLogger: voidLogger
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
    /*jshint strict:false */

    raptor.createError = function(message, cause) {
        var error,
            argsLen = arguments.length,
            E = Error;
        
        if (argsLen === 2)
        {
            error = message instanceof E ? message : new E(message);            
            error._cause = cause;                        
        }
        else if (argsLen === 1)
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


var $rdefs = {}; //Class definitionsLookup are global for a reason. It allows the
                 //the class definitions to remain even if a new Raptor environment
                 //which is needed for testing.


$rload(function(raptor) {
    "use strict";
    
    var forEach = raptor.forEach, //Short-hand reference to function for iterating over arrays with a function callback
        forEachEntry = raptor.forEachEntry, //Short-hand reference for iterating over object properties
        isArray = raptor.isArray,
        isString = raptor.isString,
        isFunction = raptor.isFunction,
        createError = raptor.createError,
        logging = raptor.logging, //Logging module used to add logging support to classes and modules
        PROTOTYPE = "prototype",
        ENUM_COUNT = "_count",
        NAME_IDX = 0,
        MODIFIERS_IDX = 1,
        FACTORY_IDX = 2,
        TYPE_IDX = 3,
        ENUM_VALUES_IDX = 4,
        EXTENSIONS_IDX = 5,
        ORDINAL_PROP = '_ordinal',
        NAME_PROP = '__name',
        CLASS = 0,      //Supports inheritance. A constructor function is returned
        MODULE = 1,    //All properties treated as statics. An object is returned
        ENUM = 2,        //Supports constant static fields. An object is returned with the enum constants
        MIXIN = 3,      //All properties treated as statics. An object is returned
        typeNames = ['class', 'module', 'enum', 'mixin'], //Translation type of object types (e.g. CLASS) to type names (e.g. 'class')
        definitionsLookup = $rdefs, //Local variable reference to the global definitions lookup
        loadedLookup = {}, //A lookup for loaded classes/modules/mixins/enums
        oop,    //Used to self-refer to this module. Used instead of "this" for minification and in unbound callbacks
        k,
        _addTypeInfo = function(obj, name, type) { //Adds hidden type information to created class constructors, class prototypes, modules and enums (not mixins)
                obj[NAME_PROP] = name;
                obj.__type = type;
            },
        _simpleExtend = raptor.extend, //A method to add properties to an object without support for "overridden" or "doNotOverride" properties (faster)
        _extend = function(target, source, overridden, doNotOverride) { //An extend method with additional features
            var overriddenProp,
                propName;
            
            for (propName in source) {
                if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                    if ((overriddenProp = target[propName])) { //See if there is an existing property with the same name in the target object
                        if (doNotOverride === true) { //There is an existing property, if "doNotOverride" is set to true then we shouldn't override it
                            continue; //Skip copying this property
                        }
                        
                        if (overridden) { //If a object was provided to track overridden properties then add the old property to that object
                            overridden[propName] = overriddenProp;
                        }
                    }
                    target[propName] = source[propName]; //Copy the property
                }
            }
        },
        _inherit = function(clazz, superclass, copyProps) { //Helper function to setup the prototype chain of a class to inherit from another class's prototype
            
            var proto = clazz[PROTOTYPE],
                F = function() {};
              
            var inherit = isString(superclass)?_require(superclass):superclass;
            _simpleExtend(clazz,inherit);
            
            F[PROTOTYPE] = inherit[PROTOTYPE]; 
            clazz.superclass = F[PROTOTYPE];

            clazz[PROTOTYPE] = new F();
              
            if (copyProps) {
                _simpleExtend(clazz[PROTOTYPE], proto);
            }
              
            return proto;
        },
        _createLoggerFunction = function(name) { //Helper function invoked for each class to add a "logger()" function to the class prototype
            var _logger;
            
            return function() {
                return _logger ? _logger : (_logger = logging.logger(name));
            };
        },
        _staticToString = function() {
            return '[' + this.__type + ': ' + this[NAME_PROP] + ']';
        },
        _getName = function() {
            return this[NAME_PROP];
        },
        _instanceToString = function() {
            return '[' + this[NAME_PROP] + ']';
        },
        _instanceGetClass = function() {
            return _find(this[NAME_PROP]);
        },
        _enumValueOf = function(name) {
            return this[name];
        },
        _enumValueOrdinal = function() {
            return this[ORDINAL_PROP];
        },
        _enumValueName = function() {
            return this._name;
        },
        _enumValueCompareTo = function(other) {
            return this[ORDINAL_PROP] - other[ORDINAL_PROP];
        },
        _addEnumValue = function(target, name, EnumCtor) {
            var enumValue = target[name] = new EnumCtor();
            enumValue[ORDINAL_PROP] = target[ENUM_COUNT]++;
            enumValue._name = name;
            return enumValue;
        },
        _require = function(name, asyncCallback, thisObj, ignoreMissing) {
            
            if (asyncCallback) {
                //If an asynchronous callback is provided or if multiple module names are provided then we go through the "loader"
                //module to load the required modules as a single transaction.
                return _require('loader').require(
                        name, /* handles arrays and single names */
                        asyncCallback,
                        thisObj);
            }
            
            var loaded = loadedLookup[name]; //See if the object has already been loaded
            if (loaded === undefined) {
                loaded = oop._load(name, 1);
            }
            
            if (!loaded && !ignoreMissing) {
                oop._missing(name);
            }
            
            return loaded;
        },
        /**
         * 
         * @param name
         * @param def
         * @returns
         */
        _build = function(name, def)
        {
            var type,           //The object with the user defined methods and properties
                clazz,          //The resulting object that is constructed and returned
                proto,          //The prototype for the class (CLASS and ENUM types only)
                targetType = def[TYPE_IDX],             //The output type (either CLASS, MODULE, ENUM or MIXIN)
                targetTypeName, //The name of the output type (either 'class', 'module', 'enum' or 'mixin')
                modifiers = def[MODIFIERS_IDX] || {},   //Modifiers for the object being defined
                superClassName,
                mixinsTarget,   //The object to apply mixins to (either a prototype or the output object itself)
                factory = def[FACTORY_IDX],        //The factory function for the definition (invoked to get the type definition)
                enumValues = def[ENUM_VALUES_IDX],
                isEnum = targetType == ENUM,
                isMixin = targetType == MIXIN,
                EnumCtor,
                enumValue;

            loadedLookup[name] = modifiers.exports; 
            
            if (factory) {
                //The factory can be a function or just the type.
                if (isFunction(factory) && (!isMixin || modifiers.singleton)) {
                    //If it is a function then execute the function to produce the type
                    type = factory(raptor);                    
                }
                else {
                    //Otherwise, use it is as the type directly
                    type = factory;
                }
                
                if (!type) {
                    throw createError(new Error("Invalid definition for " + name));
                }
            }
            else if (isEnum) {
                type = function() {}; //Enum values were provided, but a constructor function is not required
            }
            else {
                throw createError(new Error(name + ' missing definition'));
            }
            
            clazz = mixinsTarget = type;

            if (!isMixin) {
                
                if (!isEnum && (isFunction(type) || modifiers.superclass)) {
                    targetType = CLASS;
                }
                
                targetTypeName = typeNames[targetType];

                //If the object define consists of only statics then we don't need to mess with prototypes or inheritance
                //and the output simply becomes the input type with modifications applied (e.g. mixins)
                if (targetType == CLASS || isEnum) {
                    /*
                     * We have a "type" object which contains the methods and constructors. We now
                     * need to initialize a JavaScript "class" with the correct constructor function
                     * and the correct prototype
                     */
                    if (!isFunction(type)) {
                        clazz = type.init || function() {};
                        clazz[PROTOTYPE] = type;
                    }
    
                    if ((superClassName = modifiers.superclass))
                    {
                        _inherit(clazz, superClassName, true);
                    }
                    
                    proto = clazz[PROTOTYPE];
    
                    _addTypeInfo(proto, name, targetTypeName);      //Add hidden fields to the prototype for the class so we can reflect on it
                    if (proto.toString === Object[PROTOTYPE].toString) {   //Add a default toString method if it doesn't already have one
                        proto.toString = isEnum ? _enumValueName : _instanceToString;
                    }
                    proto.getClass = _instanceGetClass;  //Add the ability to lookup the class for an instance of a class
                    proto.init = proto.constructor = clazz;   //Add init/constructor properties for convenience
                    mixinsTarget = proto;                       //Add all mixins to the prototype of the class
                }
                
                if (modifiers.addins !== false) {
                    _addTypeInfo(clazz, name, targetTypeName);          //Add type info to the resulting object
                    clazz.getName = _getName;                //Helper method to return the name of the class/module/enum/mixin
                    clazz.toString = _staticToString;
                    mixinsTarget.logger = _createLoggerFunction(name);    
                }
            }

            //Handle extensions
            forEach(def[EXTENSIONS_IDX], function(ext) {
                oop.extend(mixinsTarget, ext);
            }, this);
            
            //Check to see if this class explicitly wants any mixins to be applied
            forEach(modifiers.mixins, function(mixin) {
                oop.extend(mixinsTarget, mixin);
            }, oop);

            if (isEnum) {
                clazz[ENUM_COUNT] = 0;
                
                if (isArray(enumValues)) 
                {
                    forEach(enumValues, function(name) {
                        _addEnumValue(clazz, name, clazz);
                    });
                }
                else if (enumValues) {
                    EnumCtor = function() {};
                    EnumCtor[PROTOTYPE] = proto;
                    
                    forEachEntry(enumValues, function(name, args) {
                        enumValue = _addEnumValue(clazz, name, EnumCtor);
                        clazz.apply(enumValue, args || []);
                    });
                }
                clazz.valueOf = _enumValueOf;
                _simpleExtend(proto, {
                    name: _enumValueName,
                    ordinal: _enumValueOrdinal,
                    compareTo: _enumValueCompareTo
                });
            }


            return clazz;
            
        },

        /**
         * 
         * @param name
         * @param factory
         * @param type
         * @param modifiers
         * @param enumValues
         * @returns
         */
        _define = function(def) {

            var name = def[NAME_IDX],
                existingDef;
            
            if (!loadedLookup[name]) {
                delete loadedLookup[name]; //We now have a definition available
            }
            
            if (!name) {
                //If no name is provided then we have to build the class immediately
                //and return it since it is an anonymous class
                return _build("", def);
            }

            existingDef = definitionsLookup[name];
            definitionsLookup[name] = def;
            
            if (existingDef) {
                //This would only happen if extensions were loaded before the class itself was defined
                def[EXTENSIONS_IDX] = existingDef[EXTENSIONS_IDX];
            }
            
            return def;
        },
        _defineFromArgs = function(args, type) {
            var i=0,
                len=args.length,
                arg,
                name,
                modifiers = {},
                factory;
            
            for (; i<len; i++) {
                arg = args[i];
                if (isString(arg)) {
                    if (!name) {
                        name = arg;
                    }
                    else {
                        modifiers.superclass = arg;
                    }
                }
                else if (i == len-1) {
                    factory = arg;  //An object in the last position is the implementation
                }
                else {
                    modifiers = arg;
                }
            }
    
            return _define([name, modifiers, factory, type]);  
        },
        
        _find = function(name) {
            return _require(name, 0, 0, 1); //Checks for the existence of an object
        }; 
   
    /**
     * @namespace
     * @raptor
     * @name oop
     */
    raptor.oop = oop = {
            
        /**
         * Defines a module or class.
         * 
         * <p>
         * Defines a module or class that can later be loaded using "raptor.require(name)".
         * The defined object is a singleton object that is only initialized
         * when raptor.require(name) is invoked for the first time.
         * A factory function must be provided so that the module can be created when it
         * is first requested (i.e. it is lazily initialized). The return value of the factory
         * function should be the module definition as a JavaScript object with properties.
         * Once a module has been created for the first time it is stored in a lookup
         * table and returned for all subsequent requests to get access to that module.
         * 
         * <p>
         * It's also possible to have an anonymous module by defining a module
         * without a name and passing the factory function as the first and only
         * argument. If the module is anonymous then the module will be immediately
         * created and returned.
         * 
         * Multiple signatures supported:
         * <ul>
         * <li>define(name, modifiers, factory)
         * <li>define(name, superclassName, factory)
         * <li>define(name, factory)
         * <li>define(modifiers, factory)
         * <li>define(factory)
         * </ul>
         * 
         * Supported modifiers:
         * <ul>
         * <li>superclass: The name of the super class
         * <li>mixins: An array of names of mixins
         * </ul>
         * 
         * In addition, the "modifiers" parameter can be a string that specifies the name of the superclass
         * <h2>Examples: Simple module object</h2>
         * <js>
         * define(
         *     'some.namespace.myModule',
         *     function() {
         *         return {
         *            greet: function(name) {
         *                return 'Hello ' + name + '!';
         *            }
         *         }
         *     });
         * </js>
         * 
         * <h2>Examples: Class with prototype</h2>
         * <js>
         * define(
         *     'some.namespace.MyClass',
         *     function() {
         *         var MyClass = function() {
         *             //Constructor function
         *         };
         *         
         *         MyClass.prototype = {
         *             //Class prototype
         *         };
         *         
         *         return MyClass
         *     });
         * </js>
         * 
         * <h2>Examples: Class with inheritance</h2>
         * <js>
         * define(
         *     'some.namespace.MyClass',
         *     'some.namespace.MySuperClass', //or: { superclass: 'some.namespace.MySuperClass' }
         *     function() {
         *         var MyClass = function() {
         *             //Constructor function
         *         };
         *         
         *         MyClass.prototype = {
         *             //Class prototype
         *         };
         *         
         *         return MyClass;
         *     });
         * </js>
         * 
         * @param name The name of the class (if not provided then class is built is an anonymous class and immediately returned
         * @param modifiers Optional modifiers (see above)
         * @param factory A factory function that returns either the class constructory function (with prototype)
         *                or just the prototype
         * 
         * @returns {void|function|object} Returns the module definition or class constructor function if the module/class is anonymous, otherwise nothing is returned
         */
        define: function() {
            return _defineFromArgs(arguments, MODULE);
            
        },
        
        /**
         * Defines a class. This is identical to identical to "define" except that it supports a short-hand notation for classes
         * 
         * Multiple signatures supported:
         * <ul>
         * <li>defineClass(name, modifiers, factory)
         * <li>defineClass(name, superclassName, factory)
         * <li>defineClass(name, factory)
         * <li>defineClass(modifiers, factory)
         * <li>defineClass(factory)
         * </ul>
         * 
         * Supported modifiers:
         * <ul>
         * <li>superclass: The name of the super class
         * <li>mixins: An array of names of mixins
         * </ul>
         * 
         * In addition, the "modifiers" parameter can be a string that specifies the name of the superclass
         *
         * <h2>Examples: Class with prototype</h2>
         * <js>
         * raptor.defineClass(
         *     'some.namespace.MyClass',
         *     function() {
         *         return {
         *             init: function() {
         *                 //Constructor 
         *             },
         *             
         *             //Prototype methods:
         *             someMethod: function() { ... }
         *         }
         *     });
         * </js>
         * 
         * @param name The name of the class (if not provided then class is built is an anonymous class and immediately returned
         * @param modifiers Optional modifiers (see above)
         * @param factory A factory function that returns either the class constructory function (with prototype)
         *                or just the prototype
         * 
         * @returns {void|function} Returns the class constructor function if the class is anonymous, otherwise nothing is returned
         */
        defineClass: function() {
            return _defineFromArgs(arguments, CLASS);
        },
        
        /**
         * Defines a Raptor JavaScript enum type.
         * 
         * <p>RaptorJS enums provides a way to define constants. Each enum value is an 
         * instance of a JavaScript class that can have a constructor, methods, and properties.
         * 
         * <p>
         * Every enum class supports the following methods.
         * <ul>
         * <li>valueOf(name) - Returns the constant field with the same name (case sensitive)</li>
         * </ul>
         * 
         * Every enum field supports the following methods.
         * <ul>
         * <li>name() - Returns the name of the enum
         * <li>ordinal() - Returns the positional value of the enum (NOTE: This should only be used for an array of enum strings. Order is undefined for maps but it will work correctly in most browsers.)
         * <li>toString() - Returns the name of the enum unless it has been overridden
         * <li>compareTo(other) - Compares one enum field to another based on the ordinal value 
         * </ul>
         * 
         * <h2>Simple enum</h2>
         * <js>
raptor.defineEnum(
    'some.namespace.Day',
    [
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT"
    ]);
         * </js>
         * 
         * <h2>Complex enum with custom constructor, properties and methods</h2>
         * <js>
raptor.defineEnum(
    'some.namespace.Day',
    {
        SUN: [false, "Sunday"],
        MON: [true, "Monday"],
        TUE: [true, "Tuesday"],
        WED: [true, "Wednesday"],
        THU: [true, "Thursday"],
        FRI: [true, "Friday"],
        SAT: [false, "Saturday"]
    },
    function(raptor, type) {
        return {
            init: function(isWeekday, longName) {
                this._isWeekday = isWeekday;
                this._longName = longName;
            },
             
            getLongName: function() {
                return this._longName;
            },
             
            isWeekday: function() {
                return this._isWeekday;
            }
        }
    });
         * </js>
         * 
         * @param name The name of the enum type
         * @param enumValues {Array<String>|Object} Enum values (either an array of strings or an object with enum names as properties and constructor arguments as values) 
         * @param factory The factory function to produce the enum class (optional for simple enums)
         * @returns Nothing is returned if a name is provided. Otherwise, if a name is provided
         *          the newly constructed enum is immediately returned.
         */
        defineEnum: function(name, enumValues, factory) {
            return _define([name, {}, factory, ENUM, enumValues]);
        },
        
        /**
         * Defines a Raptor JavaScript mixin.
         * 
         * @param name
         * @param factory
         * @returns
         */
        defineMixin: function() {
            return _defineFromArgs(arguments, MIXIN);
        },
        
        /**
         * Attempts to load the object with the specified name. If the object
         * is not found then null is returned.
         * 
         * This method is similar to the require method. The only difference
         * is that the require method will throw an exception if the object
         * with the specified name is not found.
         * 
         * @function
         * @memberOf oop
         * @param name The name of the class/module/mixin/enum
         * @returns Returns an instance of an object if it exists, otherwise null
         */
        find: _find,
        
        /**
         * Obtains reference(s) to the requested class/module/mixin/enum (either synchronously or asynchronously). If the requested objects
         * have not already been initialized then they will be lazily initialized.
         * 
         * <p>When loading modules, this method supports both synchronous module loading and asynchronous module loading.
         * <ul>
         * <li><b>Synchronous module loading:</b> With synchronous module loading, a single module is loaded and immediately returned. The code
         * for the module must be available for synchronous module loading to work. If the requested module name is not found then an Error is thrown
         * unless the ignoreMissing argument is set to true.
         * 
         * <li><b>Asynchronous module loading:</b> If an asynchronous callback is provided
         * as the second parameter then one or more modules can be loaded. The module name(s)
         * can be provided as a single string argument or as an array of string paragments
         * Upon successful
         * completion the "success" back handler will be invoked and the loaded modules
         * will be passed as arguments in the order that they were provided.
         * </ul>
         * 
         * 
         * <h2>Examples:</h2>
         * 
         * <h3>Synchronous module/class/mixin/enum loading</h3>
         * <js>
         * var widgets = raptor.require('widgets');
         * widgets.get(widgetId).destroy();
         * </js>
         * 
         * <h3>Asynchronous module loading (single module)</h3>
         * <js>
         * raptor.require('widgets', function(widgets) {
         *     if (arguments.length == 0) {
         *         //Module loading failed...
         *         return;
         *     }
         *     
         *     widgets.get(widgetId).destroy();
         * });
         * </js>
         * 
         * <h3>Asynchronous module loading (multiple modules)</h3>
         * <js>
         * raptor.require(['widgets', 'json'], function(widgets, json) {
         *     if (arguments.length == 0) {
         *         //Module loading failed...
         *         return;
         *     }
         *     
         *     //Do something with the loaded modules...
         * });
         * </js>
         * 
         * <h3>Asynchronous module loading (multiple event listeners)</h3>
         * <js>
         * raptor.require(['widgets', 'json'], {
         *     success: function(widgets, json) {
         *         //Do something with the loaded modules...
         *     },
         *     error: function() {
         *         //Something went wrong...
         *     }
         * });
         * </js>
         * 
         * <h3>Asynchronous module loading (all event listeners)</h3>
         * <js>
         * raptor.require(['widgets', 'json'], {
         *     success: function(widgets, json) {
         *         //Do something with the loaded modules...
         *     },
         *     error: function() {
         *         //Something went wrong...
         *     },
         *     complete: function(result) {
         *         //Module loading completed
         *         var success = result.success;
         *         //...
         *     },
         *     asyncStart: function() {
         *         //At least modules weren't already loaded and have 
         *         //started to be downloaded asynchronously
         *     },
         *     asyncComplete: function() {
         *         //The asynchronous downloading of the modules has completed
         *     }
         * });
         * </js>
         * @function
         * @memberOf oop 
         * @param name {String|Array<String>} The name of the class/module/mixin/enum
         * @param asyncCallback {Object|Function} A success/error callback function or an object with callback functions for some or all of the the supported events. The following events are supported: asyncStart, success, error, asyncComplete, complete - (<b>NOTE:</b> Should only be used with module loading)
         * @param thisObj {Object} The "this" object for the callback function(s) - (<b>NOTE:</b> Should only be used with module loading)  
         * @param ignoreMissing {Boolean} If true then an Error will not be thrown if the requested object is not found.
         * @returns {Object|loader.Transaction} For synchronous module/class/mixin/enum loading, a reference to the requested class/module/mixin/enum is returned. For asynchronous module loading, the transaction is returned. 
         */
        require: _require,

        /**
         * 
         * @param name
         * @param find
         * @returns
         */
        _load: function(name, find) {
            //See if the definition for the object can be found or if the object has already been loaded
            var def = definitionsLookup[name],
                loaded;
            
            if (!(loaded = raptor[name])) {
                if (def) {
                    //We found a definition, just build the object based on that definition
                    loaded = _build(name, def);
                }
                else if (find && oop._resolve) { //Otherwise, try to resolve the object
                    loaded =  oop._resolve(name);
                }
            }
            return (loadedLookup[name] = loaded || null);
        },
        
        /**
         * Adds mixins from the specified source to the specified target.
         * 
         * @param target {String|Class|Object} The target for the source mixins. If the target is a string then it is looked up using raptor.require(target). If the target is a class then the source mixins are applied to the prototype. If the target is an object then the source mixins are directly added to the object
         * @param source {String|Object|Function} The source mixins for the target. If the source is a string then it is looked up using raptor.require(source). If the source is an object then the properties of the source object are used as the mixins. If the source is a function then the function is executed and the returned object is used as the source.
         * @param doNotOverride {Boolean} If true then properties that already exist in the target will not be overridden from the source
         * @param overridden {Object} If provided, this object will be populated with properties that were overridden. The keys will be the names of the overridden properties and the values will be the previous value of the corresponding name.
         * @returns {void}
         */
        extend: function(target, source, doNotOverride, overridden) {

            if (!source) return; //If source is null then there is nothing to extend the target with
            
            var def,
                extensions,
                loaded;
            
            if (isString(target)) {
                
                //Always register the extensions with the definition so that if the object
                //needs to be reloaded the extensions will again be reapplied
                def = definitionsLookup[target] || (definitionsLookup[target] = [target]);
                

                extensions = def[EXTENSIONS_IDX];
                if (!extensions) {
                    def[EXTENSIONS_IDX] = [source];
                }
                else {
                    extensions.push(source);
                }
                
                //If the target object is a string then we need to see if it has been loaded
                loaded = loadedLookup[target]; //See if the object has already been loaded
                if (loaded) {
                    //If the target object has already been loaded then we can used the loaded object as the target
                    if (isFunction(loaded)) { //The loaded object is a class... mixins should apply to the prototype
                        target = loaded[PROTOTYPE];
                    }
                    else {
                        target = loaded; //The loaded object is either a module, enum or mixin
                    }
                }
                else
                {
                    //The target object has *not* been loaded. Instead of loading the target to apply
                    //the mixins we'll do nothing since the extensions have already been registered with
                    //the object definition and will be applied when the object is loaded for the first time
                    return; 
                }
            }
            
            if (isString(source))
            {
                //The source is the name of the source so load the source
                source = _require(source);
            }
            
            if (isFunction(source)) {
                //If the source is a function then treat it as a factory function
                //that will return the mixins
                if (!overridden) {
                    overridden = {}; //Allows the source to know which properties it has overridden in the target object and to refer to them
                }
                source = source.call(target, raptor, target, overridden); //Execute the factory function with three parameters
            }
            
            if (doNotOverride || overridden) {
                _extend(target, source, overridden, doNotOverride);
                return target;
            }
            else {
                return _simpleExtend(target, source);
            }
        },
        
        /**
         * Sets up the prototype chain so that one prototype inherits from another
         * 
         * @function
         * @param {function} clazz The subclass constructor function
         * @param {function|string} superclass The superclass constructor function or the name of the superclass
         * @param {Boolean} copyProps If true, then the newly constructed prototype for the sub class will be populated with the original properties. (optional, defaults to false)
         * 
         *  @return {void}
         */
        inherit: _inherit,
        
        _missing: function(name) {
            throw new Error('Not found: ' + name);
        },
        
        cache: loadedLookup
    };

    for (k in oop) {
        if (k.charAt(0) != '_') {
            raptor[k] = oop[k];
        }
    }

    raptor.defineModule = oop.define;
    
    define("raptor", raptor);
});
$rcreate({});
window.TestPage = {
    loadModuleBAsync: function() {
        raptor.require('module-b', function(moduleB) {
            moduleB.sayHello();
        });
    }
}
document.write('<div class="module-a">Hello from "module-a"!</div>');
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
    
    var forEach = raptor.forEach,
        forEachEntry = raptor.forEachEntry,
        arrayFromArguments = raptor.arrayFromArguments,
        isArray = raptor.isArray,
        extend = raptor.extend,
        nextHandleId = 0,
        handlesPropName = "__lstnrs",
        EMPTY_FUNC = function() {},
        listeners,
        _bind = function(callbackFunc, thisObj) {
            if (!callbackFunc) return EMPTY_FUNC;
            if (!thisObj) return callbackFunc;
            return function() {
                callbackFunc.apply(thisObj, arguments);
            };
        },
        _removeListener = function(listeners, listener) {
            var newListeners = [],
                thisObj;
            
            listener.removed = true;
            
            forEach(listeners._listeners, function(curListener) {
                
                if (curListener !== listener && !curListener.removed) {
                    newListeners.push(curListener);
                }
            });
            
            listeners._listeners = newListeners;
            
            if ((thisObj = listener.thisObj)) {
                delete thisObj[handlesPropName][listener.id];
            }
            
            if (!listeners._listeners.length) {
                listeners._onEmpty();
            }
        },
        _createRemoveListenerFunc = function(listeners, listener) {
            return function() {
                _removeListener(listeners, listener);
            };
        },
        _createRemoveObservableFunc = function(handles) {
            return function(name) {
                if (!arguments.length) {
                    forEachEntry(handles, function(name, h) {
                        h.remove();
                    });
                }
                else
                {
                    var handle = handles[name];
                    if (!handle) {
                        throw raptor.createError(new Error('Invalid message name: ' + name));
                    }
                    handle.unsubscribe();
                }
            };
        };
        
    /**
     * The Message class allows additional information to be provided to subscribers.
     * 
     * @class
     * @anonymous
     * @name listeners.Message
     * 
     * @param name {String} The name of the message
     * @param props {Object} An object with properties that should be applied to the newly created message 
     */
    var Message = function(name, data) {
        this.name = name;
        this.data = data;
    };
    
    Message.prototype = {
        /**
         * Return the message name.
         * 
         * @returns {String} The name of the message
         */
        getName: function() {
            return this.name;
        },
        
        /**
         * Return the message data.
         * 
         * @returns {Object} The data for the message
         */
        getData: function() {
            return this.data;
        }
    };
    
    /**
     * @name listeners.Listeners
     * @anonymous
     * @class
     */
    var Listeners = function() {
        this._listeners = [];
        this._onEmpty = EMPTY_FUNC;
    };
    
    Listeners.prototype = {
        /**
         * 
         * @param callback
         * @param thisObj
         * @param autoRemove
         * @returns {listeners.ListenerHandle} A listener handle
         */
        add: function(callback, thisObj, autoRemove) {
            var listener = {
                    callback: callback,
                    thisObj: thisObj,
                    removed: false,
                    autoRemove: autoRemove,
                    id: nextHandleId++
                },
                handles,
                _this = this;
            
            
            
            _this._listeners.push(listener);
                        
            /**
             * @name listeners.ListenerHandle
             * @class
             */
            var handle = {
                /**
                 * @returns {void}
                 */
                remove: _createRemoveListenerFunc(_this, listener)
                
                /**
                 * Removes the added listener
                 * 
                 * @function
                 * @memberOf listeners.ListenerHandle.prototype
                 * @name unsubscribe
                 * 
                 * 
                 */
            };

            /**
             * Removes the added listener
             */
            handle.unsubscribe = handle.remove;
            
            if (thisObj) {
                
                if (!(handles = thisObj[handlesPropName])) {
                    handles = thisObj[handlesPropName] = {};
                }
                handles[listener.id] = handle;
            }

            return handle;
            
        },
        
        
        
        /**
         * Publishes a message to the listeners in this list
         * @param args
         */
        publish: function() {
            var args = arguments,
                _this = this;
            
            forEach(_this._listeners, function(listener) {
                if (listener.removed) return;
                
                listener.callback.apply(listener.thisObj, args);
                
                if (listener.autoRemove)
                {
                    _removeListener(_this, listener);
                }
            });
        },
        
        /**
         * 
         * @param callback
         * @param thisObj
         */
        onEmpty: function(callback, thisObj) {
            this._onEmpty = _bind(callback, thisObj);
        }
    };
    
    var checkMessage = function(messageName, observable) {
        var allowedMessages = observable._allowed;
        if (allowedMessages && !allowedMessages[messageName]) {
            throw new Error('Invalid message name of "' + messageName + '". Allowed messages: ' + raptor.keys(allowedMessages).join(', '));
        }
        
    };
    
    
    var _createMessageFunc = function(name) {
        return function(props) {
            var args = [name].concat(arrayFromArguments(arguments));
            this[typeof props == 'function' ? 'subscribe' : 'publish'].apply(this, args);
        };
    };
    
    /**
     * @class
     * @anonymous
     * @name listeners.Observable
     */
    var Observable = function() {
        this._byName = {};
    };
    
    Observable.prototype = {
        __observable: true,
        
        /**
         * @param events {Array.<String>} An array of event names to register
         * @param createPublishFunctions
         */
        registerMessages: function(messages, createPublishFunctions) {
            if (!this._allowed) {
                this._allowed = {};
            }
            
            for (var i=0, len=messages.length; i<len; i++) {
                var message = messages[i];
                this._allowed[message] = true;
                
                if (createPublishFunctions) {
                    this[message] = _createMessageFunc(message);
                }
            }
            
        },
        
        
        /**
         * Registers a listener or a set of listeners for the provided event types.
         * 
         * Two signatures are supported:
         * <ol>
         * <li> eventHandle subscribe(type, callback, thisObj, autoRemove)</li>
         * <li> eventHandle subscribe(callbacks, thisObj, autoRemove)</li>
         * </ol>
         * 
         * @param name {String} The message name
         * @param callback {Function} The callback function
         * @param thisObj
         * @param autoRemove
         * @returns {listeners.ObservableListenerHandle} A handle to remove the added listeners or select listeners
         */
        subscribe: function(name, callback, thisObj, autoRemove) {
            var _this = this,
                handles,
                handle;
            
            if (typeof name == 'object')
            {
                autoRemove = thisObj; //autoRemove is the third argument
                thisObj = callback; //thisObj is the second argument
                
                handles = {};
                
                forEachEntry(name, function(name, callback) {
                    handles[name] = _this.subscribe(name, callback, thisObj, autoRemove);
                    
                });
                
                /**
                 * @class
                 * @anonymous
                 * @name listeners.ObservableListenerHandle
                 */
                handle = {
                    
                    /**
                     * @function
                     * @param {string} name The message name to unsubscribe from (optional, if not specified then the listeners for all messages will be removed)
                     * @returns
                     */
                    unsubscribe: _createRemoveObservableFunc(handles)
                    
                    /**
                     * @function
                     * @name remove
                     * @memberOf listeners.ObservableListenerHandle.prototype
                     * 
                     * @param type
                     * @returns
                     * 
                     * @deprecated
                     */
                    
                    /**
                     * @function
                     * @name removeAll
                     * @memberOf listeners.ObservableListenerHandle.prototype
                     * @returns
                     * @deprecated
                     */
                };
                
                handle.remove = handle.removeAll = handle.unsubscribe;
                
                return handle;
            }
            
            checkMessage(name, _this);
            
            var listenersInstance = _this._byName[name];
            if (!listenersInstance)
            {
                _this._byName[name] = listenersInstance = new Listeners();
                
                
                //Prevent a memory leak by removing empty listener lists
                listenersInstance.onEmpty(function() {
                    delete _this._byName[name];
                });
            }
            return listenersInstance.add(callback, thisObj, autoRemove);
        },
        
        /**
         * Publishes a message with the specified name.
         * 
         * Arguments can be passed to the subscribers by providing zero or more arguments after the topic name argument
         * 
         * Example code:
         * <js>
         * //Simple string as argument
         * someObj.publish('myMessage', 'Hello World!');
         * 
         * //Multiple arguments
         * someObj.publish('myMessage', 'Hello World!', 'John Doe');
         * </js>
         * 
         * @param name {String|listeners.Message} The message name or a Message object that has the message name and args as properties.
         * @param props {Object|Array} Properties to apply to the published message object
         */
        publish: function(name, message) {
            
            var args;
            
            if (isArray(message)) {
                args = message;
            }
            else {
                if (listeners.isMessage(name)) {
                    message = name;
                    name = message.getName();
                }
                else {
                    message = listeners.createMessage(name, message);
                }
                args = [message.data, message];
            }
            
            
            checkMessage(name, this);
           
            var _this = this;
            
            var _publish = function(name) {
                var listenersInstance = _this._byName[name];
                if (!listenersInstance) return;
                
                listenersInstance.publish.apply(listenersInstance, args);
            };
            
            _publish(name);
            _publish('*');
            
            var lastDot = name.lastIndexOf('.');
            if (lastDot >= 0)
            {
                _publish(name.substring(0, lastDot+1) + '*');
            }
            
            return message;
        }
    };
    /**
     * @namespace
     * @raptor
     * @name listeners
     */
    return (raptor.listeners = listeners = {
        /**
         * @type listeners.Message
         * 
         */
        Message: Message,
        
        /**
         * Creates a new listener list and returns it.
         * 
         * @returns {listeners.Listeners} The newly created {@link listeners.Listeners} object.
         */
        createListeners: function() {
            return new Listeners();
        },
        
        /**
         * Creates a new observable object and returns it.
         * 
         * @param allowedMessages {Array<String>} An array of messages that are allowed (more can be added later using {@Link .registerMessages}). Optional
         * 
         * @returns {listeners.Observable} The newly created {@link listeners.Observable} object.
         */
        createObservable: function(allowedMessages, createFunctions) {
            var o = new Observable();
            if (allowedMessages) {
                o.registerMessages(allowedMessages, createFunctions);
            }
            return o;
        },
        
        /**
         * 
         * Makes an existing object/class observable by extending the target with the required methods and properties from the {@link listeners.Observable} class.
         * <ul>
         * <li>{@link listeners.Observable#subscribe}</li>
         * <li>{@link listeners.Observable#publish}</li>
         * </ul>
         * 
         * <p>
         * Example code:
         * <js>
         * var someObj = {};
         * listeners.makeObservable(someObj);
         * 
         * someObj.subscribe("someEvent", function() { ... });
         * someObj.publish("someEvent", ...);
         * </js>
         * 
         * @param obj {Object} The instance object to make observable
         * @param proto {prototype} The prototype to apply the Observable methods to. If not provided then the methods are applied directly to the object provided as the first argument.
         * 
         * @return {void}
         */
        makeObservable: function(obj, proto, allowedMessages, createFunctions) {
            if (!proto) {
                proto = obj;
            }
            
            if (!proto._observable) {
                proto._observable = true;
                extend(proto, Observable.prototype);
            }
            
            Observable.call(obj);
            
            if (allowedMessages) {
                obj.registerMessages(allowedMessages, createFunctions);
            }
        },
        
        isObervable: function(o) {
            return o && o.__observable;
        },
        
        /**
         * 
         * @param name
         * @param props
         * @returns {Message}
         */
        createMessage: function(name, data) {
            return new Message(name, data);
        },
        
        /**
         * 
         * @param o
         * @returns {Boolean}
         */
        isMessage: function(o) {
            return o instanceof Message;
        },
        
        /**
         * @function
         * @param callbackFunc
         * @param thisObj
         */
        bind: _bind,
        
        /**
         * Unsubscibes a listener from all of the messages that it has subscribed to.
         * 
         * This method works because all listener handles are registered with the
         * message subscriber (i.e. the "thisObj" provided when subscribing to a message).
         * 
         * When a message is unsubscribed for a subscriber then the listener handle is
         * deregistered.
         * 
         * @param thisObj The subscriber to unsubscribe from all messages
         */
        unsubscribeFromAll: function(thisObj) {
            var handles = thisObj[handlesPropName];
            if (handles) {
                for (var k in handles) {
                    handles[k].unsubscribe();
                }
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

/**
 * The RaptorJS loader module allows JavaScript, CSS and modules to be included in the page asynchronously after the page
 * has already finished loading. The loader module supports including individual resources or including multiple resources
 * of possibly mixed types as a single transaction. 
 * 
 * <p>
 * When including a resource or a set of resources a callback can
 * be provided to track the progress of the include. 
 * 
 * 
 */
define('loader', function(raptor) {
    "use strict";
    
    var included = {},
        downloaded = {},
        forEach = raptor.forEach,
        forEachEntry = raptor.forEachEntry,
        listeners = raptor.listeners,
        events = ['asyncStart', 'asyncComplete', 'success', 'error', 'complete'],
        _createAsyncCallback = function(callback, thisObj) {
            var observable = listeners.createObservable(events, true);
            if (callback) {
                if (typeof callback === 'function') {
                    observable.complete(callback, thisObj);
                }
                else {
                    //Assume the callback is an object
                    observable.subscribe(callback, thisObj);
                }
            }
            return observable;
        },
        progressEvents = listeners.createObservable(),
        _handleUrlStart = function(url, callback) {
            var data = downloaded[url];
                
            if (data) {

                if (data.success) {
                    callback.success(data);
                }
                else {
                    callback.error(data);
                }
                callback.complete(data);
                return true;
            }
            else if ((data = included[url])) {
                callback.asyncStart(data);
                
                //Piggy-back off the existing include for the remaining events
                forEach(
                    events,
                    function(event) {
                        if (event === 'asyncStart') {
                            //Skip the "asyncStart" event since already handled that
                            return;
                        }
                        progressEvents.subscribe(event + ':' + url, function(data) {
                            callback.publish(event, data);
                        }, this, true /*auto remove*/);
                    }, this);
                return true;
            }

            included[url] = data = {url: url, completed: false};
            
            callback.asyncStart(data);
            return false;
        },
        _handleUrlComplete = function(url, isSuccess, callback) {
            
            var data = included[url];
            delete included[url];
            
            data.success = isSuccess;
            data.complete = true;
            
            var _publish = function(event) {
                callback[event](data);
                progressEvents.publish(event + ':' + url, data);
            };
            
            if (isSuccess) {
                downloaded[url] = data;
                _publish('success');
                
            }
            else {
                _publish('error');
            }
            
            _publish('asyncComplete');
            _publish('complete');
        },
        _createImplCallback = function(url, callback) {
            return {
                success: function() {
                    _handleUrlComplete(url, true, callback);
                },
                error: function() {
                    _handleUrlComplete(url, false, callback);
                }
            };
        };
        
    /**
     * A transaction consisting of resources to be included.
     * 
     * @class
     * @anonymous
     * @name loader.Transaction
     * 
     * @param loader {loader} The loader module that started this transaction 
     */
    var Transaction = function(loader) {
        
        var _includes = [],
            _included = {},
            started,
            _this = {
                
                /**
                 * Adds a include to the transaction
                 * 
                 * @param url {String} The URL/ID of the include
                 * @param include {Object} The data for the include
                 * @param includeFunc The function to actually include the resource (a callback will be provided)
                 * @param thisObj The "this" object ot use for the includeFunc arg
                 */
                _add: function(url, include, includeFunc, thisObj) {
                    if (started || _included[url]) {
                        return;
                    }
                    
                    _included[url] = 1;
                    
                    _includes.push(function(callback) {
                        if (_handleUrlStart(url, callback)) {
                            return;
                        }
                        
                        includeFunc.call(
                                thisObj, 
                                include, 
                                _createImplCallback(url, callback));
                    });
                },
                
                /**
                 * 
                 * @param url
                 * @returns {Boolean} Returns true if the  URL has already been included as part of this transaction. False, otherwise.
                 */
                isIncluded: function(url) {
                    return !!_included[url];
                },
                
                /**
                 * Marks a URL as included
                 * 
                 * @param url The URL to mark as included
                 */
                setIncluded: function(url) {
                    _included[url] = 1;
                },
                
                /**
                 * 
                 * @param type The resource type (e.g. "js", "css" or "module"
                 * @param includes {Object|Array} The array of includes or a single include 
                 */
                add: function(type, includes) {
                    
                    var handler = loader["handle_" + type];
                    
                    if (handler == null) {
                        throw new Error("Invalid type: " + type);
                    }
                    
                    forEach(includes, function(include) {
                        handler.call(loader, include, _this);
                    });
                },
                        
                /**
                 * 
                 * @param userCallback
                 * @returns {loader.Transaction} Returns itself
                 */
                execute: function(userCallback) {
                    started = 1;
                    
                    var failed = [],
                        status = {failed: failed};
                    
                    if (!_includes.length) {
                        userCallback.success(status);
                        userCallback.complete(status);
                    }
                    
                    var completedCount = 0,
                        asyncStarted = false,
                        callback = _createAsyncCallback({
                                asyncStart: function() {
                                    if (!asyncStarted) {
                                        asyncStarted = true;
                                        userCallback.asyncStart(status);
                                    }
                                },
                                error: function(url) {
                                    failed.push(url);
                                }, 
                                complete: function() {
                                    completedCount++;
                                    if (completedCount === _includes.length) {
                                        
                                        if ((status.success = !failed.length)) {
                                            userCallback.success(status);
                                        }
                                        else {
                                            userCallback.error(status);
                                        }
                                        
                                        if (asyncStarted) {
                                            userCallback.asyncComplete(status);
                                        }
            
                                        userCallback.complete(status);
                                    }
                                }
                            });
                    
                    
                    
                    forEach(_includes, function(execFunc) {
                        execFunc(callback);
                    });
                    return _this;
                }
            };
        
        return _this;
    };

    return {
        
        /**
         * 
         * @param url
         * @returns
         */
        isDownloaded: function(url) {
            return downloaded[url] !== undefined;
        },
        
        /**
         * 
         * @param includes
         * @param callback
         * @param thisObj
         * @returns
         */
        include: function(includes, callback, thisObj) {
            var transaction = new Transaction(this);

            forEachEntry(includes, function(type, includesForType) {
                transaction.add(type, includesForType);
            });

            return transaction.execute(_createAsyncCallback(callback, thisObj));
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
 */
raptor.extend('loader', function(raptor) {
    "use strict";
    
    return {
        
        handle_js: function(include, transaction) {
            var url = include.src || include.url || include;
            transaction._add(url, include, this.includeJSImpl, this);
        },
        
        handle_css: function(include, transaction) {
            var url = include.href || include.url || include;
            transaction._add(url, include, this.includeCSSImpl, this);
        },
        
        /**
         * 
         * @param src
         * @param callback
         * @param thisObj
         * @returns
         */
        includeJS: function(src, callback, thisObj) {
            return this.include({js: [src]}, callback, thisObj);
        },
        
        /**
         * 
         * @param href
         * @param callback
         * @param thisObj
         * @returns
         */
        includeCSS: function(href, callback, thisObj) {
            return this.include({css: [href]}, callback, thisObj);
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
 * @extension Raptor
 */
raptor.extend('loader', function(raptor) {
    "use strict";
    var extend = raptor.extend,
        headEl,
        createEl = function(tagName, attributes) {
            var newEl = document.createElement(tagName);
            if (attributes) {
                extend(newEl, attributes);    
            }
            return newEl;
        },
        insertEl = function(el) {
            if (headEl == null)
            {
                headEl = document.getElementsByTagName("head")[0];
            }       
            headEl.appendChild(el);
        };
    
    return {
        /**
         * 
         * @param src
         * @param callback
         * @returns
         * 
         * @protected
         */
        includeJSImpl: function(src, callback, attributes) {

            attributes = attributes || {};
            
            var complete = false,
                _this = this;
            
            var success = function() {
                if (complete === false) {                    
                    complete = true;
                    _this.logger().debug('Downloaded "' + src + '"...');
                    callback.success();
                }
            };
            
            var error = function() {
                if (complete === false) {                    
                    complete = true;
                    _this.logger().error('Failed: "' + src);
                    //Let the loader module know that the resource was failed to be included
                    callback.error();
                }
            };
            
            extend(attributes, {
                type: 'text/javascript',
                src: src,
                onreadystatechange: function () {
                    if (el.readyState == 'complete' || el.readyState == 'loaded') {
                        success();
                    }
                },

                onload: success,
                
                onerror: error
            });
            
            var el = createEl(
                    "script", 
                    attributes);
            
            if (el.addEventListener)
            {
                try {
                    el.addEventListener("load", function() {
                        success();
                    });
                }
                catch(e) {}
            }

            insertEl(el);
        },
        
        /**
         * 
         * @param href
         * @param callback
         * @param attributes
         * @returns
         * 
         * @protected
         */
        includeCSSImpl: function(href, callback, attributes) {

            var retries = 20;
            
            var complete = false,
                _this = this;
            
            var el = createEl('link');
            
            var cleanup = function() {
                el.onload = null;
                el.onreadystatechange = null;
                el.onerror = null;
            };
            
            var isLoaded  = function() {
                var sheets = document.styleSheets;
                for (var idx = 0, len = sheets.length; idx < len; idx++) {
                    if (sheets[idx].href === href) {
                        return true;
                    }
                }
                return false;
            };

            var success = function() {
                if (complete === false) {                    
                    complete = true;
                    cleanup();
                    _this.logger().debug('Downloaded: "' + href + '"');
                    //Let the loader module know that the resource has included successfully
                    callback.success();
                }
            };
            
            var pollSuccess = function() {
                if (complete === false) {
                    if (!isLoaded() && (retries--)) {
                        return window.setTimeout(pollSuccess,10);
                    }
                    success();
                }
            };
            
            var error = function() {
                this.logger().error('Failed: "' + href + '"');
                if (complete === false)
                {                    
                    complete = true; 
                    cleanup();
                    //Let the loader module know that the resource was failed to be included
                    callback.error();
                }
            };
            
            extend(el, {
                type: 'text/css',
                rel: "stylesheet",
                href: href
            });
            
            if (attributes) {
                extend(el, attributes);
            }
            
            if (navigator.appName == 'Microsoft Internet Explorer') {
                el.onload = success;                
                el.onreadystatechange = function() {
                    var readyState = this.readyState;
                    if ("loaded" === readyState || "complete" === readyState) {
                        success();
                    }
                };
            }
            else
            {
                //For non-IE browsers we don't get the "onload" and "onreadystatechange" events...
                pollSuccess();
            }
            
            el.onerror = error;      
            insertEl(el);
        }
    };
});
$rloaderMeta={"module-b":{"css":["static/test-page-async-head-981b6ffe.css"],"js":["static/test-page-async-body-45012617.js"]}};
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
 * @extension Module Loader
 */
raptor.extend('loader', function(raptor) {
    "use strict";
    
    var forEach = raptor.forEach,
        extend = raptor.extend;
    
    var handle_require = function(require, transaction) {
        
        //See if the require already exists
        var existingModule = raptor.find(require);
        if (existingModule) {
            return; //Module already available... nothing to do
        }
        
        //If the require has already been included as part of this transaction then nothing to do
        if (transaction.isIncluded(require)) {
            return;
        }
        
        //Mark the require as being part of this transaction
        transaction.setIncluded(require);
        
        //The metadata for the requires should have been serialized to a global variable
        //This information is required so that we know what the dependencies are for the require
        var asyncModulesMetadata = raptor.global.$rloaderMeta;
        
        var missing = function() {
            throw new Error('Dependencies missing: "' + require + '"');
        };
        
        if (!asyncModulesMetadata) {
            //Can't load the require if there is no metadata for any of the requires
            missing();
        }

        //Now load the metadata for the requested require
        var metadata = asyncModulesMetadata[require];
        
        if (!metadata) {
            //No metadata data found for this require... Throw an error
            missing();
        }
        
        //Include all of the requires that this require depends on (if any)
        transaction.add('requires', metadata.requires);
        
        //Include all of the CSS resources that are required by this require (if any)
        transaction.add('js', metadata.js);
        
        //And include all of the JS resources that are required by this require (if any)
        transaction.add('css', metadata.css);
    };
    
    return {
        handle_require: handle_require,
        handle_requires: handle_require,

        /**
         * Includes the specified requires asynchronously and invokes the callback methods in the provided callback for the supported events.
         * 
         * <p>The loaded requires will be passed to the success callback in the order that the requires are specified. 
         * 
         * @param requires {String|Array<String>} A require name or an array of require names
         * @param callback {Function|Object} Either a success/error callback function or an object with event callbacks. Supported events: asyncStart, success, error, asyncComplete, complete
         * @param thisObj The "this" object to use for the callback functions
         * 
         * @returns {loader.Transaction} The transaction for the asynchronous loading of the require(s)
         */
        require: function(requires, callback, thisObj) {
            var userSuccessFunc, //A reference to the user's success callback (if provided)
                wrappedCallback,
                isFunctionCallback = typeof callback === 'function';
            
            if ((userSuccessFunc = (isFunctionCallback ? callback : callback.success))) {
                //We want to pass the loaded requires as arguments to the success callback and that
                //is something the "loader" require will not do for us since it deals with objects
                //of mixed types (including CSS resources, JS resources and requires). To solve
                //that problem we are going to wrap the user success callback with our own
                //and have it be a proxy to the user's success callback
                
                //Copy all of the callback properties to a new object
                wrappedCallback = typeof callback !== "function" ? extend({}, callback) : {};
                
                //Now replace the success callback with our own. NOTE: We have already saved a reference to the user's success callback
                wrappedCallback.success = function() {
                    //Everything has finished loading so now let's go back through the require names and get the references
                    //to the loaded requires and added to the loadedModules array which will be passed to the success callback
                    var loadedModules = [];
                    try
                    {
                        forEach(requires, function(require) {
                            loadedModules.push(raptor.find(require)); //Loading the require for the first time might trigger an error if there is a problem inside one of the factory functions for the required requires
                        });
                    }
                    catch(e) {
                        //Log the error since this happened in an asynchronous callback
                        this.logger().error(e);
                        
                        //If an error happens we want to make sure the error callback is invoked
                        if (wrappedCallback.error) {
                            wrappedCallback.error.call(thisObj);
                        }
                        return;
                    }
                    
                    //Everything loaded successfully... pass along the required requires to the user's success callback function
                    userSuccessFunc.apply(thisObj, loadedModules);
                };
                
                if (isFunctionCallback) {
                    //A single function as we provided as a callback that is used for both success and error. Thereore, we need to also
                    //wrap the error callback and invoke the provided callback with no arguments to indicate an error
                    wrappedCallback.error = function() {
                        //Call the success callback with no requires to indicate an error
                        userSuccessFunc.call(thisObj);
                    };
                }
                
            }
            
            //Create a new transaction that consists of the requested requires and execute it
            return this.include(
                {
                    requires: requires
                }, 
                wrappedCallback || callback, 
                thisObj);
        }
        
    };
});