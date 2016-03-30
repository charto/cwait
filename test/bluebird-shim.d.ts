declare module 'bluebird' {
	import {TaskQueue, Promisy} from 'cwait';

	var _Promise: { new(): Promisy<any> };

	class Promise<ReturnType> extends _Promise implements Promisy<Promise<ReturnType>> {
		constructor(handler: (resolve: any, reject: any) => any);

		then<ReturnType>(handler: () => ReturnType): Promise<ReturnType>;

		static try<ReturnType>(value: ReturnType): Promise<ReturnType>;
		static delay<ReturnType>(milliseconds: number, value: ReturnType): Promise<ReturnType>;
		static map<ItemType, ReturnType>(data: ItemType[], handler: (item: ItemType) => ReturnType): Promise<ReturnType>;
	}

	module Promise {}

	export = Promise;
}
