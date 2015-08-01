(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.threadify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
module.exports =  {

    serializeArgs: function (args) {
        var typedArray = [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
            "DataView"
        ];
        var serializedArgs = [];
        var transferable = [];

        for (var i = 0 ; i < args.length ; i++) {
            if (args[i] instanceof Error) {
                var obj = {
                    type: "Error",
                    value: {name: args[i].name}
                };
                var keys = Object.getOwnPropertyNames(args[i]);
                for (var k = 0 ; k < keys.length ; k++) {
                    obj.value[keys[k]] = args[i][keys[k]];
                }
                serializedArgs.push(obj);
            } else {
                var result = null;

                // TypedArray
                for (var t = 0 ; t < typedArray.length ; t++) {
                    if (args[i] instanceof global[typedArray[t]]) {
                        transferable.push(args[i].buffer);
                        result = {
                            type: "TypedArray",
                            arrayType: typedArray[t],
                            value: args[i].buffer
                        };
                        break;
                    }
                }

                // Other
                if (!result) {
                    if (args[i] instanceof ArrayBuffer) {
                        transferable.push(args[i]);
                    }
                    result = {
                        type: "arg",
                        value: args[i]
                    };
                }

                serializedArgs.push(result);
            }
        }

        return {
            args: serializedArgs,
            transferable: transferable
        };
    },

    unserializeArgs: function (serializedArgs) {
        var args = [];

        for (var i = 0 ; i < serializedArgs.length ; i++) {

            switch (serializedArgs[i].type) {
                case "arg":
                    args.push(serializedArgs[i].value);
                    break;
                case "TypedArray":
                    args.push(new global[serializedArgs[i].arrayType](serializedArgs[i].value));
                    break;
                case "Error":
                    var obj = new Error();
                    for (var key in serializedArgs[i].value) {
                        obj[key] = serializedArgs[i].value[key];
                    }
                    args.push(obj);
            }
        }

        return args;
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
var helpers = require("./helpers.js");

function Job(workerUrl, args) {

    var _this = this;
    var _worker = new Worker(workerUrl);

    var callbacks = {
        done: null,
        failed: null,
        terminated: null
    };

    var results = {
        done: null,
        failed: null,
        terminated: null
    };

    function _postMessage(name, args) {
        var serialized = helpers.serializeArgs(args || []);

        var data = {
            name: name,
            args: serialized.args
        };

        _worker.postMessage(data, serialized.transferable);
    }

    function _onMessage(event) {
        var data = event.data || {};
        var args = helpers.unserializeArgs(data.args || []);

        switch (data.name) {
            case "threadify-return":
                results.done = args;
                break;
            case "threadify-error":
                results.failed = args;
                break;
            case "threadify-terminated":
                results.terminated = [];
        }
        _callCallbacks();
    }

    function _onError(error) {
        results.failed = [error];
        _callCallbacks();
        terminate();
    }

    function _callCallbacks() {
        for (var cb in callbacks) {
            if (callbacks[cb] && results[cb]) {
                callbacks[cb].apply(_this, results[cb]);
                results[cb] = null;
            }
        }
    }

    function terminate() {
        _worker.terminate();
        results.terminated = [];
        _callCallbacks();
    }

    Object.defineProperty(this, "done", {
        get: function () {
            return callbacks.done;
        },
        set: function (fn) {
            callbacks.done = fn;
            _callCallbacks();
        },
        enumerable: true,
        configurable: false
    });

    Object.defineProperty(this, "failed", {
        get: function () {
            return callbacks.failed;
        },
        set: function (fn) {
            callbacks.failed = fn;
            _callCallbacks();
        },
        enumerable: true,
        configurable: false
    });

    Object.defineProperty(this, "terminated", {
        get: function () {
            return callbacks.terminated;
        },
        set: function (fn) {
            callbacks.terminated = fn;
            _callCallbacks();
        },
        enumerable: true,
        configurable: false
    });

    this.terminate = terminate;

    _worker.addEventListener("message", _onMessage.bind(this), false);
    _worker.addEventListener("error", _onError.bind(this), false);

    _postMessage("threadify-start", args);
}

module.exports = Job;

},{"./helpers.js":1}],3:[function(require,module,exports){
var helpers = require("./helpers.js");
var Job = require("./job.js");
var workerCode = require("./workercode.js");

function factory(workerFunction) {
    var workerBlob = new Blob(
        [
            "var global=this;(",
            workerCode.toString(),
            ")(",
            workerFunction.toString(),
            ",",
            helpers.serializeArgs.toString(),
            ",",
            helpers.unserializeArgs.toString(),
            ");"
        ],
        {
            type: "application/javascript"
        }
    );
    var workerUrl = URL.createObjectURL(workerBlob);

    return function () {
        var args = [];
        for (var i = 0 ; i < arguments.length ; i++) {
            args.push(arguments[i]);
        }
        return new Job(workerUrl, args);
    };
}

module.exports = factory;

},{"./helpers.js":1,"./job.js":2,"./workercode.js":4}],4:[function(require,module,exports){
(function (global){
//
// This file contains the code that will be injected inside the web worker
//

module.exports = function (workerFunction, serializeArgs, unserializeArgs) {

    var thread = {
        terminate: function () {
            _postMessage("threadify-terminated", []);
            global.close();
        },

        error: function () {
            _postMessage("threadify-error", arguments);
        },

        return: function () {
            _postMessage("threadify-return", arguments);
            thread.terminate();
        }
    };

    function _postMessage(name, args) {
        var serialized = serializeArgs(args || []);

        var data = {
            name: name,
            args: serialized.args
        };

        this.postMessage(data, serialized.transferable);
    }

    function _onMessage(event) {
        var data = event.data || {};
        var args = unserializeArgs(data.args || []);

        switch (data.name) {
            case "threadify-start":
                var result;
                try {
                    result = workerFunction.apply(thread, args);
                } catch (error) {
                    thread.error(error);
                    thread.terminate();
                }
                if (result !== undefined) {
                    _postMessage("threadify-return", [result]);
                    thread.terminate();
                }
        }
    }

    this.addEventListener("message", _onMessage, false);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[3])(3)
});