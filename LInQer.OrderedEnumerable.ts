/// <reference path="./LInQer.Slim.ts" />

namespace Linqer {

	export interface Enumerable extends Iterable<any> {
		orderBy(keySelector: ISelector): OrderedEnumerable;
		orderByDescending(keySelector: ISelector): OrderedEnumerable;
		useQuickSort(): Enumerable;
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

	/// use QuickSort for ordering (default) if take, skip, takeLast, skipLast are used
	Enumerable.prototype.useQuickSort = function (): Enumerable {
		this._useQuickSort = true;
		return this;
	};

	/// use the default browser sort implementation for ordering at all times
	/// removes QuickSort optimization when take, skip, takeLast, skipLast are used
	Enumerable.prototype.useBrowserSort = function (): Enumerable {
		this._useQuickSort = false;
		return this;
	};

	enum RestrictionType {
		skip,
		skipLast,
		take,
		takeLast
	}

	export class OrderedEnumerable extends Enumerable {
		_keySelectors: { keySelector: ISelector, ascending: boolean }[];
		_restrictions: { type: RestrictionType, nr: number }[];

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
				const arr = Array.from(this._src);
				const { startIndex, endIndex } = this.getStartAndEndIndexes(self._restrictions, arr.length);
				if (startIndex < endIndex) {
					// only use QuickSort as an optimization for take, skip, takeLast, skipLast
					const sort: (item1: any, item2: any) => void = this._useQuickSort && this._restrictions.length
						? (a, c) => _quickSort(a, 0, a.length - 1, c, startIndex, endIndex)
						: (a, c) => a.sort(c);
					const sortFunc = this.generateSortFunc(self._keySelectors);
					sort(arr, sortFunc);
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
		}

		private generateSortFunc(selectors: { keySelector: ISelector, ascending: boolean }[]): (i1: any, i2: any)=> number {
			const comparers = selectors.map(s=>{
				const f = s.keySelector;
				const comparer  = (i1:any,i2:any)=> {
					const k1 = f(i1);
					const k2 = f(i2);
					if (k1>k2) return 1;
					if (k1<k2) return -1;
					return 0;
				};
				return s.ascending
					? comparer
					: (i1:any,i2:any)=> -comparer(i1,i2);
			});
			return (i1: any, i2: any) => {
				for (const comparer of comparers) {
					const v = comparer(i1,i2);
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

		/// Performs a subsequent ordering of the elements in a sequence in ascending order.
		thenBy(keySelector: ISelector): OrderedEnumerable {
			this._keySelectors.push({ keySelector: keySelector, ascending: true });
			return this;
		}
		/// Performs a subsequent ordering of the elements in a sequence in descending order.
		thenByDescending(keySelector: ISelector): OrderedEnumerable {
			this._keySelectors.push({ keySelector: keySelector, ascending: false });
			return this;
		}
		/// Deferred and optimized implementation of take
		take(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.take, nr: nr });
			return this;
		}
		/// Deferred and optimized implementation of takeLast
		takeLast(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.takeLast, nr: nr });
			return this;
		}
		/// Deferred and optimized implementation of skip
		skip(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.skip, nr: nr });
			return this;
		}
		/// Deferred and optimized implementation of skipLast
		skipLast(nr: number): OrderedEnumerable {
			this._restrictions.push({ type: RestrictionType.skipLast, nr: nr });
			return this;
		}
	}

	function _ensureFunction(f: Function): void {
		if (!f || typeof f !== 'function') throw new Error('the argument needs to be a function!');
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
	function _quickSort(items: any[], left: number, right: number, comparer: IComparer = _defaultComparer, minIndex: number = 0, maxIndex: number = Number.MAX_SAFE_INTEGER) {
		if (!items.length) return items;

		const partitions = [];
		partitions.push([left, right]);
		let partitionIndex = 0;
		while (partitionIndex < partitions.length) {
			[left, right] = partitions[partitionIndex];
			const index = _partition(items, left, right, comparer); //index returned from partition
			if (left < index - 1 && index - 1 >= minIndex) { //more elements on the left side of the pivot
				partitions.push([left, index - 1]);
			}
			if (index < right && index < maxIndex) { //more elements on the right side of the pivot
				partitions.push([index, right]);
			}
			partitionIndex++;
		}
		return items;
	}
}