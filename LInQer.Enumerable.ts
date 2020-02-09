/// <reference path="./LInQer.Slim.ts" />

namespace Linqer {

	export interface Enumerable extends Iterable<any> {
		/**
		 * Applies an accumulator function over a sequence.
		 * The specified seed value is used as the initial accumulator value, and the specified function is used to select the result value.
		 *
		 * @param {*} accumulator
		 * @param {(acc: any, item: any) => any} aggregator
		 * @returns {*}
		 * @memberof Enumerable
		 */
		aggregate(accumulator: any, aggregator: (acc: any, item: any) => any): any;
		/**
		 * Determines whether all elements of a sequence satisfy a condition.
		 * @param condition 
		 * @returns true if all 
		 */
		all(condition: IFilter): boolean;
		/**
		 * Determines whether any element of a sequence exists or satisfies a condition.
		 *
		 * @param {IFilter} condition
		 * @returns {boolean}
		 * @memberof Enumerable
		 */
		any(condition: IFilter): boolean;
		/**
		 * Appends a value to the end of the sequence.
		 *
		 * @param {*} item
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		append(item: any): Enumerable;
		/**
		 * Computes the average of a sequence of numeric values.
		 *
		 * @returns {(number | undefined)}
		 * @memberof Enumerable
		 */
		average(): number | undefined;
		/**
		 * Returns itself
		 *
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		asEnumerable(): Enumerable;
		/**
 		 * Checks the elements of a sequence based on their type
		 *  If type is a string, it will check based on typeof, else it will use instanceof.
		 *  Throws if types are different.
		 * @param {(string | Function)} type
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		cast(type: string | Function): Enumerable;
		/**
		 * Determines whether a sequence contains a specified element.
		 * A custom function can be used to determine equality between elements.
		 *
		 * @param {*} item
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {boolean}
		 * @memberof Enumerable
		 */
		contains(item: any, equalityComparer: IEqualityComparer): boolean;
		defaultIfEmpty(): never;
		/**
		 * Produces the set difference of two sequences
		 * WARNING: using the comparer is slower
		 *
		 * @param {IterableType} iterable
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		except(iterable: IterableType, equalityComparer: IEqualityComparer): Enumerable;
		/**
		 * Produces the set intersection of two sequences.
		 * WARNING: using a comparer is slower
		 *
		 * @param {IterableType} iterable
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		intersect(iterable: IterableType, equalityComparer: IEqualityComparer): Enumerable;
		/**
		 * Same as count
		 *
		 * @returns {number}
		 * @memberof Enumerable
		 */
		longCount(): number;
		/**
		 * Filters the elements of a sequence based on their type
		 * If type is a string, it will filter based on typeof, else it will use instanceof
		 *
		 * @param {(string | Function)} type
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		ofType(type: string | Function): Enumerable;
		/**
		 * Adds a value to the beginning of the sequence.
		 *
		 * @param {*} item
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		prepend(item: any): Enumerable;
		/**
		 * Inverts the order of the elements in a sequence.
		 *
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		reverse(): Enumerable;
		/**
		 * Projects each element of a sequence to an iterable and flattens the resulting sequences into one sequence.
		 *
		 * @param {ISelector<IterableType>} selector
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		selectMany(selector: ISelector<IterableType>): Enumerable;
		/**
		 * Determines whether two sequences are equal and in the same order according to an optional equality comparer.
		 *
		 * @param {IterableType} iterable
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {boolean}
		 * @memberof Enumerable
		 */
		sequenceEqual(iterable: IterableType, equalityComparer: IEqualityComparer): boolean;
		/**
		 * Returns the single element of a sequence and throws if it doesn't have exactly one
		 *
		 * @returns {*}
		 * @memberof Enumerable
		 */
		single(): any;
		/**
		 * Returns the single element of a sequence or undefined if none found. It throws if the sequence contains multiple items.
		 *
		 * @returns {(any | undefined)}
		 * @memberof Enumerable
		 */
		singleOrDefault(): any | undefined;
		/**
		 * Returns a new enumerable collection that contains the elements from source with the last nr elements of the source collection omitted.
		 *
		 * @param {number} nr
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		skipLast(nr: number): Enumerable;
		/**
		 * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
		 *
		 * @param {IFilter} condition
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		skipWhile(condition: IFilter): Enumerable;
		/**
		 * Returns a new enumerable collection that contains the last nr elements from source.
		 *
		 * @param {number} nr
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		takeLast(nr: number): Enumerable;
		/**
		 * Returns elements from a sequence as long as a specified condition is true, and then skips the remaining elements.
		 *
		 * @param {IFilter} condition
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		takeWhile(condition: IFilter): Enumerable;
		toDictionary(): never;
		/**
		 * creates a Map from an Enumerable
		 *
		 * @param {ISelector} keySelector
		 * @param {ISelector} valueSelector
		 * @returns {Map<any, any>}
		 * @memberof Enumerable
		 */
		toMap(keySelector: ISelector, valueSelector: ISelector): Map<any, any>;
		/**
		 * creates an object from an Enumerable
		 *
		 * @param {ISelector} keySelector
		 * @param {ISelector} valueSelector
		 * @returns {{ [key: string]: any }}
		 * @memberof Enumerable
		 */
		toObject(keySelector: ISelector, valueSelector: ISelector): { [key: string]: any };
		toHashSet(): never;
		/**
		 * creates a Set from an enumerable
		 *
		 * @returns {Set<any>}
		 * @memberof Enumerable
		 */
		toSet(): Set<any>;
		/**
		 * Produces the set union of two sequences.
		 *
		 * @param {IterableType} iterable
		 * @param {IEqualityComparer} equalityComparer
		 * @returns {Enumerable}
		 * @memberof Enumerable
		 */
		union(iterable: IterableType, equalityComparer: IEqualityComparer): Enumerable;
		/**
		 * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
		 *
		 * @param {IterableType} iterable
		 * @param {(item1: any, item2: any, index: number) => any} zipper
		 * @returns {*}
		 * @memberof Enumerable
		 */
		zip(iterable: IterableType, zipper: (item1: any, item2: any, index: number) => any): any;

	}

	/// Applies an accumulator function over a sequence.
	/// The specified seed value is used as the initial accumulator value, and the specified function is used to select the result value.
	Enumerable.prototype.aggregate = function (accumulator: any, aggregator: (acc: any, item: any) => any): any {
		_ensureFunction(aggregator);
		for (const item of this) {
			accumulator = aggregator(accumulator, item);
		}
		return accumulator;
	}

	/// Determines whether all elements of a sequence satisfy a condition.
	Enumerable.prototype.all = function (condition: IFilter): boolean {
		_ensureFunction(condition);
		return !this.any(x => !condition(x));
	}

	/// Determines whether any element of a sequence exists or satisfies a condition.
	Enumerable.prototype.any = function (condition: IFilter): boolean {
		_ensureFunction(condition);
		let index = 0;
		for (const item of this) {
			if (condition(item, index)) return true;
			index++;
		}
		return false;
	}

	/// Appends a value to the end of the sequence.
	Enumerable.prototype.append = function (item: any): Enumerable {
		return this.concat([item]);
	}

	/// Computes the average of a sequence of numeric values.
	Enumerable.prototype.average = function (): number | undefined {
		const stats = this.sumAndCount();
		return stats.count === 0
			? undefined
			: stats.sum / stats.count;
	}

	/// Returns the same enumerable
	Enumerable.prototype.asEnumerable = function (): Enumerable {
		return this;
	}

	/// Checks the elements of a sequence based on their type
	/// If type is a string, it will check based on typeof, else it will use instanceof.
	/// Throws if types are different.
	Enumerable.prototype.cast = function (type: string | Function): Enumerable {
		const f: ((x: any) => boolean) = typeof type === 'string'
			? x => typeof x === type
			: x => x instanceof type;
		return this.select(item => {
			if (!f(item)) throw new Error(item + ' not of type ' + type);
			return item;
		});
	}

	/// Determines whether a sequence contains a specified element.
	/// A custom function can be used to determine equality between elements.
	Enumerable.prototype.contains = function (item: any, equalityComparer: IEqualityComparer = EqualityComparer.default): boolean {
		_ensureFunction(equalityComparer);
		return this.any(x => equalityComparer(x, item));
	}

	Enumerable.prototype.defaultIfEmpty = function (): never {
		throw new Error('defaultIfEmpty not implemented for Javascript');
	}

	/// Produces the set difference of two sequences WARNING: using the comparer is slower
	Enumerable.prototype.except = function (iterable: IterableType, equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {
		_ensureIterable(iterable);
		const self: Enumerable = this;
		const gen = equalityComparer === EqualityComparer.default
			? function* () {
				const distinctValues = Enumerable.from(iterable).toSet();
				for (const item of self) {
					if (!distinctValues.has(item)) yield item;
				}
			}
			: function* () {
				const values = _toArray(iterable);
				for (const item of self) {
					let unique = true;
					for (let i=0; i<values.length; i++) {
						if (equalityComparer(item, values[i])) {
							unique = false;
							break;
						}
					}
					if (unique) yield item;
				}
			};
		return new Enumerable(gen);
	}

	/// Produces the set intersection of two sequences. WARNING: using a comparer is slower
	Enumerable.prototype.intersect = function (iterable: IterableType, equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {
		_ensureIterable(iterable);
		const self: Enumerable = this;
		const gen = equalityComparer === EqualityComparer.default
			? function* () {
				const distinctValues = new Set(Enumerable.from(iterable));
				for (const item of self) {
					if (distinctValues.has(item)) yield item;
				}
			}
			: function* () {
				const values = _toArray(iterable);
				for (const item of self) {
					let unique = true;
					for (let i=0; i<values.length; i++) {
						if (equalityComparer(item, values[i])) {
							unique = false;
							break;
						}
					}
					if (!unique) yield item;
				}
			};
		return new Enumerable(gen);
	}

	/// same as count
	Enumerable.prototype.longCount = function (): number {
		return this.count();
	}

	/// Filters the elements of a sequence based on their type
	/// If type is a string, it will filter based on typeof, else it will use instanceof
	Enumerable.prototype.ofType = function (type: string | Function): Enumerable {
		const condition: IFilter =
			typeof type === 'string'
				? x => typeof x === type
				: x => x instanceof type;
		return this.where(condition);
	}

	/// Adds a value to the beginning of the sequence.
	Enumerable.prototype.prepend = function (item: any): Enumerable {
		return new Enumerable([item]).concat(this);
	}

	/// Inverts the order of the elements in a sequence.
	Enumerable.prototype.reverse = function (): Enumerable {
		_ensureInternalTryGetAt(this);
		const self: Enumerable = this;
		const gen = this._canSeek
			? function* () {
				const length = self.count();
				for (let index = length - 1; index >= 0; index--) {
					yield self.elementAt(index);
				}
			}
			: function* () {
				const arr = _toArray(self);
				for (let index = arr.length - 1; index >= 0; index--) {
					yield arr[index];
				}
			};
		const result = new Enumerable(gen);
		_ensureInternalCount(this);
		result._count = this._count;
		_ensureInternalTryGetAt(this);
		if (this._canSeek) {
			const self = this;
			result._tryGetAt = index => self._tryGetAt!(self.count() - index - 1);
		}
		return result;
	}

	/// Projects each element of a sequence to an iterable and flattens the resulting sequences into one sequence.
	Enumerable.prototype.selectMany = function (selector: ISelector<IterableType>): Enumerable {
		if (typeof selector !== 'undefined') {
			_ensureFunction(selector);
		} else {
			selector = x => x;
		}
		const self: Enumerable = this;
		const gen = function* () {
			let index = 0;
			for (const item of self) {
				_ensureIterable(item);
				for (const child of selector(item, index)) {
					yield child;
				}
				index++;
			}
		};
		return new Enumerable(gen);
	}

	/// Determines whether two sequences are equal and in the same order according to an equality comparer.
	Enumerable.prototype.sequenceEqual = function (iterable: IterableType, equalityComparer: IEqualityComparer = EqualityComparer.default): boolean {
		_ensureIterable(iterable);
		_ensureFunction(equalityComparer);
		const iterator1 = this[Symbol.iterator]();
		const iterator2 = Enumerable.from(iterable)[Symbol.iterator]();
		let done = false;
		do {
			const val1 = iterator1.next();
			const val2 = iterator2.next();
			const equal = (val1.done && val2.done) || (!val1.done && !val2.done && equalityComparer(val1.value, val2.value));
			if (!equal) return false;
			done = !!val1.done;
		} while (!done);
		return true;
	}

	/// Returns the single element of a sequence and throws if it doesn't have exactly one
	Enumerable.prototype.single = function (): any {
		const iterator = this[Symbol.iterator]();
		let val = iterator.next();
		if (val.done) throw new Error('Sequence contains no elements');
		const result = val.value;
		val = iterator.next();
		if (!val.done) throw new Error('Sequence contains more than one element');
		return result;
	}

	/// Returns the single element of a sequence or undefined if none found. It throws if the sequence contains multiple items.
	Enumerable.prototype.singleOrDefault = function (): any | undefined {
		const iterator = this[Symbol.iterator]();
		let val = iterator.next();
		if (val.done) return undefined;
		const result = val.value;
		val = iterator.next();
		if (!val.done) throw new Error('Sequence contains more than one element');
		return result;
	}

	/// Returns a new enumerable collection that contains the elements from source with the last nr elements of the source collection omitted.
	Enumerable.prototype.skipLast = function (nr: number): Enumerable {
		const self: Enumerable = this;
		const gen = function* () {
			let nrLeft = nr;
			const buffer = Array(nrLeft);
			let index = 0;
			let offset = 0;
			for (const item of self) {
				const value = buffer[index - offset];
				buffer[index - offset] = item;
				index++;
				if (index - offset >= nrLeft) {
					offset += nrLeft;
				}
				if (index > nrLeft) {
					yield value;
				}
			}
			buffer.length = 0;
		};
		const result = new Enumerable(gen);

		result._count = () => Math.max(0, self.count() - nr);
		_ensureInternalTryGetAt(this);
		result._canSeek = this._canSeek;
		if (this._canSeek) {
			result._tryGetAt = index => {
				if (index >= result.count()) return null;
				return self._tryGetAt!(index);
			}
		}
		return result;
	}


	/// Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
	Enumerable.prototype.skipWhile = function (condition: IFilter): Enumerable {
		_ensureFunction(condition);
		const self: Enumerable = this;
		let skip = true;
		const gen = function* () {
			let index = 0;
			for (const item of self) {
				if (skip && !condition(item, index)) {
					skip = false;
				}
				if (!skip) {
					yield item;
				}
				index++;
			}
		};
		return new Enumerable(gen);
	}

	/// Returns a new enumerable collection that contains the last nr elements from source.
	Enumerable.prototype.takeLast = function (nr: number): Enumerable {
		_ensureInternalTryGetAt(this);
		const self: Enumerable = this;
		const gen = this._canSeek
			? function* () {
				let nrLeft = nr;
				const length = self.count();
				for (let index = length - nrLeft; index < length; index++) {
					yield self.elementAt(index);
				}
			}
			: function* () {
				let nrLeft = nr;
				let index = 0;
				const buffer = Array(nrLeft);
				for (const item of self) {
					buffer[index % nrLeft] = item;
					index++;
				}
				for (let i = 0; i < nrLeft && i < index; i++) {
					yield buffer[(index + i) % nrLeft];
				}
			};
		const result = new Enumerable(gen);

		result._count = () => Math.min(nr, self.count());
		result._canSeek = self._canSeek;
		if (self._canSeek) {
			result._tryGetAt = index => {
				if (index < 0 || index >= result.count()) return null;
				return self._tryGetAt!(self.count() - nr + index);
			};
		}
		return result;
	}

	/// Returns elements from a sequence as long as a specified condition is true, and then skips the remaining elements.
	Enumerable.prototype.takeWhile = function (condition: IFilter): Enumerable {
		_ensureFunction(condition);
		const self: Enumerable = this;
		const gen = function* () {
			let index = 0;
			for (const item of self) {
				if (condition(item, index)) {
					yield item;
				} else {
					break;
				}
				index++;
			}
		};
		return new Enumerable(gen);
	}

	Enumerable.prototype.toDictionary = function (): never {
		throw new Error('use toMap or toObject instead of toDictionary');
	}

	/// creates a map from an Enumerable
	Enumerable.prototype.toMap = function (keySelector: ISelector, valueSelector: ISelector = x => x): Map<any, any> {
		_ensureFunction(keySelector);
		_ensureFunction(valueSelector);
		const result = new Map<any, any>();
		let index = 0;
		for (const item of this) {
			result.set(keySelector(item, index), valueSelector(item, index));
			index++;
		}
		return result;
	}

	/// creates an object from an enumerable
	Enumerable.prototype.toObject = function (keySelector: ISelector, valueSelector: ISelector = x => x): { [key: string]: any } {
		_ensureFunction(keySelector);
		_ensureFunction(valueSelector);
		const result: { [key: string]: any } = {};
		let index = 0;
		for (const item of this) {
			result[keySelector(item, index)] = valueSelector(item);
			index++;
		}
		return result;
	}

	Enumerable.prototype.toHashSet = function (): never {
		throw new Error('use toSet instead of toHashSet');
	}

	/// creates a set from an enumerable
	Enumerable.prototype.toSet = function (): Set<any> {
		const result = new Set<any>();
		for (const item of this) {
			result.add(item);
		}
		return result;
	}

	/// Produces the set union of two sequences.
	Enumerable.prototype.union = function (iterable: IterableType, equalityComparer: IEqualityComparer = EqualityComparer.default): Enumerable {
		_ensureIterable(iterable);
		return this.concat(iterable).distinct(equalityComparer);
	}

	/// Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
	Enumerable.prototype.zip = function (iterable: IterableType, zipper: (item1: any, item2: any, index: number) => any): any {
		_ensureIterable(iterable);
		if (!zipper) {
			zipper = (i1,i2)=>[i1,i2];
		} else {
			_ensureFunction(zipper);
		}
		const self: Enumerable = this;
		const gen = function* () {
			let index = 0;
			const iterator1 = self[Symbol.iterator]();
			const iterator2 = Enumerable.from(iterable)[Symbol.iterator]();
			let done = false;
			do {
				const val1 = iterator1.next();
				const val2 = iterator2.next();
				done = !!(val1.done || val2.done);
				if (!done) {
					yield zipper(val1.value, val2.value, index);
				}
				index++;
			} while (!done);
		};
		return new Enumerable(gen);
	}
}