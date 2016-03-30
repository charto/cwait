// This file is part of cwait, copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

declare var process: any;

import * as Promise from 'bluebird';
import {TaskQueue} from 'cwait';

/** Queue allowing 3 concurrent function calls. */
var queue = new TaskQueue(Promise, 3);

var running = 0;

/** Test function returning a promise with a slight delay
  * and tracking concurrent executions. */

function run() {
	if(++running > maxRunning) maxRunning = running;

	return(Promise.delay(100, true).then(() => --running));
}

function equals(a: number, b: number) {
	if(a != b) {
		console.log('ERROR ' + a + ' != ' + b);
		process.exit(1);
	}

	console.log('OK ' + a);
}

/** List of 6 items to loop through. */
var list = '123456'.split('');

var maxRunning = 0;

// Run test without limiting concurrency.

Promise.map(list, run).then(() => {
	equals(maxRunning, 6);

	maxRunning = 0;

	// Run test and limit concurrency.

	return(Promise.map(list, queue.wrap(run)))
}).then(() => {
	equals(maxRunning, 3);
})
