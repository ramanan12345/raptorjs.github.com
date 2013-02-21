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
(function() {
    var stringProto = String.prototype;
    
    if (!stringProto.startsWith) {
        stringProto.startsWith = function(prefix, position) {
            var str = this;
            
            if (position) {
                str = str.substring(position);
            }
            
            if (str.length < prefix.length) {
                return false;
            }
            
            return str.substring(0, prefix.length) == prefix;
        };
    }
    
    if (!stringProto.endsWith) {
        stringProto.endsWith = function(suffix, position) {
            var str = this;
            
            if (position) {
                str = str.substring(position);
            }
            
            if (str.length < suffix.length) {
                return false;
            }
            
            return str.slice(0 - suffix.length) == suffix;
        };
    }
}());

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

        require = _extendRequire(function(id) {
            id = _normalize(id);
            return raptor.require.apply(raptor, arguments);
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


define('raptor/logging', ['raptor'], function(raptor) {
    /*jshint strict:false */
    
    /**
     * @class
     * @name raptor/logging/VoidLogger
     */
    
    /**
     * 
     */
    var EMPTY_FUNC = function() {
            return false;
        },
        /**
         * @name raptor/logging/voidLogger
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

    return {
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

define("raptor/strings/StringBuilder", function(require) {
    "use strict";
    
    /**
     * Used to build a string by using an array of strings as a buffer.
     * When it is ready to be converted to a string the array elements
     * are joined together with an empty space.
     * 
     * @constructs
     * @constructor Initializes an empty StringBuilder
     * @class
     */
    var StringBuilder = function() {
        /**
         * @type Array
         */
        this.array = [];
        /**
         * The length of the string
         * @type Number
         */
        this.length = 0;

    };

    StringBuilder.prototype = {
            /**
             * Appends a string to the string being constructed.
             * 
             * @param {Object} obj The string or object to append
             * @returns {raptor/strings/StringBuilder} Returns itself
             */
            append: function(obj)
            {
                if (typeof obj !== 'string') {
                    obj = obj.toString();
                }
                this.array.push(obj);
                this.length += obj.length;
                
                return this;
            },
            
            /**
             * Converts the string buffer into a String.
             * 
             * @returns {String} The built String
             */
            toString: function()
            {
                return this.array.join('');
            },
            
            /**
             * Clears the string
             * 
             * @returns {raptor/strings/StringBuilder} Returns itself
             */
            clear: function()
            {
                this.array = [];
                this.length = 0;
                return this;
            }
    };
    
    StringBuilder.prototype.write = StringBuilder.prototype.append;
    
    return StringBuilder;
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

define("raptor/strings", ['raptor'], function(raptor, require) {
    "use strict";
    
    var EMPTY_STRING = '',
        trim = function(s){
            return s ? s.trim() : EMPTY_STRING;
        },
        StringBuilder = require('raptor/strings/StringBuilder'),
        varRegExp = /\$\{([A-Za-z0-9_\.]+)\}/g;

    return {

        compare: function(s1, s2)
        {
            return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
        },
        
        /**
         * @param {string} s The string to operate on
         * @return {boolean} Returns true if the string is null or only consists of whitespace
         * 
         * @static
         */
        isEmpty: function(s)
        {
            return s == null || trim(s).length === 0;
        },

        /**
         * @param {string} s The string to operate on
         * @return {integer} Returns the length of the string or 0 if the string is null
         * 
         * @static
         */
        length: function(s)
        {
            return s == null ? 0 : s.length;
        },

        /**
         * @param {object} o The object to test
         * @return {boolean} Returns true if the object is a string, false otherwise.
         * 
         * @static
         */
        isString: function(s) {
            return typeof s === 'string';
        },

        /**
         * Tests if two strings are equal
         * 
         * @param s1 {string} The first string to compare
         * @param s2 {string} The second string to compare
         * @param shouldTrim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
         * @return {boolean} Returns true if the strings are equal, false otherwise
         * 
         * @static
         */
        equals: function(s1, s2, shouldTrim)
        {        
            if (shouldTrim !== false)
            {
                s1 = trim(s1);
                s2 = trim(s2);
            }
            return s1 == s2;
        },

        /**
         * Tests if two strings are not equal
         * 
         * @param s1 {string} The first string to compare
         * @param s2 {string} The second string to compare
         * @param trim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
         * @return {boolean} Returns true if the strings are equal, false otherwise
         * 
         * @see {@link #equals}
         * @static
         */
        notEquals: function(s1, s2, shouldTrim)
        {
            return this.equals(s1, s2, shouldTrim) === false;
        },
        
        trim: trim,

        ltrim: function(s){
            return s ? s.replace(/^\s\s*/,'') : EMPTY_STRING;
        },

        rtrim: function(s){
            return s ? s.replace(/\s\s*$/,'') : EMPTY_STRING;
        },

        startsWith: function(s, prefix) {
            return s == null ? false : s.startsWith(prefix);
        },

        endsWith: function(s, suffix) {
            return s == null ? false : s.endsWith(suffix);
        },
        
        /**
         * 
         * @param c
         * @returns
         */
        unicodeEncode: function(c) {
            return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
        },
        
        merge: function(str, data) {
            var varMatches,
                replacement,
                parts = [],
                lastIndex = 0;
                
            varRegExp.lastIndex = 0;

            while ((varMatches = varRegExp.exec(str))) {
                parts.push(str.substring(lastIndex, varMatches.index));
                replacement = data[varMatches[1]];
                parts.push(replacement !== undefined ? replacement : varMatches[0]);
                lastIndex = varRegExp.lastIndex;
            }
            
            parts.push(str.substring(lastIndex));
            return parts.join('');
        },
        
        StringBuilder: StringBuilder,
        
        createStringBuilder: function() {
            return new StringBuilder();
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

define(
    'raptor/xml/utils',
    function(require, exports, module) {
        "use strict";
        
        var elTest = /[&<]/,
            elTestReplace = /[&<]/g,
            attrTest = /[&<>\"\'\n]/,
            attrReplace = /[&<>\"\'\n]/g,
            replacements = {
                '<': "&lt;",
                '>': "&gt;",
                '&': "&amp;",
                '"': "&quot;",
                "'": "&apos;",
                '\n': "&#10;" //Preserve new lines so that they don't get normalized as space
            };
        
        return {
            escapeXml: function(str) {
                if (typeof str === 'string' && elTest.test(str)) {
                    return str.replace(elTestReplace, function(match) {
                        return replacements[match];
                    });
                }
                return str;
            },
            
            escapeXmlAttr: function(str) {
                if (typeof str === 'string' && attrTest.test(str)) {
                    return str.replace(attrReplace, function(match) {
                        return replacements[match];
                    });
                }
                return str;
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
 * The {@link raptor/render-context/Context} class represents a "rendering context"
 * suitable for rendering HTML to a writer. A context object is required when rendering 
 * a template and the context object contains a reference to an underlying writer object that is
 * used to capture the rendered output.
 */
define.Class(
    'raptor/render-context/Context',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var forEachEntry = raptor.forEachEntry,
            escapeXmlAttr = require('raptor/xml/utils').escapeXmlAttr,
            StringBuilder = require('raptor/strings/StringBuilder'),
            createError = raptor.createError,
            nextUniqueId = 0,
            bind = function(func, context) {
                return function() {
                    return func.apply(context, arguments); //Proxy the arguments to the real function and use the "context" object for the "this" object
                };
            },
            _classFunc = function(className, name) {
                var Clazz = require(className),
                    func = Clazz[name] || (Clazz.prototype && Clazz.prototype[name]);
                
                if (!func) {
                    throw createError(new Error('Helper function not found with name "' + name + '" in class "' + className + '"'));
                }
                return func;
            };
        
        /**
         * 
         */
        var Context = function(writer) {
            this.writer = writer;
            this.w = this.write;
            this.listeners = {};
        };
        
        Context.classFunc =  _classFunc;

        var proto = {
            /**
             * Returns the attributes object associated with the context.
             * 
             * The attributes object is just a regular JavaScript Object that can be used to store arbitrary data.
             * 
             * @returns {Object} The attribute object.
             */
            getAttributes: function() {
                return this.attributes || (this.attributes = {});
            },

            /**
             * Returns a auto-incrementing unique ID that remains unique across multiple context objects. 
             * @returns {Number} The unique number
             */
            uniqueId: function() {
                return 'c' + nextUniqueId++;
            },
            
            /**
             * Outputs a string to the underlying writer. If the object is null then nothing is written. If the object is not a string then it is converted to a string using the <code>toString</code> method.
             *  
             * @param str {String|Object} The String (or Object) to write to the underlying writer.
             */
            write: function(str) {
                if (str !== null && str !== undefined) {
                    if (typeof str !== 'string') {
                        str = str.toString();
                    }
                    this.writer.write(str);
                }
                return this;
            },
            
            /**
             * Returns the string output associated with the underling writer by calling <code>this.writer.toString()</code>
             * 
             * @returns {String} The String output
             */
            getOutput: function() {
                return this.writer.toString();
            },
            
            /**
             * 
             * Temporarily swaps out the underlying writer with a temporary buffer and invokes the provided function to capture the output and return it. 
             * 
             * After the function has completed the old writer is swapped back into place. The old writer will remain untouched. 
             * Internally, this method uses the {@link raptor/render-context/Context.prototype#swapWriter} method.
             * 
             * @param func {Function} The function to invoke while the old writer is swapped out
             * @param thisObj {Object} The "this" object ot use for the provided function
             * @returns {String} The resulting string output.
             */
            captureString: function(func, thisObj) {
                var sb = new StringBuilder();
                this.swapWriter(sb, func, thisObj);
                return sb.toString();
            },
            
            /**
             * Temporarily swaps out the underlying writer with the provided writer and invokes the provided function. 
             * 
             * After the function has completed the old writer is swapped back into place. The old writer will remain untouched. 
             * 
             * @param newWriter {Object} The new writer object to use. This object must have a "write" method.
             * @param func {Function} The function to invoke while the old writer is swapped out
             * @param thisObj {Object} The "this" object ot use for the provided function
             * 
             * @returns {void}
             */
            swapWriter: function(newWriter, func, thisObj) {
                var oldWriter = this.writer;
                try
                {
                    this.writer = newWriter;
                    func.call(thisObj);
                }
                finally {
                    this.writer = oldWriter;
                }
            },
            
            /**
             * 
             * @param handler
             * @param input
             */
            invokeHandler: function(handler, input) {
                var func = handler.process || handler.render;
                func.call(handler, input, this);
            },

            getFunction: function(className, name) {
                if (!this._helpers) {
                    this._helpers = {};
                }
                
                var key = className + ":" + name,
                    helper = this._helpers[key];
                
                if (!helper) {
                    helper = this._helpers[key] = bind(_classFunc(className, name), this);
                }
                
                return helper;
            },
            
            isTagInput: function(input) {
                return input && input.hasOwnProperty("_tag");
            },
            
            renderTemplate: function(name, data) {
                require("raptor/templating").render(name, data, this);
                return this;
            },
            
            attr: function(name, value, escapeXml) {
                if (value === null) {
                    value = '';
                }
                else if (value === undefined || typeof value === 'string' && value.trim() === '') {
                    return this;
                }
                else {
                    value = '="' + (escapeXml === false ? value : escapeXmlAttr(value)) + '"';
                }
                
                this.write(' ' + name + value);
                
                return this;
            },
            
            /**
             * 
             * @param attrs
             */
            attrs: function(attrs) {
                if (arguments.length !== 1) {
                    this.attr.apply(this, arguments);
                }
                else if (attrs) {
                    forEachEntry(attrs, this.attr, this);    
                }
                return this;
            },
            
            /**
             * Helper function invoke a tag handler
             */
            t: function(handler, props, body, dynamicAttributes, namespacedProps) {
                if (!props) {
                    props = {};
                }
                
                props._tag = true;
                
                props.invokeBody = body;
                if (dynamicAttributes) {
                    props.dynamicAttributes = dynamicAttributes;
                }
                
                if (namespacedProps) {
                    raptor.extend(props, namespacedProps);
                }
                
                this.invokeHandler(handler, props);
                
                return this;
            },
            
            c: function(func) {
                var output = this.captureString(func);
                return {
                    toString: function() { return output; }
                };
            }
        };
        
        // Add short-hand method names that should be used in compiled templates *only*
        proto.a = proto.attrs;
        proto.f = proto.getFunction;
        proto.i = proto.renderTemplate;
        
        Context.prototype = proto;

        
        
        return Context;
        
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
 * This module provides the runtime for rendering compiled templates.
 * 
 * 
 * <p>The code for the Raptor Templates compiler is kept separately
 * in the {@link raptor/templating/compiler} module. 
 */
define('raptor/render-context', function(require, exports, module) {
    "use strict";
    
    var StringBuilder = require('raptor/strings/StringBuilder'),
        Context = require('raptor/render-context/Context');
    
    
    return {
        /**
         * Creates a new context object that can be used as the context for
         * template rendering.
         * 
         * @param writer {Object} An object that supports a "write" and a "toString" method.
         * @returns {raptor/render-context/Context} The newly created context object
         */
        createContext: function(writer) {
            return new Context(writer || new StringBuilder()); //Create a new context using the writer provided
        },
        
        Context: Context
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
 * This module provides the runtime for rendering compiled templates.
 * 
 * 
 * <p>The code for the Raptor Templates compiler is kept separately
 * in the {@link raptor/templating/compiler} module. 
 */
define('raptor/templating', ['raptor'], function(raptor, require, exports, module) {
    "use strict";
    
    var getRegisteredTemplate = function(name) {
            return $rget('rhtml', name);
        },
        loadedTemplates = {},
        isArray = Array.isArray,
        createError = raptor.createError,
        StringBuilder = require('raptor/strings/StringBuilder'),
        escapeXml = require('raptor/xml/utils').escapeXml,
        escapeXmlAttr = require('raptor/xml/utils').escapeXmlAttr,
        renderContext = require('raptor/render-context'),
        Context = renderContext.Context,
        _getFunction = Context.classFunc,
        templating,
        /**
         * Helper function to return the singleton instance of a tag handler
         * 
         * @param name {String} The class name of the tag handler
         * @returns {Object} The tag handler singleton instance.
         */
        _getHandler = function(name) {
            var Handler = require(name), //Load the handler class
                instance;
            
            if (Handler.process || Handler.render) {
                instance = Handler;
            }
            else if (!(instance = Handler.instance)) { //See if an instance has already been created
                instance = Handler.instance = new Handler(); //If not, create and store a new instance
            }
            
            return instance; //Return the handler instance
        },
        /**
         * Helper function to check if an object is "empty". Different types of objects are handled differently:
         * 1) null/undefined: Null and undefined objects are considered empty
         * 2) String: The string is trimmed (starting and trailing whitespace is removed) and if the resulting string is an empty string then it is considered empty
         * 3) Array: If the length of the array is 0 then the array is considred empty
         * 
         */
        notEmpty = function(o) {
            if (Array.isArray(o) === true) {
                return o.length !== 0;
            }
            
            return o;
        },
        helpers = {
            
            /**
             * Helper function to return a static helper function
             * 
             * @function
             * @param uri
             * @param name
             * @returns {Function} The corresponding helper function. An exception is thrown if the helper function is not found
             */
            h: _getFunction,
            
            t: _getHandler,
            
            /**
             * forEach helper function
             * 
             * @param array {Array} The array to iterate over
             * @param callback {Function} The callback function to invoke for each iteration 
             * @returns {void}
             */
            fv: function(array, callback) {
                if (!array) {
                    return;
                }
                
                if (!array.forEach) {
                    array = [array];
                }
                
                var i=0, 
                    len=array.length, //Cache the array size
                    loopStatus = { //The "loop status" object is provided as the second argument to the callback function used for each iteration
                        /**
                         * Returns the length of the array that is being iterated over
                         * @returns {int} The length of the array
                         */
                        getLength: function() {
                            return len;
                        },
                        
                        /**
                         * Returns true if the current iteration is the last iteration
                         * @returns {Boolean} True if the current iteration is the last iteration. False, otherwse.
                         */
                        isLast: function() {
                            return i === len-1;
                        },
                        isFirst: function() {
                            return i === 0;
                        },
                        getIndex: function() {
                            return i;
                        }
                    };
                
                for (; i<len; i++) { //Loop over the elements in the array
                    var o = array[i];
                    callback(o || '', loopStatus);
                }
            },
            
            f: raptor.forEach,
            
            fl: function(array, func) {
                if (array != null) {
                    if (!isArray(array)) {
                        array = [array];
                    }
                    func(array, 0, array.length);
                }
            },

            fp: function(o, func) {
                if (!o) {
                    return;
                }
                for (var k in o)
                {
                    if (o.hasOwnProperty(k))
                    {
                        func(k, o[k]);
                    }
                }
            },
            
            e: function(o) {
                return !notEmpty(o);
            },
            
            ne: notEmpty,
            
            /**
             * escapeXml helper function
             * 
             * @param str
             * @returns
             */
            x: escapeXml,
            xa: escapeXmlAttr,
            
            nx: function(str) {
                return {
                    toString: function() {
                        return str;
                    }
                };
            }
        };
    
    templating = {

        /**
         * Returns a function that can be used to render the template with the specified name.
         *
         * The template function should always be invoked with two arguments:
         * <ol>
         *  <li><b>data</b> {Object}: The template data object</li>
         *  <li><b>context</b> {@link raptor/templating/Context}: The template context object</li>
         * </ul>
         * 
         * @param  {String} templateName The name of the template
         * @return {Function} The function that can be used to render the specified template.
         */
        templateFunc: function(templateName) {

            /*
             * We first need to find the template rendering function. It's possible
             * that the factory function for the template rendering function has been
             * registered but that the template rendering function has not already
             * been created.
             * 
             * The template rendering functions are lazily initialized.
             */
            var templateFunc = loadedTemplates[templateName]; //Look for the template function in the loaded templates lookup
            if (!templateFunc) { //See if the template has already been loaded
                /*
                 * If we didn't find the template function in the loaded template lookup
                 * then it means that the template has not been fully loaded and initialized.
                 * Therefore, check if the template has been registerd with the name provided
                 */
                templateFunc = getRegisteredTemplate(templateName);
                
                if (!templateFunc && this.findTemplate) {
                    this.findTemplate(templateName);
                    templateFunc = getRegisteredTemplate(templateName);    
                }
                
                if (templateFunc) { //Check the registered templates lookup to see if a factory function has been register
                    /*
                     * We found that template has been registered so we need to fully initialize it.
                     * To create the template rendering function we must invoke the template factory
                     * function which expects a reference to the static helpers object.
                     * 
                     * NOTE: The factory function allows static private variables to be created once
                     *       and are then made available to the rendering function as part of the
                     *       closure for the rendering function
                     */
                    templateFunc = templateFunc(helpers); //Invoke the factory function to get back the rendering function
                }
                
                if (!templateFunc) {
                    throw createError(new Error('Template not found with name "' + templateName + '"'));
                }
                loadedTemplates[templateName] = templateFunc; //Store the template rendering function in the lookup
            }

            return templateFunc;
        },

        /**
         * Renders a template to the provided context.
         * 
         * <p>
         * The template specified by the templateName parameter must already have been loaded. The data object
         * is passed to the compiled rendering function of the template. All output is written to the provided
         * context using the "writer" associated with the context.
         * 
         * @param templateName The name of the template to render. The template must have been previously rendered
         * @param data The data object to pass to the template rendering function
         * @param context The context to use for all rendered output (required)
         */
        render: function(templateName, data, context) {
            if (!context) {
                throw createError(new Error("Context is required"));
            }
            
            var templateFunc = this.templateFunc(templateName);

            try
            {
                templateFunc(data || {}, context); //Invoke the template rendering function with the required arguments
            }
            catch(e) {
                throw createError(new Error('Unable to render template with name "' + templateName + '". Exception: ' + e), e);
            }
        },
        
        /**
         * Renders a template and captures the output as a String
         * 
         * @param templateName {String}The name of the template to render. NOTE: The template must have already been loaded.
         * @param data {Object} The data object to provide to the template rendering function
         * @param context {raptor/templating/Context} The context object to use (optional). If a context is provided then the writer will be 
         *                                     temporarily swapped with a StringBuilder to capture the output of rendering. If a context 
         *                                     is not provided then one will be created using the "createContext" method.
         * @returns {String} The string output of the template
         */
        renderToString: function(templateName, data, context) {
            var sb = new StringBuilder(); //Create a StringBuilder object to serve as a buffer for the output

            
            if (context === undefined) {
                /*
                 * If a context object is not provided then we need to create a new context object and use the StringBuilder as the writer
                 */
                this.render(templateName, data, new Context(sb));
            }
            else {
                var _this = this;
                /*
                 * If a context is provided then we need to temporarily swap out the writer for the StringBuilder
                 */
                context.swapWriter(sb, function() {
                    _this.render(templateName, data, context);
                }); //Swap in the writer, render the template and then restore the original writer
            }
            
            return sb.toString(); //Return the final string associated with the StringBuilder
        },
        
        /**
         * Unloads a template so that it can be reloaded.
         * 
         * @param templateName
         */
        unload: function(templateName) {
            delete loadedTemplates[templateName];
        },
        
        /**
         * Helper function to return a helper function
         * 
         * @function
         * @param uri
         * @param name
         * @returns {Function} The corresponding helper function. An exception is thrown if the helper function is not found
         */
        getFunction: _getFunction,
        
        /**
         * Creates a new context object that can be used as the context for
         * template rendering.
         * 
         * @param writer {Object} An object that supports a "write" and a "toString" method.
         * @returns {templating$Context} The newly created context object
         */
        createContext: renderContext.createContext,
        
        getHandler: _getHandler,
        
        /**
         * Helper functions (with short names for minification reasons)
         */
        helpers: helpers
    };
    
    return templating;
    
});

define.Class(
    'raptor/templating/taglibs/widgets/WidgetTag',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var widgets = require('raptor/widgets');
        
        return {
            render: function(input, context) {
                var type = input.jsClass,
                    config = input.config || input._cfg,
                    widgetArgs = context.getAttributes().widgetArgs,
                    id = input.id,
                    scope,
                    assignedId,
                    events;
                
                if (!id && input.hasOwnProperty('id')) {
                    throw raptor.createError('Invalid widget ID for "' + type + '"');
                }
                
                if (widgetArgs) {
                    delete context.getAttributes().widgetArgs;
                    scope = widgetArgs.scope;
                    assignedId = widgetArgs.id;
                    events = widgetArgs.events;
                }
                
                var widgetsContext = widgets.getWidgetsContext(context);
                
                widgetsContext.beginWidget({
                        type: type,
                        id: id,
                        assignedId: assignedId,
                        config: config,
                        scope: scope,
                        events: events
                    }, function(widgetDef) {
                        input.invokeBody(widgetDef);
                    });
            }
        };
    });
define(
    'raptor/templating/taglibs/widgets/WidgetFunctions',
    function(require) {
        "use strict";
        
        var widgets = require('raptor/widgets');
        
        return {
            widgetArgs: function(assignedId, scope, events) {
                this.getAttributes().widgetArgs = {
                    id: assignedId,
                    scope: scope,
                    events: events
                };
            }
        };
    });
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

define('raptor/listeners', ['raptor'], function(raptor, require) {
    "use strict";
    
    var forEachEntry = raptor.forEachEntry,
        isArray = Array.isArray,
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
        _cleanupListeners = function(listeners) {
            var newListeners = [],
                thisObj;
            
            listeners._listeners.forEach(function(curListener) {
                
                if (curListener.removed) {
                    if ((thisObj = curListener.thisObj)) {
                        delete thisObj[handlesPropName][curListener.id];
                    }        
                } else {
                    newListeners.push(curListener);
                }
            });
            
            listeners._listeners = newListeners;
            
            if (!listeners._listeners.length) {
                listeners._onEmpty();
            }
            
        },
        _removeListener = function(listeners, listener) {
            listener.removed = true;
            _cleanupListeners(listeners);
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
     * @name raptor/listeners/Message
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
     * @name raptor/listeners/Listeners
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
         * @returns {raptor/listeners/ListenerHandle} A listener handle
         */
        add: function(callback, thisObj, autoRemove) {
            var _this = this,
                removeFunc,
                listener = {
                    callback: callback,
                    thisObj: thisObj,
                    removed: false,
                    autoRemove: autoRemove,
                    id: nextHandleId++
                },
                handles;
            
            removeFunc = listener.remove = _createRemoveListenerFunc(_this, listener);
            
            _this._listeners.push(listener);
                        
            /**
             * @name raptor/listeners/ListenerHandle
             * @anonymous
             * @class
             */
            var handle = {
                /**
                 * @returns {void}
                 */
                remove: removeFunc
                
                /**
                 * Removes the added listener
                 * 
                 * @function
                 * @memberOf raptor/listeners/ListenerHandle.prototype
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
            
            _this._listeners.forEach(function(listener) {
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
        },

        removeAll: function() {
            var listeners = this._listeners;
            for (var i = 0; i < listeners.length; i++) {
                // flag listener for removal
                listeners[i].removed = true;
            }
            // remove all of the listeners that have been flagged for removal
            _cleanupListeners(this);
        }
    };
    
    var checkMessage = function(messageName, observable) {
        var allowedMessages = observable._allowed;
        if (allowedMessages && !allowedMessages[messageName]) {
            throw new Error('Invalid message name of "' + messageName + '". Allowed messages: ' + Object.keys(allowedMessages).join(', '));
        }
        
    };
    
    
    var _createMessageFunc = function(name) {
        return function(props) {
            var args = [name].concat(Array.prototype.slice.call(arguments));
            this[typeof props == 'function' ? 'subscribe' : 'publish'].apply(this, args);
        };
    };
    
    /**
     * @class
     * @anonymous
     * @name raptor/listeners/Observable
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
         * @returns {raptor/listeners/ObservableListenerHandle} A handle to remove the added listeners or select listeners
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
                 * @name raptor/listeners/ObservableListenerHandle
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
                     * @memberOf raptor/listeners/ObservableListenerHandle.prototype
                     * 
                     * @param type
                     * @returns
                     * 
                     * @deprecated
                     */
                    
                    /**
                     * @function
                     * @name removeAll
                     * @memberOf raptor/listeners/ObservableListenerHandle.prototype
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

        unsubscribeAll : function() {
            var _this = this;

            forEachEntry(_this._byName, function(name, listeners) {
                listeners.removeAll();
            });

            _this._byName = {};
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
         * @param name {String|raptor/listeners/Message} The message name or a Message object that has the message name and args as properties.
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

    return (listeners = {
        /**
         * @type raptor/listeners/Message
         * 
         */
        Message: Message,
        
        /**
         * Creates a new listener list and returns it.
         * 
         * @returns {raptor/listeners/Listeners} The newly created {@link raptor/listeners/Listeners} object.
         */
        createListeners: function() {
            return new Listeners();
        },
        
        /**
         * Creates a new observable object and returns it.
         * 
         * @param allowedMessages {Array<String>} An array of messages that are allowed (more can be added later using {@Link .registerMessages}). Optional
         * 
         * @returns {raptor/listeners/Observable} The newly created {@link raptor/listeners/Observable} object.
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
         * Makes an existing object/class observable by extending the target with the required methods and properties from the {@link raptor/listeners/Observable} class.
         * <ul>
         * <li>{@link raptor/listeners/Observable#subscribe}</li>
         * <li>{@link raptor/listeners/Observable#publish}</li>
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
         * @returns {raptor/listeners/Message}
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
 * <js>var pubsub = require('raptor/pubsub');
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
 * <js>var pubsub = require('raptor/pubsub');
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
 * <js>var pubsub = require('raptor/pubsub');
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
define('raptor/pubsub', function(require, exports, module) {
    "use strict";
    
    var listeners = require('raptor/listeners');

    /**
     * The Message class allows additional information to be provided to subscribers.
     * 
     * @class
     * @anonymous
     * @name raptor/pubsub/Message
     * @augments raptor/listeners/Message
     * 
     * @param topic {String} The topic name of the message
     * @param props {Object} An object with properties that should be applied to the newly created message 
     */
    
    var Message = define.Class({
            superclass: listeners.Message
        },
        function() {
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
            
            return Message;
        });
    
    /**
     * @class
     * @anonymous
     */
    var Channel = define.Class(function() {

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
             * var pubsub = require('raptor/pubsub');
             * var channel = pubsub.channel('myChannel');
             * 
             * channel.publish('myTopic', {
             *     hello: "Hello",
             *     world: "World"
             * });
             * 
             * </js>
             * 
             * @param topic {String|raptor/pubsub/Message} The topic name or the Message object that should be published 
             * @param data {Object} The data object to associate with the published message (optional)
             * 
             * 
             */
            publish: function(topic, data)  {
                
                var message;
                
                //Convert the arguments into a Message object if necessary so that we can associate extra information with the message being published
                if (listeners.isMessage(topic)) {
                    message = topic;
                }
                else {
                    message = require('raptor/pubsub').createMessage(topic, data);
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
             * <js>var pubsub = require('raptor/pubsub');
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
             * @returns {raptor/listeners/ObservableListenerHandle} A handle to remove the subscriber(s)
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
         * @returns {raptor/pubsub/Channel} The messaging channel with the specified name.
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
         * @returns {raptor/pubsub/Channel} The "global channel
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
         * var pubsub = require('raptor/pubsub');
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
         * @param topic {String|raptor/pubsub/Message} The topic name or the Message object that should be published 
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
         * <js>var pubsub = require('raptor/pubsub');
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
         * @returns {raptor/listeners/ObservableListenerHandle} A handle to remove the subscriber(s)
         * 
         * @see {@link raptor/pubsub/Channel#subscribe}
         */
        subscribe: function(topic, callback, thisObj) {
            var global = this.global();
            return global.subscribe.apply(global, arguments);
        },
        
        /**
         * Returns a new {@Link raptor/pubsub/Message} object with the provided topic and properties applied.
         * 
         * @param topic {String} The topic name
         * @param props {Object} Properties to apply to the newly created Message object (optional)
         * @returns {raptor/pubsub/Message} The newly created Message object.
         */
        createMessage: function(topic, data) {
            return new Message(topic, data);
        }
    };
});
define('raptor/dom', function(require) {
    "use strict";

    return {
        forEachChildEl: function(node, callback, scope)
        {
            this.forEachChild(node, callback, scope, 1);
        },

        /**
         * 
         */
        forEachChild: function(node, callback, scope, nodeType)
        {
            if (!node) {
                return;
            }

            var i=0, 
                childNodes = node.childNodes,
                len = childNodes.length;

            for (; i<len; i++)
            {
                var childNode = childNodes[i];
                if (childNode && (nodeType == null || nodeType == childNode.nodeType))
                {
                    callback.call(scope, childNode);
                }
            }
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
define('raptor/component-renderer/RenderResult', function(require) {
    "use strict";

    var getEl = function(el) {
        if (typeof el === 'string') {
            var elId = el;
            el = document.getElementById(elId);
            if (!el) {
                throw raptor.createError(new Error('Target element not found: "' + elId + '"'));
            }
        }
        return el;
    };

    var RenderResult = function(html, context) {
        this.html = html;
        this.context = context;
        this._node = null;
    };

    RenderResult.prototype = {
            
        getWidget : function() {
            if (!this.widgetDefs) {
                throw new Error('Cannot call getWidget() until after HTML fragment is added to DOM.');
            }
            return this.widgetDefs.length ? this.widgetDefs[0].widget : undefined;
        },
        
        /**
         * Invoked after the rendered document fragment is inserted into the DOM.
         * 
         * @return  {void}
         * @private
         */
        _afterInsert: function() {
            
            var widgets = require.find('raptor/widgets');
            if (widgets) {
                var widgetsContext = widgets.getWidgetsContext(this.context);
                this.widgetDefs = widgetsContext.widgets;
            }
            
            var pubsub = require.find('raptor/pubsub');
            if (pubsub) {
                pubsub.publish('raptor/component-renderer/renderedToDOM', { 
                    node: this.getNode(),
                    context: this.context
                }); // NOTE: This will trigger widgets to be initialized if there were any    
            }
            
            return this;
        },
        
        _beforeRemove: function(targetEl) {
            var pubsub = require.find('raptor/pubsub');
            if (pubsub) {
                pubsub.publish('dom/beforeRemove', { // NOTE: Give other modules a chance to gracefully cleanup after removing the old node
                    el: targetEl
                }); 
            }
        },

        /**
         * Appends the rendered document fragment as a child of the target element.
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        appendTo: function(targetEl) {
            getEl(targetEl).appendChild(this.getNode());
            return this._afterInsert();
        },

        /**
         * Replaces the target element with the rendered document fragment.
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        replace: function(targetEl) {
            targetEl = getEl(targetEl);

            this._beforeRemove(targetEl);
            targetEl.parentNode.replaceChild(this.getNode(), targetEl);
            return this._afterInsert();
        },
        
        /**
         * Replaces the children of target element with the rendered document fragment.
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        replaceChildrenOf: function(targetEl) {
            targetEl = getEl(targetEl);
            var pubsub = require.find('raptor/pubsub');
            if (pubsub) {
                require('raptor/dom').forEachChildEl(targetEl, function(childEl) {
                    this._beforeRemove(childEl); 
                }, this);
            }
            targetEl.innerHTML = "";
            targetEl.appendChild(this.getNode());
            return this._afterInsert();
        },

        /**
         * Inserts the rendered document fragment before the target element (as a sibling).
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        insertBefore: function(targetEl) {
            targetEl = getEl(targetEl);            
            targetEl.parentNode.insertBefore(this.getNode(), targetEl);
            return this._afterInsert();
        }, 

        /**
         * Inserts the rendered document fragment after the target element (as a sibling).
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        insertAfter: function(targetEl) {
            targetEl = getEl(targetEl);
            var nextSibling = targetEl.nextSibling,
                parentNode = targetEl.parentNode;

            if (nextSibling) {
                targetEl.parentNode.insertBefore(this.getNode(), nextSibling);
            }
            else {
                targetEl.parentNode.appendChild(this.getNode());
            }
            return this._afterInsert();
        }, 


        /**
         * Prepends the rendered document fragment as a child of the target element.
         * 
         * @param  {DOMElement|String} targetEl The target element
         * @return {void}
         */
        prependTo: function(targetEl) {
            targetEl = getEl(targetEl);
            targetEl.insertBefore(this.getNode(), targetEl.firstChild || null);
            return this._afterInsert();
        },

        /**
         * Returns the DOM node for the rendered HTML. If the rendered HTML resulted
         * in multiple top-level DOM nodes then the top-level DOM nodes are wrapped
         * in a single DocumentFragment node.
         * 
         * @return {Node|DocumentFragment} The DOM node that can be used to insert the rendered HTML into the DOM.
         */
        getNode: function() {
            var node = this._node,
                curEl,
                newBodyEl;

            if (!node) {
                
                newBodyEl = document.createElement('body');

                newBodyEl.innerHTML = this.html;

                if (newBodyEl.childNodes.length == 1) { // If the rendered component resulted in a single node then just use that node
                    node = newBodyEl.childNodes[0];
                }
                else { // Otherwise, wrap the nodes in a document fragment node
                    node = document.createDocumentFragment();

                    while((curEl=newBodyEl.firstChild)) {
                        node.appendChild(curEl);
                    }
                }
                

                this._node = node;
            }

            return node;
        }
    };

    return RenderResult;
});
define(
    'raptor/component-renderer',
    ['raptor'],
    function(raptor, require) {
        "use strict";

        var renderContext = require('raptor/render-context'),
            RenderResult = require('raptor/component-renderer/RenderResult');


        

        return {
            /**
             * <p>Renders a component to HTML and provides functions to allow the resulting HTML to be injected into
             * the DOM.
             * 
             * <p>
             * Usage:
             * <js>
             * var renderer = require('raptor/component-renderer');
             * renderer.render('ui/buttons/Button', {label: "Hello World"}).appendChild('myContainer');
             * </js>
             *
             * <p>
             * See {@link raptor/component-renderer/RenderResult} for supporting DOM insertion methods (including appendChild, prependChild, insertBefore, insertAfter and replace).
             * 
             * @param  {String} renderer The class/module name for the renderer (resulting object must have a "render" method or a "process" method)
             * @param  {Object} data The input data for the renderer
             * @param  {raptor/render-context/Context} context The context to use for rendering the component (optional, a new render context is created if not provided)
             * 
             * @return {raptor/component-renderer/RenderResult}   Returns the resulting of rendering the component
             */
            render: function(renderer, data, context) {
                if (typeof renderer === 'string') {
                    var rendererObj = raptor.find(renderer);


                    if (!rendererObj) {
                        if (!renderer.endsWith('Renderer')) { //We'll try one naming convention for resolving a renderer name...
                            // Try converting component IDs to renderer names (e.g. 'ui/buttons/Button' --> 'ui/buttons/Button/ButtonRenderer')
                            var lastSlash = renderer.lastIndexOf('/');
                            rendererObj = raptor.find(renderer + '/' + renderer.substring(lastSlash+1) + 'Renderer');    
                        }
                        
                        if (!rendererObj) {
                            throw raptor.createError(new Error('Renderer not found with name "' + renderer + '"'));
                        }
                    }

                    renderer = rendererObj;
                }
                
                var renderFunc = renderer.render || renderer.process || renderer;
                    
                if (typeof renderFunc !== 'function') {
                    throw raptor.createError(new Error('Not a valid renderer: "' + renderer + '". Renderer must be an object with "render" or "process" function or renderer must be a function.'));
                }

                var html,
                    doRender = function() {
                        renderFunc.call(renderer, data || {}, context);
                    };

                if (context) {
                    html = context.captureString(doRender);
                }
                else {
                    context = renderContext.createContext();
                    doRender();
                    html = context.getOutput();
                }

                return new RenderResult(html, context);
            }
        };
    });
/* ===================================================
 * bootstrap-transition.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */

  $(function () {

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);/* ==========================================================
 * bootstrap-alert.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* ALERT CLASS DEFINITION
  * ====================== */

  var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).on('click', dismiss, this.close)
      }

  Alert.prototype.close = function (e) {
    var $this = $(this)
      , selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)

    e && e.preventDefault()

    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

    $parent.trigger(e = $.Event('close'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent
        .trigger('closed')
        .remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent.on($.support.transition.end, removeElement) :
      removeElement()
  }


 /* ALERT PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('alert')
      if (!data) $this.data('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


 /* ALERT NO CONFLICT
  * ================= */

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


 /* ALERT DATA-API
  * ============== */

  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);/* ============================================================
 * bootstrap-button.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */

  var Button = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.button.defaults, options)
  }

  Button.prototype.setState = function (state) {
    var d = 'disabled'
      , $el = this.$element
      , data = $el.data()
      , val = $el.is('input') ? 'val' : 'html'

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d)
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
  }


 /* BUTTON PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('button')
        , options = typeof option == 'object' && option
      if (!data) $this.data('button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.defaults = {
    loadingText: 'loading...'
  }

  $.fn.button.Constructor = Button


 /* BUTTON NO CONFLICT
  * ================== */

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


 /* BUTTON DATA-API
  * =============== */

  $(document).on('click.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
  })

}(window.jQuery);/* ==========================================================
 * bootstrap-carousel.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.options = options
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
      return this
    }

  , to: function (pos) {
      var $active = this.$element.find('.item.active')
        , children = $active.parent().children()
        , activePos = children.index($active)
        , that = this

      if (pos > (children.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos)
        })
      }

      if (activePos == pos) {
        return this.pause().cycle()
      }

      return this.slide(pos > activePos ? 'next' : 'prev', $(children[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end)
        this.cycle()
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slide('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slide('prev')
    }

  , slide: function (type, next) {
      var $active = this.$element.find('.item.active')
        , $next = next || $active[type]()
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? 'first' : 'last'
        , that = this
        , e

      this.sliding = true

      isCycling && this.pause()

      $next = $next.length ? $next : this.$element.find('.item')[fallback]()

      e = $.Event('slide', {
        relatedTarget: $next[0]
      })

      if ($next.hasClass('active')) return

      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next[0].offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
      } else {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.sliding = false
        this.$element.trigger('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('carousel')
        , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        , action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.cycle()
    })
  }

  $.fn.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  $.fn.carousel.Constructor = Carousel


 /* CAROUSEL NO CONFLICT
  * ==================== */

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }

 /* CAROUSEL DATA-API
  * ================= */

  $(document).on('click.carousel.data-api', '[data-slide]', function (e) {
    var $this = $(this), href
      , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      , options = $.extend({}, $target.data(), $this.data())
    $target.carousel(options)
    e.preventDefault()
  })

}(window.jQuery);/* =============================================================
 * bootstrap-collapse.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSE PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSE NO CONFLICT
  * ==================== */

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


 /* COLLAPSE DATA-API
  * ================= */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);/* ============================================================
 * bootstrap-dropdown.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) return $this.click()

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      getParent($(this)).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)
    $parent.length || ($parent = $this.parent())

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api touchstart.dropdown.data-api', clearMenus)
    .on('click.dropdown touchstart.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('touchstart.dropdown.data-api', '.dropdown-menu', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api touchstart.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api touchstart.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);/* =========================================================
 * bootstrap-modal.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function ($) {

  "use strict"; // jshint ;_;


 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function (element, options) {
    this.options = options
    this.$element = $(element)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element
            .show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }

    , hide: function (e) {
        e && e.preventDefault()

        var that = this

        e = $.Event('hide')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()

        $(document).off('focusin.modal')

        this.$element
          .removeClass('in')
          .attr('aria-hidden', true)

        $.support.transition && this.$element.hasClass('fade') ?
          this.hideWithTransition() :
          this.hideModal()
      }

    , enforceFocus: function () {
        var that = this
        $(document).on('focusin.modal', function (e) {
          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
            that.$element.focus()
          }
        })
      }

    , escape: function () {
        var that = this
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keyup.dismiss.modal', function ( e ) {
            e.which == 27 && that.hide()
          })
        } else if (!this.isShown) {
          this.$element.off('keyup.dismiss.modal')
        }
      }

    , hideWithTransition: function () {
        var that = this
          , timeout = setTimeout(function () {
              that.$element.off($.support.transition.end)
              that.hideModal()
            }, 500)

        this.$element.one($.support.transition.end, function () {
          clearTimeout(timeout)
          that.hideModal()
        })
      }

    , hideModal: function (that) {
        this.$element
          .hide()
          .trigger('hidden')

        this.backdrop()
      }

    , removeBackdrop: function () {
        this.$backdrop.remove()
        this.$backdrop = null
      }

    , backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
            this.removeBackdrop()

        } else if (callback) {
          callback()
        }
      }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.modal

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL NO CONFLICT
  * ================= */

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


 /* MODAL DATA-API
  * ============== */

  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
      , href = $this.attr('href')
      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.focus()
      })
  })

}(window.jQuery);
/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (this.options.trigger != 'manual') {
        eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })
          .insertAfter(this.$element)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .offset(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)
      self[self.tip().hasClass('in') ? 'hide' : 'show']()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  , html: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);/* ===========================================================
 * bootstrap-popover.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = $e.attr('data-content')
        || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"></div></div></div>'
  })


 /* POPOVER NO CONFLICT
  * =================== */

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);/* =============================================================
 * bootstrap-scrollspy.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* SCROLLSPY CLASS DEFINITION
  * ========================== */

  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this)
      , $element = $(element).is('body') ? $(window) : $(element)
      , href
    this.options = $.extend({}, $.fn.scrollspy.defaults, options)
    this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process)
    this.selector = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.$body = $('body')
    this.refresh()
    this.process()
  }

  ScrollSpy.prototype = {

      constructor: ScrollSpy

    , refresh: function () {
        var self = this
          , $targets

        this.offsets = $([])
        this.targets = $([])

        $targets = this.$body
          .find(this.selector)
          .map(function () {
            var $el = $(this)
              , href = $el.data('target') || $el.attr('href')
              , $href = /^#\w/.test(href) && $(href)
            return ( $href
              && $href.length
              && [[ $href.position().top + self.$scrollElement.scrollTop(), href ]] ) || null
          })
          .sort(function (a, b) { return a[0] - b[0] })
          .each(function () {
            self.offsets.push(this[0])
            self.targets.push(this[1])
          })
      }

    , process: function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
          , maxScroll = scrollHeight - this.$scrollElement.height()
          , offsets = this.offsets
          , targets = this.targets
          , activeTarget = this.activeTarget
          , i

        if (scrollTop >= maxScroll) {
          return activeTarget != (i = targets.last()[0])
            && this.activate ( i )
        }

        for (i = offsets.length; i--;) {
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
            && this.activate( targets[i] )
        }
      }

    , activate: function (target) {
        var active
          , selector

        this.activeTarget = target

        $(this.selector)
          .parent('.active')
          .removeClass('active')

        selector = this.selector
          + '[data-target="' + target + '"],'
          + this.selector + '[href="' + target + '"]'

        active = $(selector)
          .parent('li')
          .addClass('active')

        if (active.parent('.dropdown-menu').length)  {
          active = active.closest('li.dropdown').addClass('active')
        }

        active.trigger('activate')
      }

  }


 /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('scrollspy')
        , options = typeof option == 'object' && option
      if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy

  $.fn.scrollspy.defaults = {
    offset: 10
  }


 /* SCROLLSPY NO CONFLICT
  * ===================== */

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


 /* SCROLLSPY DATA-API
  * ================== */

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);/* ========================================================
 * bootstrap-tab.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TAB CLASS DEFINITION
  * ==================== */

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype = {

    constructor: Tab

  , show: function () {
      var $this = this.element
        , $ul = $this.closest('ul:not(.dropdown-menu)')
        , selector = $this.attr('data-target')
        , previous
        , $target
        , e

      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      if ( $this.parent('li').hasClass('active') ) return

      previous = $ul.find('.active:last a')[0]

      e = $.Event('show', {
        relatedTarget: previous
      })

      $this.trigger(e)

      if (e.isDefaultPrevented()) return

      $target = $(selector)

      this.activate($this.parent('li'), $ul)
      this.activate($target, $target.parent(), function () {
        $this.trigger({
          type: 'shown'
        , relatedTarget: previous
        })
      })
    }

  , activate: function ( element, container, callback) {
      var $active = container.find('> .active')
        , transition = callback
            && $.support.transition
            && $active.hasClass('fade')

      function next() {
        $active
          .removeClass('active')
          .find('> .dropdown-menu > .active')
          .removeClass('active')

        element.addClass('active')

        if (transition) {
          element[0].offsetWidth // reflow for transition
          element.addClass('in')
        } else {
          element.removeClass('fade')
        }

        if ( element.parent('.dropdown-menu') ) {
          element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
      }

      transition ?
        $active.one($.support.transition.end, next) :
        next()

      $active.removeClass('in')
    }
  }


 /* TAB PLUGIN DEFINITION
  * ===================== */

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
      if (!data) $this.data('tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


 /* TAB NO CONFLICT
  * =============== */

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


 /* TAB DATA-API
  * ============ */

  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);/* =============================================================
 * bootstrap-typeahead.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.source = this.options.source
    this.$menu = $(this.options.menu)
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height
        , left: pos.left
        })
        .show()

      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , blur: function (e) {
      var that = this
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old
    return this
  }


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    e.preventDefault()
    $this.typeahead($this.data())
  })

}(window.jQuery);
/* ==========================================================
 * bootstrap-affix.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#affix
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* AFFIX CLASS DEFINITION
  * ====================== */

  var Affix = function (element, options) {
    this.options = $.extend({}, $.fn.affix.defaults, options)
    this.$window = $(window)
      .on('scroll.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.affix.data-api',  $.proxy(function () { setTimeout($.proxy(this.checkPosition, this), 1) }, this))
    this.$element = $(element)
    this.checkPosition()
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
      , scrollTop = this.$window.scrollTop()
      , position = this.$element.offset()
      , offset = this.options.offset
      , offsetBottom = offset.bottom
      , offsetTop = offset.top
      , reset = 'affix affix-top affix-bottom'
      , affix

    if (typeof offset != 'object') offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function') offsetTop = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ?
      false    : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ?
      'bottom' : offsetTop != null && scrollTop <= offsetTop ?
      'top'    : false

    if (this.affixed === affix) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''))
  }


 /* AFFIX PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('affix')
        , options = typeof option == 'object' && option
      if (!data) $this.data('affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix

  $.fn.affix.defaults = {
    offset: 0
  }


 /* AFFIX NO CONFLICT
  * ================= */

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


 /* AFFIX DATA-API
  * ============== */

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
        , data = $spy.data()

      data.offset = data.offset || {}

      data.offsetBottom && (data.offset.bottom = data.offsetBottom)
      data.offsetTop && (data.offset.top = data.offsetTop)

      $spy.affix(data)
    })
  })


}(window.jQuery);
define(
    "ui/buttons/Button/ButtonWidget",
    ['raptor'],
    function(raptor, require) {
        var ButtonWidget = function(config) {
            var _this = this;
            
            
            
            this.toggled = false;
            this.$button = this.$();
            this._toggle = config.toggle;
            
            if (config.toggled) {
                this.toggle();
            }
            
            
            this.$().click(function() {
                _this.publish('click', {
                    button: this
                });
                
                if (_this._toggle) {
                    _this.toggle();
                }
            });
        };
        
        ButtonWidget.events = ["click", "toggle"];
        
        
        ButtonWidget.prototype = {
            toggle: function() {
                this.toggled = !this.toggled;
                this.$button.button('toggle');
                this.publish('toggle', {
                    button: this
                });
            }
        };
        
        return ButtonWidget;
    });
define(
    "ui/buttons/Button/ButtonRenderer",
    ['raptor'],
    function(raptor, require) {
        return {
            render: function(input, context) {
                
                var rootAttrs = {};
                
                var classParts = ["btn"];
                
                if (input.variant) {                    
                    classParts.push("btn-" + input.variant);
                }
                
                if (input.size) {                    
                    classParts.push("btn-" + input.size);
                }
                
                
                
                if (input.dynamicAttributes) {
                    if (input.dynamicAttributes.href) {

                    }
                    var className = input.dynamicAttributes["class"];
                    if (className) {
                        delete input.dynamicAttributes["class"];
                        classParts.push(className);
                    }
                    raptor.extend(rootAttrs, input.dynamicAttributes);
                }
                
                rootAttrs["class"] = classParts.join(" ");
                
                var widgetConfig = {};
                
                if (input.toggle) {
                    widgetConfig.toggle = true;
                }
                
                if (input.toggled) {
                    widgetConfig.toggled = true;
                }

                require('raptor/templating').render('ui/buttons/Button', {
                    id: input.id || ('btn' + context.uniqueId()),
                    tag: input, 
                    label: input.label,
                    rootAttrs: rootAttrs,
                    widgetConfig: widgetConfig,
                    isDropdown: input.dropdown === true,
                    href: input.href
                }, context);
            }
        };
    });
$rset("rhtml", "ui/buttons/Button", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      escapeXml = helpers.x,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag");

  return function(data, context) {
    var id = data.id,
        tag = data.tag,
        rootAttrs = data.rootAttrs,
        label = data.label,
        href = data.href;

    function body() {
      return context.c(function() {
        if (label) {
          context.w(escapeXml(label));
        }
        else if (tag.invokeBody) {
          context.w(tag.invokeBody());
        }

        if (data.isDropdown) {
          context.w('&nbsp; <span class="caret"></span>');
        }
      });
    }

    if (href) {
      context.t(
        raptor_templating_taglibs_widgets_WidgetTag,
        {
          "jsClass": "ui/buttons/Button/ButtonWidget",
          "config": undefined,
          "id": id,
          "_cfg": data.widgetConfig
        },
        function(widget) {
          context.w('<a')
            .a("id", id)
            .a("href", href)
            .a(rootAttrs)
            .w('>')
            .w(body())
            .w('</a>');
        });
    }
    else {
      context.t(
        raptor_templating_taglibs_widgets_WidgetTag,
        {
          "jsClass": "ui/buttons/Button/ButtonWidget",
          "config": undefined,
          "id": id,
          "_cfg": data.widgetConfig
        },
        function(widget) {
          context.w('<button')
            .a("id", id)
            .a(rootAttrs)
            .w('>')
            .w(body())
            .w('</button>');
        });
    }
  }
});
define(
    "ui/containers/Tabs/TabsWidget",
    function(require) {
        var TabsWidget = function(config) {
            
        };
        
        TabsWidget.events = ["show", "shown"];
        
        
        TabsWidget.prototype = {

        };
        
        return TabsWidget;
    });
define(
    'ui/containers/Tabs/TabsRenderer',
    function(require) {
        var templating = require('raptor/templating');
        
        return {
            render: function(input, context) {
                var tabs = input.tabs,  
                    activeFound = false,
                    id = input.id || ("tabs" + context.uniqueId());
                
                if (!tabs) {
                    tabs = [];
                    //Discover nested tabs if not provided as part of input
                    input.invokeBody({
                        addTab: function(tab) {
                            tabs.push(tab);
                        }
                    });
                }

                tabs.forEach(function(tab, i) {
                    if (tab.active) {
                        activeFound = true;
                    }
                    
                    if (!tab.id) {
                        tab.id = id + "-tab" + i;
                    }
                });
    
                
                if (!activeFound && tabs.length) {
                    tabs[0].active = true;
                }
                
                
                templating.render("ui/containers/Tabs", {
                    id: id,
                    tabs: tabs
                }, context);
                
            }
        };
    });
define(
    'ui/containers/Tabs/TabTag',
    function(require) {
        
        return {
            render: function(input, context) {
                 input._tabs.addTab(input);
            }
        };
    });
$rset("rhtml", "ui/containers/Tabs", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      forEach = helpers.f,
      escapeXmlAttr = helpers.xa,
      escapeXml = helpers.x;

  return function(data, context) {
    var id = data.id,
        tabs = data.tabs;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/containers/Tabs/TabsWidget",
        "config": undefined,
        "id": id,
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<div')
          .a("id", id)
          .w(' class="tabs"><ul class="nav nav-tabs">');

        forEach(tabs, function(tab) {
          context.w('<li')
            .a("class", (tab.active ? "active" : ''))
            .w('><a href="#')
            .w(escapeXmlAttr(tab.id))
            .w('" data-toggle="tab">')
            .w(escapeXml(tab.title))
            .w('</a></li>');
        });

        context.w('</ul><div class="tab-content">');

        forEach(tabs, function(tab) {
          context.w('<div')
            .a("id", tab.id)
            .w(' class="tab-pane')
            .w(escapeXmlAttr((tab.active ? " active" : '')))
            .w('">');

          if (tab.content) {
            context.w(escapeXml(tab.content));
          }
          else {
            tab.invokeBody();

          }

          context.w('</div>');
        });

        context.w('</div></div>');
      });
  }
});
define(
    "ui/demo/ComponentsDemo/ComponentsDemoWidget",
    function(require) {
        var pubsub = require('raptor/pubsub'),
            templating = require('raptor/templating'),
            componentRenderer = require('raptor/component-renderer');

        var ComponentsDemoWidget = function(config) {
            var _this = this;

            var buttonRenderCount = 0,
                tabsRenderCount = 0;

            pubsub.subscribe({
                'sayHello': function(eventArgs) {
                    var message = eventArgs.message;
                    alert(message);
                },

                'renderNewButton': function(eventArgs) {
                    componentRenderer
                        .render('ui/buttons/Button/ButtonRenderer', {
                            variant: 'success', 
                            label: "New Button " + (++buttonRenderCount)
                        })
                        .appendTo(this.getEl('renderTarget'));
                },

                'renderNewTabs': function() {
                    componentRenderer
                        .render('ui/containers/Tabs/TabsRenderer', {
                            tabs: [
                                {
                                    title: "Tab 1",
                                    content: "Content for Tab 1"
                                },
                                {
                                    title: "Tab 2",
                                    content: "Content for Tab 2"
                                }
                            ]
                        })
                        .appendTo(this.getEl('renderTarget'));
                },

                'renderTemplate': function() {
                    componentRenderer
                        .render(function(input, context) {
                            templating.render("ui/demo/ComponentsDemo/test-template", 
                                {}, 
                                context);
                        })
                        .appendTo(this.getEl('renderTarget'));
                }
            }, this);

            this.widgets.submitButton.on('click', function() {
                alert('You clicked the "Submit" button');
            });

            this.widgets.deleteButton.on('click', function() {
                alert('You clicked the "Delete" button');
            });

            
        };

        ComponentsDemoWidget.widgets = {

        }
        
        ComponentsDemoWidget.prototype = {
        };
        
        return ComponentsDemoWidget;
    });
$rset("rhtml", "ui/demo/ComponentsDemo/test-template", function(helpers) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      raptor_templating_taglibs_widgets_WidgetFunctions = "raptor/templating/taglibs/widgets/WidgetFunctions",
      getTagHandler = helpers.t,
      ui_buttons_Button_ButtonRenderer = getTagHandler("ui/buttons/Button/ButtonRenderer"),
      ui_containers_Tabs_TabsRenderer = getTagHandler("ui/containers/Tabs/TabsRenderer"),
      ui_containers_Tabs_TabTag = getTagHandler("ui/containers/Tabs/TabTag");

  return function(data, context) {
    var _widgetArgs = context.f(raptor_templating_taglibs_widgets_WidgetFunctions,"widgetArgs");

    context.w('<div class="test-template"><h2>Buttons from template</h2>')
      .t(
        ui_buttons_Button_ButtonRenderer,
        {
          "label": "Say 'Hello World'",
          "variant": "primary"
        },
        0,
        _widgetArgs(null, null, [["click","sayHello",{"message": 'Hello World'}]]))
      .t(
        ui_buttons_Button_ButtonRenderer,
        {
          "label": "Say 'Hello Universe'",
          "variant": "primary"
        },
        0,
        _widgetArgs(null, null, [["click","sayHello",{"message": 'Hello Universe'}]]))
      .w(' <h2>Tabs from template</h2>')
      .t(
        ui_containers_Tabs_TabsRenderer,
        {},
        function(_tabs) {
          context.t(
            ui_containers_Tabs_TabTag,
            {
              "title": "Home",
              "_tabs": _tabs
            },
            function() {
              context.w('Content for the Home tab');
            })
            .t(
              ui_containers_Tabs_TabTag,
              {
                "title": "Profile",
                "_tabs": _tabs
              },
              function() {
                context.w('Content for the Profile tab');
              });
        })
      .w('</div>');
  }
});