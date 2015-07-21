# Threadify

[ ![Build Status](https://api.travis-ci.org/flozz/threadify.svg?branch=master) ](https://travis-ci.org/flozz/threadify)
[ ![NPM Version](http://img.shields.io/npm/v/threadify.svg?style=flat) ](https://www.npmjs.com/package/threadify)
[ ![License](http://img.shields.io/npm/l/threadify.svg?style=flat) ](https://github.com/flozz/threadify/blob/master/LICENSE)

Threadify is a browser-side Javascript library that allows you to run any **Javascript function** into a **web worker**.

**WORK IN PROGRESS**

Example of the targeted API:

```javascript
var myThreadedFunction = threadify(function(thread, param1, param2) {
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
