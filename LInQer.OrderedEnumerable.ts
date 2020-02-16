/// <reference path="./LInQer.Slim.ts" />
namespace Linqer {

	export interface Enumerable extends Iterable<any> {
		/**
		 * Sorts the elements of a sequence in ascending order.
		 *
		 * @param {ISelector} keySelector
		 * @returns {OrderedEnumerable}
		 * @memberof Enumerable
		 */
		orderBy(keySelector: ISelector): OrderedEnumerable;
		/**
		 * Sorts the elements of a sequence in descending order.
		 *
		 * @param {ISelector} keySelector
		 * @returns {OrderedEnumerable}
		 * @memberof Enumerable
		 */
		orderByDescending(keySelector: ISelector): OrderedEnumerable;
		/**
		 * use QuickSort for ordering (default). Recommended when take, skip, takeLast, skipLast are used after orderBy
		 *
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		useQuickSort(): Enumerable;
		/**
		 * use the default browser sort implementation for ordering at all times
		 *
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		useBrowserSort(): Enumerable;
	}


	/// Sorts the elements of a sequence in ascending order.
	Enumerable.prototype.orderBy = function (keySelector: ISelector): OrderedEnumerable {
		if (keySelector) {
			_ensureFunction(keySelector);
		} else {
			keySelector = item => item;
		}
		return new OrderedEnumerable(this, keySelector, true);
	};

	/// Sorts the elements of a sequence in descending order.
	Enumerable.prototype.orderByDescending = function (keySelector: ISelector): OrderedEnumerable {
		if (keySelector) {
			_ensureFunction(keySelector);
		} else {
			keySelector = item => item;
		}
		return new OrderedEnumerable(this, keySelector, false);
	};

	/// use QuickSort for ordering (default). Recommended when take, skip, takeLast, skipLast are used after orderBy
	Enumerable.prototype.useQuickSort = function (): Enumerable {
		this._useQuickSort = true;
		return this;
	};

	/// use the default browser sort implementation for ordering at all times
	Enumerable.prototype.useBrowserSort = function (): Enumerable {
		this._useQuickSort = false;
		return this;
	};


	//static sort: (arr: any[], comparer?: IComparer) => void;
	Enumerable.sort = function (arr: any[], comparer: IComparer = _defaultComparer): any[] {
		_quickSort(arr, 0, arr.length - 1, comparer, 0, Number.MAX_SAFE_INTEGER);
		return arr;
	}

	enum RestrictionType {
		skip,
		skipLast,
		take,
		takeLast
	}

	/**
	 * An Enumerable yielding ordered items
	 *
	 * @export
	 * @class OrderedEnumerable
	 * @extends {Enumerable}
	 */
	export class OrderedEnumerable extends Enumerable {
		_keySelectors: { keySelector: ISelector, ascending: boolean }[];
		_restrictions: { type: RestrictionType, nr: number }[];

		/**
		 *Creates an instance of OrderedEnumerable.
		 * @param {IterableType} src
		 * @param {ISelector} [keySelector]
		 * @param {boolean} [ascending=true]
		 * @memberof OrderedEnumerable
		 */
		constructor(src: IterableType,
			keySelector?: ISelector,
			ascending: boolean = true) {
			super(src);
			this._keySelectors = [];
			this._restrictions = [];
			if (keySelector) {
				this._keySelectors.push({ keySelector: keySelector, ascending: ascending });
			}
			const self: OrderedEnumerable = this;
			this._generator = function* () {
				let { startIndex, endIndex, arr } = this.getSortedArray();
				if (arr) {
					for (let index = startIndex; index < endIndex; index++) {
						yield arr[index];
					}
				}
			};

			this._count = () => {
				const totalCount = Enumerable.from(self._src).count();
				const { startIndex, endIndex } = this.getStartAndEndIndexes(self._restrictions, totalCount);
				return endIndex - startIndex;
			};
			this._canSeek=false;
			this._tryGetAt = ()=>{ throw new Error('Ordered enumerables cannot seek'); };
		}

		private getSortedArray() {
			const self = this;
			let startIndex: number;
			let endIndex: number;
			let arr: any[] | null = null;
			const innerEnumerable = self._src as Enumerable;
			_ensureInternalTryGetAt(innerEnumerable);
			if (innerEnumerable._canSeek) {
				({ startIndex, endIndex } = self.getStartAndEndIndexes(self._restrictions, innerEnumerable.count()));
			} else {
				arr = Array.from(self._src);
				({ startIndex, endIndex } = self.getStartAndEndIndexes(self._restrictions, arr.length));
			}
			if (startIndex < endIndex) {
				if (!arr) {
					arr = Array.from(self._src);
				}
				const sort: (item1: any, item2: any) => void = self._useQuickSort
					? (a, c) => _quickSort(a, 0, a.length - 1, c, startIndex, endIndex)
					: (a, c) => a.sort(c);
				const sortFunc = self.generateSortFunc(self._keySelectors);
				sort(arr, sortFunc);
				return {
					startIndex,
					endIndex,
					arr
				};
			} else {
				return {
					startIndex,
					endIndex,
					arr: null
				};
			}
		}

		private generateSortFunc(selectors: { keySelector: ISelector, ascending: boolean }[]): (i1: any, i2: any) => number {
			const comparers = selectors.map(s => {
				const f = s.keySelector;
				const comparer = (i1: any, i2: any) => {
					const k1 = f(i1);
					const k2 = f(i2);
					if (k1 > k2) return 1;
					if (k1 < k2) return -1;
					return 0;
				};
				return s.ascending
					? comparer
					: (i1: any, i2: any) => -comparer(i1, i2);
			});
			return comparers.length == 1
				? comparers[0]
				: (i1: any, i2: any) => {
					for (let i = 0; i < comparers.length; i++) {
						const v = comparers[i](i1, i2);
						if (v) return v;
					}
					return 0;
				};
		}

		private getStartAndEndIndexes(restrictions: { type: RestrictionType, nr: number }[], arrLength: number) {
			let startIndex = 0;
			let endIndex = arrLength;
			for (const restriction of restrictions) {
				switch (restriction.type) {
					case RestrictionType.take:
						endIndex = Math.min(endIndex, startIndex + restriction.nr);
						break;
					case RestrictionType.skip:
						startIndex = Math.min(endIndex, startIndex + restriction.nr);
						break;
					case RestrictionType.takeLast:
						startIndex = Math.max(startIndex, endIndex - restriction.nr);
						break;
					case RestrictionType.skipLast:
						endIndex = Math.max(startIndex, endIndex - restriction.nr);
						break;
				}
			}
			return { startIndex, endIndex };
		}


		/**
		 * Performs a subsequent ordering of the elements in a sequence in ascending order.
		 *
		 * @param {ISelector} keySelector
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		thenBy(keySelector: ISelector): OrderedEnumerable {
			this._keySelectors.push({ keySelector: keySelector, ascending: true });
			return this;
		}
		/**
		 * Performs a subsequent ordering of the elements in a sequence in descending order.
		 *
		 * @param {ISelector} keySelector
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		thenByDescending(keySelector: ISelector): OrderedEnumerable {
			this._keySelectors.push({ keySelector: keySelector, ascending: false });
			return this;
		}

		/**
		 * Deferred and optimized implementation of take
		 *
		 * @param {number} nr
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		take(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.take, nr: nr });
			return this;
		}

		/**
		 * Deferred and optimized implementation of takeLast
		 *
		 * @param {number} nr
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		takeLast(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.takeLast, nr: nr });
			return this;
		}

		/**
		 * Deferred and optimized implementation of skip
		 *
		 * @param {number} nr
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		skip(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.skip, nr: nr });
			return this;
		}

		/**
		 * Deferred and optimized implementation of skipLast
		 *
		 * @param {number} nr
		 * @returns {OrderedEnumerable}
		 * @memberof OrderedEnumerable
		 */
		skipLast(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.skipLast, nr: nr });
			return this;
		}


		/**
		 * An optimized implementation of toArray
		 *
		 * @returns {any[]}
		 * @memberof OrderedEnumerable
		 */
		toArray(): any[] {
			const { startIndex, endIndex, arr } = this.getSortedArray();
			return arr
				? arr.slice(startIndex, endIndex)
				: [];
		}


		/**
		 * An optimized implementation of toMap
		 *
		 * @param {ISelector} keySelector
		 * @param {ISelector} [valueSelector=x => x]
		 * @returns {Map<any, any>}
		 * @memberof OrderedEnumerable
		 */
		toMap(keySelector: ISelector, valueSelector: ISelector = x => x): Map<any, any> {
			_ensureFunction(keySelector);
			_ensureFunction(valueSelector);
			const result = new Map<any, any>();
			const arr = this.toArray();
			for (let i = 0; i < arr.length; i++) {
				result.set(keySelector(arr[i], i), valueSelector(arr[i], i));
			}
			return result;
		}


		/**
		 * An optimized implementation of toObject
		 *
		 * @param {ISelector} keySelector
		 * @param {ISelector} [valueSelector=x => x]
		 * @returns {{ [key: string]: any }}
		 * @memberof OrderedEnumerable
		 */
		toObject(keySelector: ISelector, valueSelector: ISelector = x => x): { [key: string]: any } {
			_ensureFunction(keySelector);
			_ensureFunction(valueSelector);
			const result: { [key: string]: any } = {};
			const arr = this.toArray();
			for (let i = 0; i < arr.length; i++) {
				result[keySelector(arr[i], i)] = valueSelector(arr[i], i);
			}
			return result;
		}


		/**
		 * An optimized implementation of to Set
		 *
		 * @returns {Set<any>}
		 * @memberof OrderedEnumerable
		 */
		toSet(): Set<any> {
			const result = new Set<any>();
			const arr = this.toArray();
			for (let i = 0; i < arr.length; i++) {
				result.add(arr[i]);
			}
			return result;
		}

	}

	function _ensureFunction(f: Function): void {
		if (!f || typeof f !== 'function') throw new Error('the argument needs to be a function!');
	}
	function _insertionsort(arr: any[], leftIndex: number, rightIndex: number, comparer: IComparer) {
		for (let j = leftIndex; j <= rightIndex; j++) {
			// Invariant: arr[:j] contains the same elements as
			// the original slice arr[:j], but in sorted order.
			const key = arr[j];
			let i = j - 1;
			while (i >= leftIndex && comparer(arr[i], key) > 0) {
				arr[i + 1] = arr[i];
				i--;
			}
			arr[i + 1] = key;
		}
	}

	function _swapArrayItems(array: any[], leftIndex: number, rightIndex: number): void {
		const temp = array[leftIndex];
		array[leftIndex] = array[rightIndex];
		array[rightIndex] = temp;
	}
	function _partition(items: any[], left: number, right: number, comparer: IComparer) {
		const pivot = items[(right + left) >> 1];
		while (left <= right) {
			while (comparer(items[left], pivot) < 0) {
				left++;
			}
			while (comparer(items[right], pivot) > 0) {
				right--;
			}
			if (left < right) {
				_swapArrayItems(items, left, right);
				left++;
				right--;
			} else {
				if (left === right) return left + 1;
			}
		}
		return left;
	}

	const _insertionSortThreshold = 64;

	function _quickSort(items: any[], left: number, right: number, comparer: IComparer = _defaultComparer, minIndex: number = 0, maxIndex: number = Number.MAX_SAFE_INTEGER) {
		if (!items.length) return items;

		const partitions: { left: number, right: number }[] = [];
		partitions.push({ left, right });
		let size = 1;
		while (size) {
			const partition = { left, right } = partitions[size-1];
			if (right - left < _insertionSortThreshold) {
				_insertionsort(items, left, right, comparer);
				size--;
				continue;
			}
			const index = _partition(items, left, right, comparer);
			if (left < index - 1 && index - 1 >= minIndex) { //more elements on the left side of the pivot
				partition.right = index - 1;
				if (index < right && index < maxIndex) { //more elements on the right side of the pivot
					partitions[size]={ left: index, right };
					size++;
				}
			} else {
				if (index < right && index < maxIndex) { //more elements on the right side of the pivot
					partition.left = index;
				} else {
					size--;
				}
			}
		}
		return items;
	}

}