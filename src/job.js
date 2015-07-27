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
