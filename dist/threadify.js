(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.threadify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Job(workerUrl, args) {

    var _this = this;

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

    function _postMessage(data) {
        // TODO add support of transferrable objects

        var transferrable = [];
        data = data || {};
        data.args = data.args || [];

        _this._worker.postMessage(data, transferrable);
    }

    function _onMessage(event) {
        var data = event.data || {};
        data.args = data.args || [];

        switch (data.messageType) {
            case "threadify-return":
                results.done = data.args;
                _callCallbacks();
                break;
            case "threadify-error":
                results.failed = data.args;
                _callCallbacks();
                break;
            case "threadify-terminated":
                results.terminated = [];
                _callCallbacks();
        }
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
        _this._worker.terminate();
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

    this._worker = new Worker(workerUrl);

    this._worker.addEventListener("message", _onMessage.bind(this), false);
    this._worker.addEventListener("error", _onError.bind(this), false);

    _postMessage({messageType: "threadify-start", args: args});
}

module.exports = Job;

},{}],2:[function(require,module,exports){
var Job = require("./job.js");
var workerCode = require("./workercode.js");

function factory(workerFunction) {
    var workerBlob = new Blob(
        [
            "(",
            workerCode.toString(),
            ")(",
            workerFunction.toString(),
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

},{"./job.js":1,"./workercode.js":3}],3:[function(require,module,exports){
//
// This file contains the code that will be injected inside the web worker
//

module.exports = function (workerFunction) {

    var _worker = this;

    var thread = {
        terminate: function () {
            _postMessage({
                messageType: "threadify-terminated",
                args: []
            });
            _worker.close();
        },

        error: function () {
            _postMessage({
                messageType: "threadify-error",
                args: _argumentsToList(arguments)
            });
        },

        return: function () {
            _postMessage({
                messageType: "threadify-return",
                args: _argumentsToList(arguments)
            });
            thread.terminate();
        }
    };

    function _argumentsToList(argObject) {
        var args = [];

        for (var i = 0 ; i < argObject.length ; i++) {
            args.push(argObject[i]);
        }

        return args;
    }

    function _postMessage(data) {
        // TODO add support of transferrable objects

        var transferrable = [];
        data = data || {};
        data.args = data.args || [];

        this.postMessage(data, transferrable);
    }

    function _onMessage(event) {
        var data = event.data || {};
        data.args = data.args || [];

        switch (data.messageType) {
            case "threadify-start":
                var result;
                try {
                    result = workerFunction.apply(thread, data.args);
                } catch (error) {
                    thread.error(error);
                    thread.terminate();
                }
                if (result !== undefined) {
                    _postMessage({
                        messageType: "threadify-return",
                        args: [result]
                    });
                    thread.terminate();
                }
        }
    }

    this.addEventListener("message", _onMessage, false);
};

},{}]},{},[2])(2)
});