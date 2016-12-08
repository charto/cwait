// This file is part of cwait, copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

declare var process: any;

import * as Promise from 'bluebird';
import {TaskQueue} from '..';

function equals(a: any, b: any) {
	if(a != b) {
		console.log('ERROR ' + a + ' != ' + b);
		process.exit(1);
	}

	console.log('OK ' + a);
}

var testCount = 0;

function test1() {
	/** Queue allowing 3 concurrent function calls. */
	var queue = new TaskQueue(Promise, 3);

	var running = 0;
	var maxRunning = 0;

	/** Test function returning a promise with a slight delay
	  * and tracking concurrent executions. */

	function run(item: string) {
		if(++running > maxRunning) maxRunning = running;

		return(Promise.delay(100, true).then(() => {
			--running;
			return(item);
		}));
	}

	/** List of 6 items to loop through. */
	var list = '123456'.split('');

	// Run test without limiting concurrency.

	Promise.map(list, run).then((result: string[]) => {
		++testCount;

		equals(result.join(''), '123456');
		equals(maxRunning, 6);

		maxRunning = 0;

		// Run test and limit concurrency.

		return(Promise.map(list, queue.wrap(run)))
	}).then((result: string[]) => {
		++testCount;

		equals(result.join(''), '123456');
		equals(maxRunning, 3);
	})
}

function test2() {
	function throws() {
		if(1) throw(new Error('Beep'));

		return(Promise.resolve(true));
	}

	var queue = new TaskQueue(Promise, 1);

	queue.wrap(throws)().then(null as any, (err: any) => ++testCount);
	queue.wrap(throws)().then(null as any, (err: any) => ++testCount);
}

function test3() {
	function rejects() {
		return(Promise.reject(new Error('Beep')));
	}

	var queue = new TaskQueue(Promise, 1);

	queue.wrap(rejects)().then(null as any, (err: any) => ++testCount);
	queue.wrap(rejects)().then(null as any, (err: any) => ++testCount);
}

test1();
test2();
test3();

setTimeout(() => {
	equals(testCount, 6);
}, 1000);
