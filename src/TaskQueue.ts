// This file is part of cwait, copyright (c) 2015- BusFaster Ltd.
// Released under the MIT license, see LICENSE.

import { BinaryHeap } from 'cdata';

import { Task, PromisyClass, tryFinally } from './Task';

export class TaskQueue<PromiseType extends PromisyClass> {

	constructor(
		private Promise: PromiseType,
		/** Number of promises allowed to resolve concurrently. */
		public concurrency: number
	) {
		this.Promise = Promise;
		this.concurrency = concurrency;
		this.nextBound = () => this.next(1);
		this.nextTickBound = () => {
			this.timerStamp = 0;
			this.next(0);
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

	unblock<Result>(promise: PromiseLike<Result>) {
		this.next(1);

		const onFinish = () => ++this.busyCount;

		promise.then(onFinish, onFinish);

		return(promise);
	}

	/** Wrap a function returning a promise, so that before running
	  * it waits until concurrent invocations are below this queue's limit. */

	wrap<Result>(func: () => Result | PromiseLike<Result>, thisObject?: any): () => PromiseLike<Result>;
	wrap<Result, A>(func: (a: A) => Result | PromiseLike<Result>, thisObject?: any): (a: A) => PromiseLike<Result>;
	wrap<Result, A, B>(func: (a: A, b: B) => Result | PromiseLike<Result>, thisObject?: any): (a: A, b: B) => PromiseLike<Result>;
	wrap<Result, A, B, C>(func: (a: A, b: B, c: C) => Result | PromiseLike<Result>, thisObject?: any): (a: A, b: B, c: C) => PromiseLike<Result>;
	wrap<Result, A, B, C, D>(func: (a: A, b: B, c: C, d: D) => Result | PromiseLike<Result>, thisObject?: any): (a: A, b: B, c: C, d: D) => PromiseLike<Result>;
	wrap<Result>(func: (...args: any[]) => Result | PromiseLike<Result>, thisObject?: any): (...args: any[]) => PromiseLike<Result> {
		return((...args: any[]) => this.add(() => func.apply(thisObject, args)));
	}

	/** Start the next task from the backlog. */

	private next(ended: number) {
		const stamp = new Date().getTime();
		let task: Task<any> | null = null;

		this.busyCount -= ended;

		// If another task is eligible to run, get the next scheduled task.
		if(this.busyCount < this.concurrency) task = this.backlog.peekTop();

		if(!task) return;

		if(task.stamp <= stamp) {
			// A task remains, scheduled to start already. Resume it.
			++this.busyCount;
			task = this.backlog.extractTop()!;
			task.resume(this.nextBound);
		} else if(!this.timerStamp || task.stamp + 1 < this.timerStamp) {
			// There is a task scheduled after a delay,
			// and no current timer firing before the delay.

			if(this.timerStamp) {
				// There is a timer firing too late. Remove it.
				clearTimeout(this.timer as any);
			}

			// Start a timer to clear timerStamp and call this function.
			this.timer = setTimeout(this.nextTickBound, ~~(task.stamp - stamp + 1));
			this.timerStamp = task.stamp;
		}
	}

	private nextBound: () => void;
	private nextTickBound: () => void;

	private busyCount = 0;
	private backlog = new BinaryHeap<Task<any>>(
		(a: Task<any>, b: Task<any>) => a.stamp - b.stamp
	);

	timer: number | NodeJS.Timer;
	timerStamp: number;

}
