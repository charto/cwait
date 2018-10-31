// This file is part of cwait, copyright (c) 2015- BusFaster Ltd.
// Released under the MIT license, see LICENSE.

/** Promise class shim with basic functionality. @ignore internal use. */

export interface PromisyClass {

	new<Result>(handler: (resolve: (result?: Result) => any, reject: (err?: any) => any) => any): PromiseLike<Result>;

	resolve<Result>(result: Result | PromiseLike<Result>): PromiseLike<Result>;
	reject(err: any): PromiseLike<any>;

}

/** Call func and return a promise for its result.
  * Optionally call given resolve or reject handler when the promise settles. */

export function tryFinally<Result>(
	func: () => Result | PromiseLike<Result>,
	onFinish: () => void,
	Promise: PromisyClass,
	resolve?: (result: Result) => void,
	reject?: (err: any) => void
) {
	let promise: PromiseLike<Result>;

	try {
		promise = Promise.resolve(func());
	} catch(err) {
		// If func threw an error, return a rejected promise.
		promise = Promise.reject(err);
	}

	promise.then(onFinish, onFinish);
	if(resolve) promise.then(resolve, reject);

	return(promise);
}

/** Task wraps a promise, delaying it until some resource gets less busy. */

export class Task<Result> {

	constructor(
		private func: () => Result | PromiseLike<Result>,
		private Promise: PromisyClass,
		public stamp: number
	) {}

	/** Wrap task result in a new promise so it can be resolved later. */

	delay() {
		if(!this.promise) {
			this.promise = new this.Promise((resolve: any, reject: any) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		}

		return(this.promise);
	}

	/** Start the task and call onFinish when done. */

	resume(onFinish: () => void) {
		return(tryFinally(this.func, onFinish, this.Promise, this.resolve, this.reject));
	}

	private promise: PromiseLike<Result>;
	private resolve: (result: Result) => void;
	private reject: (err: any) => void;

}
