"use strict";

var helpers = require("./helpers.js");
var Job = require("./job.js");
var workerCode = require("./workercode.js");

function factory(workerFunction) {
    var workerBlob = new Blob(
        [
            "var window=this;var global=this;(",
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
