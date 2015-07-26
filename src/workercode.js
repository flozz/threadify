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
