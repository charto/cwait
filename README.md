cwait
=====

[![build status](https://travis-ci.org/charto/cwait.svg?branch=master)](http://travis-ci.org/charto/cwait)
[![npm version](https://img.shields.io/npm/v/cwait.svg)](https://www.npmjs.com/package/cwait)

`cwait` provides a queue handler ([`TaskQueue`](#api-TaskQueue)) and a wrapper ([`Task`](#api-Task)) for promises,
to limit how many are being resolved simultaneously. It can wrap any ES6-compatible promises.
This allows for example limiting simultaneous downloads with minor changes to existing code.
Just wrap your existing "download finished" promise and use it as before.

This is a tiny library with no dependencies, usable both in browsers and Node.js.

Usage
-----

Create a new `TaskQueue` passing it whatever `Promise` constructor you're using (ES6, Bluebird, some other shim...)
and the maximum number of promise-returning functions to run concurrently.
Then just call `queue.wrap(<function>)` instead of `<function>` to limit simultaneous execution.

Simple Node.js example:

```typescript
import * as Promise from 'bluebird';
import {TaskQueue} from 'cwait';

/** Queue allowing 3 concurrent function calls. */
var queue = new TaskQueue(Promise, 3);

Promise.map(list, download); // Download all listed files simultaneously.

Promise.map(list, queue.wrap(download))); // Download 3 files at a time.
```

See [`test/test.ts`](test/test.ts) for some runnable code or run it like this:

```sh
git clone https://github.com/charto/cwait.git
cd cwait
npm install
npm test
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
> Source code: [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/TaskQueue.ts#L6-L60)  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[TaskQueue](#api-TaskQueue)&lt;PromiseType&gt;</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/TaskQueue.ts#L7-L11)  
> > &emsp;&#x25aa; Promise <sup><code>[PromisyClass](#api-PromisyClass)&lt;PromiseType&gt;</code></sup>  
> > &emsp;&#x25aa; concurrency <sup><code>number</code></sup>  
> > **.add( )** <sup>&rArr; <code>PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/TaskQueue.ts#L16-L33)  
> > &emsp;<em>Add a new task to the queue.</em>  
> > &emsp;<em>It will start when the number of other concurrent tasks is low enough.</em>  
> > &emsp;&#x25aa; func <sup><code>() =&gt; PromiseType</code></sup>  
> > **.wrap( )** <sup>&rArr; <code>(...args: any[]) =&gt; PromiseType</code></sup> [`<>`](http://github.com/charto/cwait/blob/bcc3b2b/src/TaskQueue.ts#L38-L40)  
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

Copyright (c) 2015-2016 BusFaster Ltd
