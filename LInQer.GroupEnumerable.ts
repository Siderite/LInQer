/// <reference path="./LInQer.Slim.ts" />

namespace Linqer {

	export interface Enumerable extends Iterable<any> {
		/**
		 * Groups the elements of a sequence.
		 *
		 * @param {ISelector} keySelector
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		groupBy(keySelector: ISelector): Enumerable;
		/**
		 * Correlates the elements of two sequences based on key equality and groups the results. A specified equalityComparer is used to compare keys.
		 * WARNING: using the equality comparer will be slower
		 *
		 * @param {IterableType} iterable
		 * @param {ISelector} innerKeySelector
		 * @param {ISelector} outerKeySelector
		 * @param {(item1: any, item2: any) => any} resultSelector
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		groupJoin(iterable: IterableType,
			innerKeySelector: ISelector,
			outerKeySelector: ISelector,
			resultSelector: (item1: any, item2: any) => any,
			equalityComparer: IEqualityComparer): Enumerable;
		/**
		 * Correlates the elements of two sequences based on matching keys.
		 * WARNING: using the equality comparer will be slower
		 *
		 * @param {IterableType} iterable
		 * @param {ISelector} innerKeySelector
		 * @param {ISelector} outerKeySelector
		 * @param {(item1: any, item2: any) => any} resultSelector
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		join(iterable: IterableType,
			innerKeySelector: ISelector,
			outerKeySelector: ISelector,
			resultSelector: (item1: any, item2: any) => any,
			equalityComparer: IEqualityComparer): Enumerable;
		toLookup(): never;
	}


	/// Groups the elements of a sequence.
	Enumerable.prototype.groupBy = function (keySelector: ISelector): Enumerable {
		_ensureFunction(keySelector);
		const self: Enumerable = this;
		const gen = function* () {
			const groupMap = new Map<any, any>();
			let index = 0;
			for (const item of self) {
				const key = keySelector(item, index);
				const group = groupMap.get(key);
				if (group) {
					group.push(item);
				} else {
					groupMap.set(key, [item]);
				}
				index++;
			}
			for (const [key, items] of groupMap) {
				const group = new GroupEnumerable(items, key);
				yield group;
			}
		};
		const result = new Enumerable(gen);
		return result;
	}

	/// Correlates the elements of two sequences based on key equality and groups the results. A specified equalityComparer is used to compare keys.
	/// WARNING: using the equality comparer will be slower
	Enumerable.prototype.groupJoin = function (iterable: IterableType,
		innerKeySelector: ISelector,
		outerKeySelector: ISelector,
		resultSelector: (item1: any, item2: any) => any,
		equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {

		const self: Enumerable = this;
		const gen = equalityComparer === EqualityComparer.default
			? function* () {
				const lookup = new Enumerable(iterable)
					.groupBy(outerKeySelector)
					.toMap(g => g.key, g => g);
				let index = 0;
				for (const innerItem of self) {
					const arr = _toArray(lookup.get(innerKeySelector(innerItem, index)));
					yield resultSelector(innerItem, arr);
					index++;
				}
			}
			: function* () {
				let innerIndex = 0;
				for (const innerItem of self) {
					const arr = [];
					let outerIndex = 0;
					for (const outerItem of Enumerable.from(iterable)) {
						if (equalityComparer(innerKeySelector(innerItem, innerIndex), outerKeySelector(outerItem, outerIndex))) {
							arr.push(outerItem);
						}
						outerIndex++;
					}
					yield resultSelector(innerItem, arr);
					innerIndex++;
				}
			};
		return new Enumerable(gen);
	}

	/// Correlates the elements of two sequences based on matching keys.
	/// WARNING: using the equality comparer will be slower
	Enumerable.prototype.join = function (iterable: IterableType,
		innerKeySelector: ISelector,
		outerKeySelector: ISelector,
		resultSelector: (item1: any, item2: any) => any,
		equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {
		const self: Enumerable = this;
		const gen = equalityComparer === EqualityComparer.default
			? function* () {
				const lookup = new Enumerable(iterable)
					.groupBy(outerKeySelector)
					.toMap(g => g.key, g => g);
				let index = 0;
				for (const innerItem of self) {
					const group = lookup.get(innerKeySelector(innerItem, index));
					if (group) {
						for (const outerItem of group) {
							yield resultSelector(innerItem, outerItem);
						}
					}
					index++;
				}
			}
			: function* () {
				let innerIndex = 0;
				for (const innerItem of self) {
					let outerIndex = 0;
					for (const outerItem of Enumerable.from(iterable)) {
						if (equalityComparer(innerKeySelector(innerItem, innerIndex), outerKeySelector(outerItem, outerIndex))) {
							yield resultSelector(innerItem, outerItem);
						}
						outerIndex++;
					}
					innerIndex++;
				}
			};
		return new Enumerable(gen);
	}


	Enumerable.prototype.toLookup = function (): never {
		throw new Error('use groupBy instead of toLookup');
	}

	/**
	 * An Enumerable that also exposes a group key
	 *
	 * @export
	 * @class GroupEnumerable
	 * @extends {Enumerable}
	 */
	export class GroupEnumerable extends Enumerable {
		key: string;
		constructor(iterable: IterableType, key: string) {
			super(iterable);
			this.key = key;
		}
	}
}