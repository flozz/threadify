module.exports =  {

    serializeArgs: function (args) {
        var serializedArgs = [];
        var transferrable = [];

        for (var i = 0 ; i < args.length ; i++) {
            serializedArgs .push({
                type: "arg",
                value: args[i]
            });
        }

        return {
            args: serializedArgs,
            transferrable: transferrable
        };
    },

    unserializeArgs: function (serializedArgs) {
        var args = [];

        for (var i = 0 ; i < serializedArgs.length ; i++) {

            if (serializedArgs[i].type == "arg") {
                args.push(serializedArgs[i].value);
            }
        }

        return args;
    }
};
