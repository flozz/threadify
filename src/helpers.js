module.exports =  {

    serializeArgs: function (args) {
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
                if (args[i] instanceof ArrayBuffer) {
                    transferable.push(args[i]);
                }
                serializedArgs.push({
                    type: "arg",
                    value: args[i]
                });
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
