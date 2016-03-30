cwait
=====

[![build status](https://travis-ci.org/charto/cwait.svg?branch=master)](http://travis-ci.org/charto/cwait)
[![npm version](https://img.shields.io/npm/v/cwait.svg)](https://www.npmjs.com/package/cwait)

`cwait` provides a queue handler ([`TaskQueue`](#api-TaskQueue)) and a wrapper ([`Task`](#api-Task)) for promises,
to limit how many are being resolved simultaneously. It can wrap any ES6-compatible promises.
This allows for example limiting simultaneous downloads with minor changes to existing code.
Just wrap your existing "download finished" promise and use it as before.

Usage
-----

```typescript
import * as Promise from 'bluebird';
import {TaskQueue} from 'cwait';

/** Queue allowing 3 concurrent function calls. */
var queue = new TaskQueue(Promise, 3);

Promise.map(list, download); // Download all listed files simultaneously.

Promise.map(list, queue.wrap(download))); // Download 3 files at a time.
```

API
===

>
> <a name="api-Task"></a>
> ### Class [`Task`](#api-Task)
> <em>Task wraps a promise, delaying it until some resource gets less busy.</em>  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[Task](#api-Task)</code></sup>  
> > &emsp;&#x25aa; func <sup><code>() => PromiseType</code></sup>  
> > **.start( )** <sup>&rArr; <code>PromiseType</code></sup>  
> > &emsp;<em>Start the task immediately and call onFinish callback when done.</em>  
> > &emsp;&#x25aa; onFinish <sup><code>() => void</code></sup>  
> > **.delay( )** <sup>&rArr; <code>PromiseType</code></sup>  
> > &emsp;<em>Wrap task result in a new promise so it can be resolved later.</em>  
> > &emsp;&#x25aa; Promise <sup><code>[PromisyClass](#api-PromisyClass)</code></sup>  
> > **.resume( )** <sup>&rArr; <code>PromiseType</code></sup>  
> > &emsp;<em>Resolve the result of a delayed task and call onFinish when done.</em>  
> > &emsp;&#x25aa; onFinish <sup><code>() => void</code></sup>  
>  
> Properties:  
> > **.func** <sup><code>() => PromiseType</code></sup>  
> > **.resolve** <sup><code>any</code></sup>  
> > **.reject** <sup><code>any</code></sup>  
>
> <a name="api-TaskQueue"></a>
> ### Class [`TaskQueue`](#api-TaskQueue)
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[TaskQueue](#api-TaskQueue)</code></sup>  
> > &emsp;&#x25aa; Promise <sup><code>[PromisyClass](#api-PromisyClass)</code></sup>  
> > &emsp;&#x25aa; concurrency <sup><code>number</code></sup>  
> > **.add( )** <sup>&rArr; <code>PromiseType</code></sup>  
> > &emsp;<em>Add a new task to the queue.
It will start when the number of other concurrent tasks is low enough.</em>  
> > &emsp;&#x25aa; func <sup><code>() => PromiseType</code></sup>  
> > **.wrap( )** <sup>&rArr; <code>(...args: any[]) => PromiseType</code></sup>  
> > &emsp;<em>Wrap a function returning a promise, so that before running
it waits until concurrent invocations are below this queue's limit.</em>  
> > &emsp;&#x25aa; func <sup><code>(...args: any[]) => PromiseType</code></sup>  
> > &emsp;&#x25ab; thisObject<sub>?</sub> <sup><code>any</code></sup>  
>  
> Properties:  
> > **.concurrency** <sup><code>number</code></sup>  
> > &emsp;<em>Number of promises allowed to resolve concurrently.</em>  

License
=======

[The MIT License](https://raw.githubusercontent.com/charto/cwait/master/LICENSE)

Copyright (c) 2015-2016 BusFaster Ltd
