// This file is part of cwait, copyright (c) 2015-2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { BinaryHeap } from 'cdata/dist/BinaryHeap';

import { Task, Promisy, PromisyClass, tryFinally } from './Task';

export class TaskQueue<PromiseType extends Promisy<PromiseType>> {
	constructor(Promise: PromisyClass<PromiseType>, concurrency: number) {
		this.Promise = Promise;
		this.concurrency = concurrency;
		this.nextBound = () => this.next();
		this.nextTickBound = () => {
			this.timerStamp = 0;
			this.next();
		};
	}

	/** Add a new task to the queue.
	  * It will start when the number of other concurrent tasks is low enough.
	  * @param func Function to call.
	  * @param delay Initial delay in milliseconds before making the call. */

	add(func: () => any, delay = 0) {
		if(this.busyCount < this.concurrency && !delay) {
			// Start the task immediately.

			++this.busyCount;

			return(tryFinally(func, this.nextBound, this.Promise));
		} else {
			// Schedule the task and return a promise resolving
			// to the result of task.start().

			const stamp = new Date().getTime() + delay;
			const task = new Task(func, this.Promise, stamp);

			this.backlog.insert(task);

			return(task.delay());
		}
	}

	/** Consider current function idle until promise resolves.
	  * Useful for making recursive calls. */

	unblock(promise: PromiseType) {
		this.next();

		const onFinish = () => ++this.busyCount;

		promise.then(onFinish, onFinish);

		return(promise);
	}

	/** Wrap a function returning a promise, so that before running
	  * it waits until concurrent invocations are below this queue's limit. */

	wrap(func: (...args: any[]) => any, thisObject?: any) {
		return((...args: any[]) => this.add(() => func.apply(thisObject, args)));
	}

	/** Start the next task from the backlog. */

	private next() {
		const stamp = new Date().getTime();
		let task: Task<PromiseType> | null = null;

		// If another task is eligible to run, get the next scheduled task.
		if(this.busyCount <= this.concurrency) task = this.backlog.peekTop();

		if(task && task.stamp <= stamp) {
			// A task remains, scheduled to start already. Resume it.
			task = this.backlog.extractTop()!;
			task.resume(this.nextBound);
		} else {
			// No tasks are scheduled to start right now.
			// Any new task can start immediately.
			--this.busyCount;

			if(task && (!this.timerStamp || task.stamp < this.timerStamp)) {
				// There is a task scheduled after a delay,
				// and no current timer firing before the delay.

				if(this.timerStamp) {
					// There is a timer firing too late. Remove it.
					clearTimeout(this.timer as any);
				}

				// Start a timer to clear timerStamp and call this function.
				this.timer = setTimeout(this.nextTickBound, stamp - task.stamp);
				this.timerStamp = task.stamp;
			}
		}
	}

	private nextBound: () => void;
	private nextTickBound: () => void;

	private Promise: PromisyClass<PromiseType>;

	private busyCount = 0;
	private backlog = new BinaryHeap<Task<PromiseType>>(
		(a: Task<PromiseType>, b: Task<PromiseType>) => a.stamp - b.stamp
	);

	/** Number of promises allowed to resolve concurrently. */
	concurrency: number;
	timer: number | NodeJS.Timer;
	timerStamp: number;
}
