// This file is part of cwait, copyright (c) 2015-2017 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

/** Basic functionality we need promises to implement. @ignore internal use. */

export interface Promisy<PromiseType> {
	then(resolved: (result?: any) => any, rejected?: (err?: any) => any): PromiseType;
}

/** Promise class shim with basic functionality. @ignore internal use. */

export interface PromisyClass<PromiseType> {
	new(handler: any): PromiseType;

	resolve(result: any): PromiseType;
	reject(err: any): PromiseType;
}

/** Call func and return a promise for its result.
  * Optionally call given resolve or reject handler when the promise settles. */

export function tryFinally<PromiseType extends Promisy<PromiseType>>(
	func: () => PromiseType,
	onFinish: () => void,
	Promise: PromisyClass<PromiseType>,
	resolve?: (result: any) => void,
	reject?: (err: any) => void
) {
	let promise: PromiseType;

	try {
		promise = func();

		// Ensure func return value is a promise.
		if(typeof(promise) != 'object' || typeof(promise.then) != 'function') {
			promise = Promise.resolve(promise);
		}
	} catch(err) {
		// If func threw an error, return a rejected promise.
		promise = Promise.reject(err);
	}

	promise.then(onFinish, onFinish);
	if(resolve) promise.then(resolve, reject);

	return(promise);
}

/** Task wraps a promise, delaying it until some resource gets less busy. */

export class Task<PromiseType extends Promisy<PromiseType>> {
	constructor(
		private func: () => PromiseType,
		private Promise: PromisyClass<PromiseType>,
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

	private promise: PromiseType;
	private resolve: (result: any) => void;
	private reject: (err: any) => void;
}
