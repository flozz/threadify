//
// This file contains the code that will be injected inside the web worker
//

module.exports = function (workerFunction, serializeArgs, unserializeArgs) {

    var _worker = this;

    var thread = {
        terminate: function () {
            _postMessage("threadify-terminated", []);
            _worker.close();
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
