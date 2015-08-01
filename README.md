# Threadify

[ ![Build Status](https://api.travis-ci.org/flozz/threadify.svg?branch=master) ](https://travis-ci.org/flozz/threadify)
[ ![NPM Version](http://img.shields.io/npm/v/threadify.svg?style=flat) ](https://www.npmjs.com/package/threadify)
[ ![License](http://img.shields.io/npm/l/threadify.svg?style=flat) ](https://github.com/flozz/threadify/blob/master/LICENSE)

Threadify is a browser-side Javascript library that allows you to run any **Javascript function** into a **web worker**.

Example of a threadified function:

```javascript
var myFunction = threadify(function (param1, param2) {
    // This will be executed inside a web worker
    console.log("Hello from the worker");
    return param1 + param2;
});

var job = myFunction("foo", "bar");

job.done = function (result) {
    console.log(result);
};
```


## Getting Started

### Getting Threadify

#### Standalone Version

First download the [Threadify zip][dl-zip] or clone the repository.

Then include the `threadify.js` or `threadify.min.js` (from the `dist` folder) in you HTML page:

```html
<script src="dist/threadify.js"></script>
```


#### NPM and Browserify

First install the `threadify` package:

    npm install --save threadify

Then include it where you need it:

```javascript
var threadify = require("threadify");
```


### Threadifying a Function

To run a function in a web worker, you have to threadify it:

```javascript
var myFunction = threadify(function (param1, param2) {
    // The code of this function will be executed inside a web worker
    return param1 + param2;
});
```

Then, to run your threadified function, you just have to call it as any other function:

```javascript
var job = myFunction("param1", "param2");
```

When you call your threadified function, it returns a `Job` object that allow you to control the worker and to retrieve values returned by the function.

To get the result of your function, just define a `done` callback on the `Job` object:

```javascript
// this function will be called once the function return something.
job.done = function (result) {
    console.log(result);
};
```


### Returning Values

The simplest way to return a value from the threadified function is to use the `return` keyword as usual:

```javascript
var myFunction = threadify(function (param1, param2) {
    return param1 + param2;
});
```

But if you have asynchrone code in your function (or if you want to return more than one value), you will not be able to use the `return` keyword. But you can use the `this.return()` method instead:

```javascript
var myFunction = threadify(function (param1, param2) {
    this.return(param1, param2);
});
```

Be careful of the `this` context when you call `this.return()` from a callback. For instance, the following code **will not work** because of the wrong `this` context:

```javascript
var myFunction = threadify(function (param1, param2) {
    setTimeout(function () {
        this.return(param1, param2);
    }, 1000);
});
```

To fix it, you can modify it like this:

```javascript
var myFunction = threadify(function (param1, param2) {
    var thread = this;
    setTimeout(function () {
        thread.return(param1, param2);
    }, 1000);
});
```

The worker still alive until you return something or you terminate it explicitly.

**NOTE:** if you just use the `return` keyword without any value, the worker will not be terminated.


## About Web Workers Limitations

Web workers are executed in an other thread than your main script / page, this causes some limitations detailed bellow.

### Accessible Objects

From the worker (the threadified function) you cannot access to all browser's objects you are used to. For instance, this is some objects that are not accessible:

* the `window` object,

* the `document` object ,

* DOM / DOM elements (you cannot manipulate the HTML of your page),

* other functions / classes / objects / variables of your main thread (you cannot access to anything outside your threadified function),

* ...

### Arguements and Returned Values

You cannot send / return any type of argument to / from a worker. Threadify allows you to send / return:

* Simple types / values (copied):
  * `Number`
  * `String`
  * `Boolean`
  * `Array`¹
  * `Object`¹
  * `undefined`
  * `null`
  * `Infinity`
  * `NaN`

* `Error` objects (copied)

* ~~`Blob` and `File` (transfered)~~ **TODO**

* `ArrayBuffer` (transfered)

* ~~Typed arrays (transfered)~~ **TODO**

* ~~`DataView` (transfered)~~ **TODO**

* ~~Canvas image data (transfered)~~ **TODO**

Depending on their types, arguments can be copied or transfered to the worker. A transfered argument means that its access is transfered to the worker and that it will no more be accessible from the main thread.

**NOTE¹:** Only if they contains allowed types (no class, no function,...)


## Job API

You get the `Job` object each time you call a threadified function:

```javascript
var myFunction = threadify(function (param1, param2) {
    // The code of this function will be executed inside a web worker
    return param1 + param2;
});

var job = myFunction("foo", "bar");
```

### Methods

* `job.terminate()`: terminates immediately the worker without letting it an opportunity to finish its operations.

```javascript
job.terminate();
```

### Callbacks

* `job.done = function (result) {}`: called when the threadified function returns something. Please note that the worker is terminated right after it returns the value.

* `job.failed = function (error) {}`: called when an error occurred in the threadified function. Please note that the worker is not always terminated when an error occurred.

* `job.terminated = function () {}`: called when the worker is terminated.


## Thread API

Inside the threadified function, you have access to a `Thread` object through the `this` context.

```javascript
var myFunction = threadify(function (param1, param2) {
    var thread = this;
});
```

### Methods

* `thread.terminate()`: terminates immediately the worker.

* `thread.error(error)`: Reports an error (this will calls the `job.failed` callback function). Please not that calling this method will not terminate the worker.

* `thread.return(param [, param2 [, ...]])`: return one or more values (this will call the `job.done` callback function) and terminates the worker.


## Hacking

Threadify is built using [Grunt][grunt] and [Browserify][browserify]. To start hacking Threadify, you will have to install few tools.


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


## Changelog

* **0.1.0:**
  * First release: basic functionalities required to build and run workers



[dl-zip]: https://github.com/flozz/threadify/archive/master.zip
[grunt]: http://gruntjs.com/
[browserify]: http://browserify.org/
[nodejs]: https://nodejs.org/
[iojs]: https://iojs.org/
[codestyle-yandex]: https://github.com/yandex/codestyle/blob/master/javascript.md
