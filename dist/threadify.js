(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.threadify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function _postMessage(worker, data) {
    // TODO add support of transferrable objects

    var transferrable = [];
    data = data || {};
    data.args = data.args || [];

    worker.postMessage(data, transferrable);
}

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

    function _onMessage(event) {
        var data = event.data || {};
        data.args = data.args || [];

        switch (data.messageType) {
            case "threadify-return":
                results.done = data.args;
                _callCallbacks();
                break;
            case "threadify-custom":
                //TODO
                break;
            case "threadify-error":
                //TODO
                break;
            case "threadify-console":
                //TODO
        }
    }

    function _callCallbacks() {
        for (var cb in callbacks) {
            if (callbacks[cb] && results[cb]) {
                callbacks[cb].apply(_this, results[cb]);
                results[cb] = null;
            }
        }
    }

    Object.defineProperty(this, "done", {
        get: function () {
            if (callbacks.done) {
                return callbacks.done;
            }
        },
        set: function (fn) {
            callbacks.done = fn;
            _callCallbacks();
        },
        enumerable: true,
        configurable: false
    });

    this._worker = new Worker(workerUrl);
    this._worker.addEventListener("message", _onMessage.bind(this), false);


    _postMessage(this._worker, {messageType: "threadify-start", args: args});
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

    return function() {
        var args = [];
        for (var i=0 ; i<arguments.length ; i++) {
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

    var thread = {
        terminate: function () {
            this.close();
        },

        error: function () {
            _postMessage({
                messageType: "threadify-error",
                args: _argumentsToList(arguments)
            });
            this.close();
        },

        return: function () {
            _postMessage({
                messageType: "threadify-return",
                args: _argumentsToList(arguments)
            });
            this.close();
        },

        postMessage: function (name) {
            var args = [];

            if (arguments.length > 1) {
                for (var i=1 ; i<arguments.length ; i++) {
                    args.push(arguments[i]);
                }
            }

            _postMessage({
                messageType: "threadify-custom",
                name: name,
                args: args
            });
        }
    };

    function _argumentsToList(argObject) {
        var args = [];

        for (var i=0 ; i<argObject.length ; i++) {
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
                var result = workerFunction.apply(thread, data.args);
                if (result !== undefined) {
                    _postMessage({
                        messageType: "threadify-return",
                        args: [result]
                    });
                    this.close();
                }
                break;
            case "threadify-custom":
                // TODO
        }
    }

    this.addEventListener("message", _onMessage, false);
};

},{}]},{},[2])(2)
});