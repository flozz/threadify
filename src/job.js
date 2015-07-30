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
