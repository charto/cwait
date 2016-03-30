// This file is part of cwait, copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import {Task, Promisy} from './Task'

export class TaskQueue<PromiseType extends Promisy<PromiseType>> {
	constructor(Promise: Promisy<PromiseType>, concurrency: number) {
		this.Promise = Promise;
		this.concurrency = concurrency;
	}

	/** Add a new task to the queue.
	  * It will start when the number of other concurrent tasks is low enough. */

	add(func: () => PromiseType) {
		if(this.busyCount < this.concurrency) {
			// Start the task immediately.

			++this.busyCount;

			return(func().finally(() => this.next()));
		} else {
			// Schedule the task and return a promise resolving
			// to the result of task.start().

			var task = new Task(func);

			this.backlog.push(task);

			return(task.delay(this.Promise));
		}
	}

	/** Start the next task from the backlog. */

	private next() {
		var task = this.backlog.shift();

		if(task) task.resume(() => this.next());
		else --this.busyCount;
	}

	private Promise: Promisy<PromiseType>;

	/** Number of promises allowed to resolve concurrently. */
	concurrency = 2;

	private backlog: Task<PromiseType>[] = [];
	private busyCount = 0;
}
