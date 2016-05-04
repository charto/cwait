declare module 'bluebird' {
	import {Promisy, PromisyClass} from 'cwait';

	var _Promise: PromisyClass<Promisy<any>>;

	class Promise<ReturnType> extends _Promise implements Promisy<Promise<ReturnType>> {
		constructor(handler: (resolve: any, reject: any) => any);

		then<ReturnType>(resolved: (result?: any) => ReturnType, rejected?: (err?: any) => any): Promise<ReturnType>;

		static try<ReturnType>(value: ReturnType): Promise<ReturnType>;
		static delay<ReturnType>(milliseconds: number, value: ReturnType): Promise<ReturnType>;
		static map<ItemType, ReturnType>(data: ItemType[], handler: (item: ItemType) => ReturnType): Promise<ReturnType>;
	}

	module Promise {}

	export = Promise;
}
