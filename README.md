# Threadify

[ ![Build Status](https://api.travis-ci.org/flozz/threadify.svg?branch=master) ](https://travis-ci.org/flozz/threadify)
[ ![NPM Version](http://img.shields.io/npm/v/threadify.svg?style=flat) ](https://www.npmjs.com/package/threadify)
[ ![License](http://img.shields.io/npm/l/threadify.svg?style=flat) ](https://github.com/flozz/threadify/blob/master/LICENSE)

Threadify is a browser-side Javascript library that allows you to run any **Javascript function** into a **web worker**.

**WORK IN PROGRESS**

Example of the targeted API:

```javascript
var myThreadedFunction = threadify(function(param1, param2) {
    // This is executed in a web worker
    console.log("Hello from the worker");
    return param1 + param2;
});


var job = myThreadedFunction("foo", "bar");

job.failed = function(error) {
    console.error(error);
};

job.done = function(result) {
    console.log(result);
};

job.terminated = function() {
    console.log("Job is terminated.")
};
```


## Haching

Threadify is built using [Grunt][grunt] and [Browserify][browserify]. To start hacking Threadify, you will have to install fiew tools.


### Installing Dependencies

To build Threadify, you will first have to install [Node.js][nodejs] (or [io.js][iojs]).

**NOTE:** If you are on Ubuntu / Debian Linux you must install the `nodejs-legacy` package.

Next, install globally the `grunt-cli` npm package:

    npm install -g grunt-cli

Then install the required dependencies:

    npm install


### Building Threadify

Once the build stuff and dependencies installed, you just have to run the `grunt` command to build Threadify:

    grunt

All generated files are in the `dist` folder.


### Coding Style

Threadify follows the [Yandex Javascript CodeStyle][codestyle-yandex] **EXCEPT** for the quote marks where **double quotes** (`"`) are used.

You can automatically check that your code follows the conventions by using this command:

    grunt jscs


### Running Tests

To run the tests, first check that the javascript is well formed and that it follows the coding style:

    grunt jshint jscs

Then, open the following page in your web browser:

* `test/SpecRunner.html`



[grunt]: http://gruntjs.com/
[browserify]: http://browserify.org/
[nodejs]: https://nodejs.org/
[iojs]: https://iojs.org/
[codestyle-yandex]: https://github.com/yandex/codestyle/blob/master/javascript.md
