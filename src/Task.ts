// This file is part of cwait, copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

/** Basic functionality we need promises to implement. @ignore internal use. */

export interface Promisy<PromiseType> {
	then(resolved: (result?: any) => any, rejected?: (err?: any) => any): PromiseType;
}

/** Promise class shim with basic functionality. @ignore internal use. */

export interface PromisyClass<PromiseType> {
	new(handler: any): PromiseType;
}

/** Task wraps a promise, delaying it until some resource gets less busy. */

export class Task<PromiseType extends Promisy<PromiseType>> {
	constructor(func: () => PromiseType) {
		this.func = func;
	}

	/** Wrap task result in a new promise so it can be resolved later. */

	delay(Promise: PromisyClass<PromiseType>) {
		if(!this.promise) {
			this.promise = new Promise((resolve: any, reject: any) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		}

		return(this.promise);
	}

	/** Start the task and call onFinish when done. */

	resume(onFinish: () => void) {
		var result = this.func();

		result.then(onFinish, onFinish);
		if(this.resolve) result.then(this.resolve, this.reject);

		return(result);
	}

	private func: () => PromiseType;

	private promise: PromiseType;
	private resolve: (result: any) => void;
	private reject: (err: any) => void;
}
