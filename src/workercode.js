//
// This file contains the code that will be injected inside the web worker
//

module.exports = function (workerFunction, serializeArgs, unserializeArgs) {
    "use strict";

    var thread = {
        terminate: function () {
            _postMessage("threadify-terminated", []);
            close();
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

        postMessage(data, serialized.transferable);
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

    addEventListener("message", _onMessage, false);
};
