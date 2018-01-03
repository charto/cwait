cwait
=====

[![build status](https://travis-ci.org/charto/cwait.svg?branch=master)](http://travis-ci.org/charto/cwait)
[![npm monthly downloads](https://img.shields.io/npm/dm/cwait.svg)](https://www.npmjs.com/package/cwait)
[![npm version](https://img.shields.io/npm/v/cwait.svg)](https://www.npmjs.com/package/cwait)

`cwait` provides a queue handler ([`TaskQueue`](#api-TaskQueue)) and a wrapper ([`Task`](#api-Task)) for promises,
to limit how many are being resolved simultaneously. It can wrap any ES6-compatible promises.
This allows for example limiting simultaneous downloads with minor changes to existing code.
Just wrap your existing "download finished" promise and use it as before.

This is a tiny library with a single dependency, usable both in browsers and Node.js.

Usage
-----

Create a new `TaskQueue` passing it whatever `Promise` constructor you're using (ES6, Bluebird, some other shim...)
and the maximum number of promise-returning functions to run concurrently.
Then just call `queue.wrap(<function>)` instead of `<function>` to limit simultaneous execution.

Simple Node.js example:

```TypeScript
import * as Promise from 'bluebird';
import {TaskQueue} from 'cwait';

/** Queue allowing 3 concurrent function calls. */
var queue = new TaskQueue(Promise, 3);

Promise.map(list, download); // Download all listed files simultaneously.

Promise.map(list, queue.wrap(download)); // Download 3 files at a time.
```

See [`test/test.ts`](test/test.ts) for some runnable code or run it like this:

```sh
git clone https://github.com/charto/cwait.git
cd cwait
npm install
npm test
```

Recursion
---------

Recursive loops that run in parallel require special care.
Nested concurrency-limited calls (that are not tail-recursive) must be wrapped in `queue.unblock()`.

Here's a simple example that fails:

```JavaScript
var queue = new (require('cwait').TaskQueue)(Promise, 3);

var rec = queue.wrap(function(n) {
    console.log(n);
    return(n && Promise.resolve(rec(n - 1)));
});

rec(10);
```

It only prints numbers 10, 9 and 8.
More calls don't get scheduled because there are already 3 promises pending.
For example Node.js exits immediately afterwards because the program is not blocked waiting for any system calls.

Passing a promise to `queue.unblock(promise)` tells `queue` that
the current function will wait for `promise` to resolve before continuing.
One additional concurrent function is then allowed until the promise resolves.

Be careful not to call `queue.unblock()` more than once (concurrently) from inside a wrapped function!
Otherwise the queue may permit more simultaneous tasks than the intended limit.

Here is a corrected example:

```JavaScript
var queue = new (require('cwait').TaskQueue)(Promise, 3);

var rec = queue.wrap(function(n) {
    console.log(n);
    return(n && queue.unblock(Promise.resolve(rec(n - 1))));
});

rec(10);
```

Advanced example with recursion
-------------------------------

The following code recursively calculates the 10th Fibonacci number (55)
running 3 recursive steps in parallel, each with an artificial 10-millisecond delay.

At the end, it prints the result (55) and the number of concurrent calls (3).

```JavaScript
var queue = new (require('cwait').TaskQueue)(Promise, 3);

var maxRunning = 0;
var running = 0;
var delay = 10;

var fib = queue.wrap(function(n) {
    // "Calculation" begins. Track maximum concurrent executions.
    if(++running > maxRunning) maxRunning = running;

    return(new Promise(function(resolve, reject) {
        setTimeout(function() {
            // "Calculation" ends.
            --running;

            // Each Fibonacci number is the sum of the previous two, except
            // the first ones are 0, 1 (starting from the 0th number).
            // Calculate them in parallel and unblock the queue until ready.

            resolve(n < 2 ? n :
                queue.unblock(Promise.all([
                    fib(n - 1),
                    fib(n - 2)
                ])).then(function(r) {
                    // Sum results from parallel recursion.
                    return(r[0] + r[1]);
                })
            );
        }, delay);
    }));
});

fib(10).then(function(x) {
    console.log('Result: ' + x);
    console.log('Concurrency: ' + maxRunning);
});
```

API
===
Docs generated using [`docts`](https://github.com/charto/docts)


>
> <a name="api-Task"></a>
> ### Class [`Task`](#api-Task)
> <em>Task wraps a promise, delaying it until some resource gets less busy.</em>  
> Source code: [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/Task.ts#L49-L80)  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[Task](#api-Task)&lt;PromiseType&gt;</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/Task.ts#L50-L53)  
> > &emsp;&#x25aa; func <sup><code>() =&gt; PromiseType</code></sup>  
> > &emsp;&#x25aa; Promise <sup><code>[PromisyClass](#api-PromisyClass)&lt;PromiseType&gt;</code></sup>  
> > **.delay( )** <sup>&rArr; <code>PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/Task.ts#L57-L66)  
> > &emsp;<em>Wrap task result in a new promise so it can be resolved later.</em>  
> > **.resume( )** <sup>&rArr; <code>PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/Task.ts#L70-L72)  
> > &emsp;<em>Start the task and call onFinish when done.</em>  
> > &emsp;&#x25aa; onFinish <sup><code>() =&gt; void</code></sup>  
>
> <a name="api-TaskQueue"></a>
> ### Class [`TaskQueue`](#api-TaskQueue)
> Source code: [`<>`](http://github.com/charto/cwait/blob/c57c0fd/src/TaskQueue.ts#L6-L75)  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[TaskQueue](#api-TaskQueue)&lt;PromiseType&gt;</code></sup> [`<>`](http://github.com/charto/cwait/blob/c57c0fd/src/TaskQueue.ts#L7-L11)  
> > &emsp;&#x25aa; Promise <sup><code>[PromisyClass](#api-PromisyClass)&lt;PromiseType&gt;</code></sup>  
> > &emsp;&#x25aa; concurrency <sup><code>number</code></sup>  
> > **.add( )** <sup>&rArr; <code>PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/c57c0fd/src/TaskQueue.ts#L16-L33)  
> > &emsp;<em>Add a new task to the queue.</em>  
> > &emsp;<em>It will start when the number of other concurrent tasks is low enough.</em>  
> > &emsp;&#x25aa; func <sup><code>() =&gt; PromiseType</code></sup>  
> > **.unblock( )** <sup>&rArr; <code>PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/c57c0fd/src/TaskQueue.ts#L38-L46)  
> > &emsp;<em>Consider current function idle until promise resolves.</em>  
> > &emsp;<em>Useful for making recursive calls.</em>  
> > &emsp;&#x25aa; promise <sup><code>PromiseType</code></sup>  
> > **.wrap( )** <sup>&rArr; <code>(...args: any[]) =&gt; PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/c57c0fd/src/TaskQueue.ts#L51-L53)  
> > &emsp;<em>Wrap a function returning a promise, so that before running</em>  
> > &emsp;<em>it waits until concurrent invocations are below this queue's limit.</em>  
> > &emsp;&#x25aa; func <sup><code>(...args: any[]) =&gt; PromiseType</code></sup>  
> > &emsp;&#x25ab; thisObject<sub>?</sub> <sup><code>any</code></sup>  
>  
> Properties:  
> > **.concurrency** <sup><code>number</code></sup>  
> > &emsp;<em>Number of promises allowed to resolve concurrently.</em>  

License
=======

[The MIT License](https://raw.githubusercontent.com/charto/cwait/master/LICENSE)

Copyright (c) 2015-2017 BusFaster Ltd
