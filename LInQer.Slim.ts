namespace Linqer {

	/**
	 * wrapper class over iterable instances that exposes the methods usually found in .NET LINQ
	 *
	 * @export
	 * @class Enumerable
	 * @implements {Iterable<any>}
	 * @implements {IUsesQuickSort}
	 */
	export class Enumerable implements Iterable<any>, IUsesQuickSort {
		_src: IterableType;
		_generator: () => Iterator<any>;
		_useQuickSort: boolean;
		_canSeek: boolean;
		_count: null | (() => number);
		_tryGetAt: null | ((index: number) => { value: any } | null);
		_wasIterated: boolean;

		/**
		 * sort an array in place using the Enumerable sort algorithm (Quicksort)
		 *
		 * @static
		 * @memberof Enumerable
		 */
		static sort: (arr: any[], comparer?: IComparer) => any[];
		
		/**
		 * You should never use this. Instead use Enumerable.from
		 * @param {IterableType} src
		 * @memberof Enumerable
		 */
		constructor(src: IterableType) {
			_ensureIterable(src);
			this._src = src;
			const iteratorFunction: (() => Iterator<any>) = (src as Iterable<any>)[Symbol.iterator];
			if (iteratorFunction) {
				this._generator = iteratorFunction.bind(src);
			} else {
				this._generator = src as (() => Iterator<any>);
			}
			this._useQuickSort = (src as IUsesQuickSort)._useQuickSort !== undefined
				? (src as IUsesQuickSort)._useQuickSort
				: true;
			this._canSeek = false;
			this._count = null;
			this._tryGetAt = null;
			this._wasIterated = false;
		}

		/**
		 * Wraps an iterable item into an Enumerable if it's not already one
		 *
		 * @static
		 * @param {IterableType} iterable
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		static from(iterable: IterableType): Enumerable {
			if (iterable instanceof Enumerable) return iterable;
			return new Enumerable(iterable);
		}
		
		/**
		 * the Enumerable instance exposes the same iterator as the wrapped iterable or generator function 
		 *
		 * @returns {Iterator<any>}
		 * @memberof Enumerable
		 */
		[Symbol.iterator](): Iterator<any> {
			this._wasIterated = true;
			return this._generator();
		}

		/**
		 * returns an empty Enumerable
		 *
		 * @static
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		static empty(): Enumerable {
			const result = new Enumerable([]);
			result._count = () => 0;
			result._tryGetAt = (index: number) => null;
			result._canSeek = true;
			return result;
		}

		/**
		 * generates a sequence of integer numbers within a specified range.
		 *
		 * @static
		 * @param {number} start
		 * @param {number} count
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		static range(start: number, count: number): Enumerable {
			const gen = function* () {
				for (let i = 0; i < count; i++) {
					yield start + i;
				}
			};
			const result = new Enumerable(gen);
			result._count = () => count;
			result._tryGetAt = index => {
				if (index >= 0 && index < count) return { value: start + index };
				return null;
			};
			result._canSeek = true;
			return result;
		}

		/**
		 *  Generates a sequence that contains one repeated value.
		 *
		 * @static
		 * @param {*} item
		 * @param {number} count
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		static repeat(item: any, count: number): Enumerable {
			const gen = function* () {
				for (let i = 0; i < count; i++) {
					yield item;
				}
			};
			const result = new Enumerable(gen);
			result._count = () => count;
			result._tryGetAt = index => {
				if (index >= 0 && index < count) return { value: item };
				return null;
			};
			result._canSeek = true;
			return result;
		}

		/**
		 * Same value as count(), but will throw an Error if enumerable is not seekable and has to be iterated to get the length
		 */
		get length():number {
			_ensureInternalTryGetAt(this);
			if (!this._canSeek) throw new Error('Calling length on this enumerable will iterate it. Use count()');
			return this.count();
		}
		
		/**
		 * Concatenates two sequences by appending iterable to the existing one.
		 *
		 * @param {IterableType} iterable
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		concat(iterable: IterableType): Enumerable {
			_ensureIterable(iterable);
			const self: Enumerable = this;
			const gen = function* () {
				for (const item of self) {
					yield item;
				}
				for (const item of Enumerable.from(iterable)) {
					yield item;
				}
			};
			const result = new Enumerable(gen);
			const other = Enumerable.from(iterable);
			result._count = () => self.count() + other.count();
			_ensureInternalTryGetAt(this);
			_ensureInternalTryGetAt(other);
			result._canSeek = self._canSeek && other._canSeek;
			if (self._canSeek) {
				result._tryGetAt = index => {
					return self._tryGetAt!(index) || other._tryGetAt!(index - self.count());
				};
			}
			return result;
		}

		
		/**
		 * Returns the number of elements in a sequence.
		 *
		 * @returns {number}
		 * @memberof Enumerable
		 */
		count(): number {
			_ensureInternalCount(this);
			return this._count!();
		}

		
		/**
		 * Returns distinct elements from a sequence.
		 * WARNING: using a comparer makes this slower. Not specifying it uses a Set to determine distinctiveness.
		 *
		 * @param {IEqualityComparer} [equalityComparer=EqualityComparer.default]
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		distinct(equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {
			const self: Enumerable = this;
			const gen = equalityComparer === EqualityComparer.default
				? function* () {
					const distinctValues = new Set();
					for (const item of self) {
						const size = distinctValues.size;
						distinctValues.add(item);
						if (size < distinctValues.size) {
							yield item;
						}
					}
				}
				: function* () {
					const values = [];
					for (const item of self) {
						let unique = true;
						for (let i=0; i<values.length; i++) {
							if (equalityComparer(item, values[i])) {
								unique = false;
								break;
							}
						}
						if (unique) yield item;
						values.push(item);
					}
				};
			return new Enumerable(gen);
		}

		
		/**
		 * Returns the element at a specified index in a sequence.
		 *
		 * @param {number} index
		 * @returns {*}
		 * @memberof Enumerable
		 */
		elementAt(index: number): any {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt!(index);
			if (!result) throw new Error('Index out of range');
			return result.value;
		}

		
		/**
		 * Returns the element at a specified index in a sequence or undefined if the index is out of range.
		 *
		 * @param {number} index
		 * @returns {(any | undefined)}
		 * @memberof Enumerable
		 */
		elementAtOrDefault(index: number): any | undefined {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt!(index);
			if (!result) return undefined;
			return result.value;
		}

		
		/**
		 * Returns the first element of a sequence.
		 *
		 * @returns {*}
		 * @memberof Enumerable
		 */
		first(): any {
			return this.elementAt(0);
		}

		
		/**
		 * Returns the first element of a sequence, or a default value if no element is found.
		 *
		 * @returns {(any | undefined)}
		 * @memberof Enumerable
		 */
		firstOrDefault(): any | undefined {
			return this.elementAtOrDefault(0);
		}

		
		/**
		 * Returns the last element of a sequence.
		 *
		 * @returns {*}
		 * @memberof Enumerable
		 */
		last(): any {
			_ensureInternalTryGetAt(this);
			if (!this._canSeek) {
				let result = null;
				let found = false;
				for (const item of this) {
					result = item;
					found = true;
				}
				if (found) return result;
				throw new Error('The enumeration is empty');
			}
			const count = this.count();
			return this.elementAt(count - 1);
		}

		
		/**
		 * Returns the last element of a sequence, or undefined if no element is found.
		 *
		 * @returns {(any | undefined)}
		 * @memberof Enumerable
		 */
		lastOrDefault(): any | undefined {
			_ensureInternalTryGetAt(this);
			if (!this._canSeek) {
				let result = undefined;
				for (const item of this) {
					result = item;
				}
				return result;
			}
			const count = this.count();
			return this.elementAtOrDefault(count - 1);
		}

		/**
		 * Returns the count, minimum and maximum value in a sequence of values.
		 * A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
		 *
		 * @param {IComparer} [comparer]
		 * @returns {{ count: number, min: any, max: any }}
		 * @memberof Enumerable
		 */
		stats(comparer?: IComparer): { count: number, min: any, max: any } {
			if (comparer) {
				_ensureFunction(comparer);
			} else {
				comparer = _defaultComparer;
			}
			const agg = {
				count: 0,
				min: undefined,
				max: undefined
			};
			for (const item of this) {
				if (typeof agg.min === 'undefined' || comparer(item, agg.min) < 0) agg.min = item;
				if (typeof agg.max === 'undefined' || comparer(item, agg.max) > 0) agg.max = item;
				agg.count++;
			}
			return agg;
		}

		/**
		 *  Returns the minimum value in a sequence of values.
		 *  A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)		
		 *
		 * @param {IComparer} [comparer]
		 * @returns {*}
		 * @memberof Enumerable
		 */
		min(comparer?: IComparer): any {
			const stats = this.stats(comparer);
			return stats.count === 0
				? undefined
				: stats.min;
		}

		
		/**
		 *  Returns the maximum value in a sequence of values.
		 *  A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
		 *
		 * @param {IComparer} [comparer]
		 * @returns {*}
		 * @memberof Enumerable
		 */
		max(comparer?: IComparer): any {
			const stats = this.stats(comparer);
			return stats.count === 0
				? undefined
				: stats.max;
		}

		
		/**
		 * Projects each element of a sequence into a new form.
		 *
		 * @param {ISelector} selector
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		select(selector: ISelector): Enumerable {
			_ensureFunction(selector);
			const self: Enumerable = this;
			const gen = function* () {
				let index = 0;
				for (const item of self) {
					yield selector(item, index);
					index++;
				}
			};
			const result = new Enumerable(gen);
			_ensureInternalCount(this);
			result._count = this._count;
			_ensureInternalTryGetAt(self);
			result._canSeek = self._canSeek;
			result._tryGetAt = index => {
				const res = self._tryGetAt!(index);
				if (!res) return res;
				return { value: selector(res.value) };
			};
			return result;
		}

		
		/**
		 * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
		 *
		 * @param {number} nr
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		skip(nr: number): Enumerable {
			const self: Enumerable = this;
			const gen = function* () {
				let nrLeft = nr;
				for (const item of self) {
					if (nrLeft > 0) {
						nrLeft--;
					} else {
						yield item;
					}
				}
			};
			const result = new Enumerable(gen);

			result._count = () => Math.max(0, self.count() - nr);
			_ensureInternalTryGetAt(this);
			result._canSeek = this._canSeek;
			result._tryGetAt = index => self._tryGetAt!(index + nr);
			return result;
		}
		
		
		/**
		 * Takes start elements, ignores howmany elements, continues with the new items and continues with the original enumerable
		 * Equivalent to the value of an array after performing splice on it with the same parameters
		 * @param start 
		 * @param howmany 
		 * @param items 
		 * @returns splice 
		 */
		splice(start: number, howmany: number, ...newItems:any[]) : Enumerable {
			return this.take(start).concat(newItems).concat(this.skip(start+howmany));
		}

		/**
		 * Computes the sum of a sequence of numeric values.
		 *
		 * @returns {(number | undefined)}
		 * @memberof Enumerable
		 */
		sum(): number | undefined {
			const stats = this.sumAndCount();
			return stats.count === 0
				? undefined
				: stats.sum;
		}

		
		/**
		 * Computes the sum and count of a sequence of numeric values.
		 *
		 * @returns {{ sum: number, count: number }}
		 * @memberof Enumerable
		 */
		sumAndCount(): { sum: number, count: number } {
			const agg = {
				count: 0,
				sum: 0
			};
			for (const item of this) {
				agg.sum = agg.count === 0
					? _toNumber(item)
					: agg.sum + _toNumber(item);
				agg.count++;
			}
			return agg;
		}

		
		/**
		 * Returns a specified number of contiguous elements from the start of a sequence.
		 *
		 * @param {number} nr
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		take(nr: number): Enumerable {
			const self: Enumerable = this;
			const gen = function* () {
				let nrLeft = nr;
				for (const item of self) {
					if (nrLeft > 0) {
						yield item;
						nrLeft--;
					}
					if (nrLeft <= 0) {
						break;
					}
				}
			};
			const result = new Enumerable(gen);

			result._count = () => Math.min(nr, self.count());
			_ensureInternalTryGetAt(this);
			result._canSeek = self._canSeek;
			if (self._canSeek) {
				result._tryGetAt = index => {
					if (index >= nr) return null;
					return self._tryGetAt!(index);
				};
			}
			return result;
		}

		
		/**
		 * creates an array from an Enumerable
		 *
		 * @returns {any[]}
		 * @memberof Enumerable
		 */
		toArray(): any[] {
			return Array.from(this);
		}

		
		/**
		 * similar to toArray, but returns a seekable Enumerable (itself if already seekable) that can do count and elementAt without iterating
		 *
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		toList(): Enumerable {
			_ensureInternalTryGetAt(this);
			if (this._canSeek) return this;
			return Enumerable.from(Array.from(this));
		}
		
		/**
		 * Filters a sequence of values based on a predicate.
		 *
		 * @param {IFilter} condition
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		where(condition: IFilter): Enumerable {
			_ensureFunction(condition);
			const self: Enumerable = this;
			const gen = function* () {
				let index = 0;
				for (const item of self) {
					if (condition(item, index)) {
						yield item;
					}
					index++;
				}
			};
			return new Enumerable(gen);
		}
	}

	export function _ensureIterable(src: IterableType): void {
		if (src) {
			if ((src as Iterable<any>)[Symbol.iterator]) return;
			if (typeof src === 'function' && (src as Function).constructor.name === 'GeneratorFunction') return;
		}
		throw new Error('the argument must be iterable!');
	}
	export function _ensureFunction(f: Function): void {
		if (!f || typeof f !== 'function') throw new Error('the argument needs to be a function!');
	}
	function _toNumber(obj: any): number {
		return typeof obj === 'number'
			? obj
			: Number.NaN;
	}
	export function _toArray(enumerable: IterableType) {
		if (!enumerable) return [];
		if (Array.isArray(enumerable)) return enumerable;
		return Array.from(enumerable);
	}
	export function _ensureInternalCount(enumerable: Enumerable) {
		if (enumerable._count) return;
		if (enumerable._src instanceof Enumerable) {
			const innerEnumerable = enumerable._src as Enumerable;
			_ensureInternalCount(innerEnumerable);
			enumerable._count = () => innerEnumerable._count!();
			return;
		}
		const src = enumerable._src as any;
		if (typeof src !== 'function' && typeof src.length === 'number') {
			enumerable._count = () => src.length;
			return;
		}
		if (typeof src.size === 'number') {
			enumerable._count = () => src.size;
			return;
		}
		enumerable._count = () => {
			let x = 0;
			for (const item of enumerable) x++;
			return x;
		};
	}
	export function _ensureInternalTryGetAt(enumerable: Enumerable) {
		if (enumerable._tryGetAt) return;
		enumerable._canSeek = true;
		if (enumerable._src instanceof Enumerable) {
			const innerEnumerable = enumerable._src as Enumerable;
			_ensureInternalTryGetAt(innerEnumerable);
			enumerable._tryGetAt = index => innerEnumerable._tryGetAt!(index);
			enumerable._canSeek = innerEnumerable._canSeek;
			return;
		}
		if (typeof enumerable._src === 'string') {
			enumerable._tryGetAt = index => {
				if (index < (enumerable._src as string).length) {
					return { value: (enumerable._src as string).charAt(index) };
				}
				return null;
			};
			return;
		}
		if (Array.isArray(enumerable._src)) {
			enumerable._tryGetAt = index => {
				if (index >= 0 && index < (enumerable._src as any[]).length) {
					return { value: (enumerable._src as any[])[index] };
				}
				return null;
			};
			return;
		}
		const src = enumerable._src as any;
		if (typeof enumerable._src !== 'function' && typeof src.length === 'number') {
			enumerable._tryGetAt = index => {
				if (index < src.length && typeof src[index] !== 'undefined') {
					return { value: src[index] };
				}
				return null;
			};
			return;
		}
		enumerable._canSeek = false;
		// TODO other specialized types? objects, maps, sets?
		enumerable._tryGetAt = index => {
			let x = 0;
			for (const item of enumerable) {
				if (index === x) return { value: item };
				x++;
			}
			return null;
		}
	}

	/**
	 * an extended iterable type that also supports generator functions
	 */
	export type IterableType = Iterable<any> | (() => Iterator<any>) | Enumerable;

	/**
	 * A comparer function to be used in sorting
	 */
	export type IComparer = (item1: any, item2: any) => -1 | 0 | 1;
	/**
	 * A selector function to be used in mapping
	 */
	export type ISelector<T = any> = (item: any, index?: number) => T;
	/**
	 * A filter function
	 */
	export type IFilter = ISelector<boolean>;

	/**
	 * The default comparer function between two items
	 * @param item1 
	 * @param item2 
	 */
	export const _defaultComparer: IComparer = (item1, item2) => {
		if (item1 > item2) return 1;
		if (item1 < item2) return -1;
		return 0;
	};

	/**
	 * Interface for an equality comparer
	 */
	export type IEqualityComparer = (item1: any, item2: any) => boolean;

	/**
	 * Predefined equality comparers
	 * default is the equivalent of ==
	 * exact is the equivalent of ===
	 */
	export const EqualityComparer = {
		default: (item1: any, item2: any) => item1 == item2,
		exact: (item1: any, item2: any) => item1 === item2,
	};

	interface IUsesQuickSort {
		_useQuickSort: boolean;
	}
}