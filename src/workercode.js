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
