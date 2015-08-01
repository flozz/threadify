module.exports =  {

    serializeArgs: function (args) {
        var typedArray = {
            Int8Array: Int8Array,
            Uint8Array: Uint8Array,
            Uint8ClampedArray: Uint8ClampedArray,
            Int16Array: Int16Array,
            Uint16Array: Uint16Array,
            Int32Array: Int32Array,
            Uint32Array: Uint32Array,
            Float32Array: Float32Array,
            Float64Array: Float64Array
        };
        var serializedArgs = [];
        var transferable = [];

        for (var i = 0 ; i < args.length ; i++) {
            if (args[i] instanceof Error) {
                var obj = {
                    type: "Error",
                    value: {name: args[i].name}
                };
                var keys = Object.getOwnPropertyNames(args[i]);
                for (var k = 0 ; k < keys.length ; k++) {
                    obj.value[keys[k]] = args[i][keys[k]];
                }
                serializedArgs.push(obj);
            } else {
                var result = null;

                // TypedArray
                for (var t in typedArray) {
                    if (args[i] instanceof typedArray[t]) {
                        transferable.push(args[i].buffer);
                        result = {
                            type: "TypedArray",
                            arrayType: t,
                            value: args[i].buffer
                        };
                        break;
                    }
                }

                // Other
                if (!result) {
                    if (args[i] instanceof ArrayBuffer) {
                        transferable.push(args[i]);
                    }
                    result = {
                        type: "arg",
                        value: args[i]
                    };
                }

                serializedArgs.push(result);
            }
        }

        return {
            args: serializedArgs,
            transferable: transferable
        };
    },

    unserializeArgs: function (serializedArgs) {
        var args = [];

        for (var i = 0 ; i < serializedArgs.length ; i++) {

            switch (serializedArgs[i].type) {
                case "arg":
                    args.push(serializedArgs[i].value);
                    break;
                case "TypedArray":
                    args.push(new global[serializedArgs[i].arrayType](serializedArgs[i].value));
                    break;
                case "Error":
                    var obj = new Error();
                    for (var key in serializedArgs[i].value) {
                        obj[key] = serializedArgs[i].value[key];
                    }
                    args.push(obj);
            }
        }

        return args;
    }
};
