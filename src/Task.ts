// This file is part of cwait, copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

/** Basic functionality we need promises to implement. @ignore internal use. */

export interface Promisy<PromiseType> {
	new(handler: any): PromiseType;

	then: (handler: any) => PromiseType;
	catch: (handler: any) => PromiseType;
	finally: (handler: any) => PromiseType;
}

/** Task wraps a promise, delaying it until some resource gets less busy. */

export class Task<PromiseType extends Promisy<PromiseType>> {
	constructor(func: () => PromiseType) {
		this.func = func;
	}

	/** Start the task immediately and call onFinish callback when done. */

	start(onFinish: () => void) {
		return(this.func().finally(onFinish));
	}

	/** Wrap task result in a new promise so it can be resolved later. */

	delay(Promise: Promisy<PromiseType>) {
		return(new Promise((resolve: any, reject: any) => {
			this.resolve = resolve;
			this.reject = reject;
		}));
	}

	/** Resolve the result of a delayed task and call onFinish when done. */

	resume(onFinish: () => void) {
		return(this.start(onFinish).then(this.resolve).catch(this.reject));
	}

	func: () => PromiseType;

	resolve: any;
	reject: any;
}
