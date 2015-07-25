
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
