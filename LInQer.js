({ Enumerable, OrderedEnumerable, EqualityComparer } = (function () {

	/// wrapper class over iterable instances that exposes the methods usually found in .NET LINQ
	function Enumerable(src) {
		if (!src) {
			throw new Error('Only iterables or bound functions that return iterators are acceptable');
		}
		if (typeof src === 'function') {
			this._src = src;
			this._generator = src;
		} else {
			_ensureIterable(src);
			this._src = src;
			this._generator = src[Symbol.iterator].bind(src);
		}
		this._useQuickSort = true;
		if (typeof src._useQuickSort !== 'undefined') {
			this._useQuickSort = src._useQuickSort;
		}
		if (typeof src._forceQuickSort !== 'undefined') {
			this._forceQuickSort = src._forceQuickSort;
		}
		this._canSeek = false;
		this._count = null;
		this._tryGetAt = null;
		this._wasIterated = false;
	}
	/// returns an empty Enumerable
	Enumerable.empty = function () {
		const result = new Enumerable([]);
		result._count = () => 0;
		result._tryGetAt = index => null;
		return result;
	};
	/// generates a sequence of integral numbers within a specified range.
	Enumerable.range = function (start, count) {
		const gen = function* () {
			for (let i = 0; i < count; i++) {
				yield start + i;
			}
		};
		const result = new Enumerable(gen.bind(this));
		result._count = () => count;
		result._tryGetAt = index => {
			if (index>=0 && index<count) return { value: start+index };
			return null;
		};
		return result;
	}
	/// Generates a sequence that contains one repeated value.
	Enumerable.repeat = function (item, count) {
		const gen = function* () {
			for (let i = 0; i < count; i++) {
				yield item;
			}
		};
		const result = new Enumerable(gen.bind(this));
		result._count = () => count;
		result._tryGetAt = index => {
			if (index>=0 && index<count) return { value: item };
			return null;
		};
		return result;
	}
	/// Wraps an iterable item into an Enumerable if it's not already one
	Enumerable.from = function (iterable) {
		if (iterable instanceof Enumerable) return iterable;
		return new Enumerable(iterable);
	}
	Enumerable.prototype = {
		/// the Enumerable instance exposes the same iterator as the wrapped iterable or generator function 
		[Symbol.iterator]() {
			this._wasIterated = true;
			return this._generator();
		},
		/// Applies an accumulator function over a sequence.
		/// The specified seed value is used as the initial accumulator value, and the specified function is used to select the result value.
		aggregate(acc, op) {
			_ensureFunction(op);
			for (const item of this) {
				acc = op(acc, item);
			}
			return acc;
		},
		/// Determines whether all elements of a sequence satisfy a condition.
		all(op) {
			_ensureFunction(op);
			return !this.any(x => !op(x));
		},
		/// Determines whether any element of a sequence exists or satisfies a condition.
		any(op) {
			_ensureFunction(op);
			for (const item of this) {
				if (op(item)) return true;
			}
			return false;
		},
		/// Appends a value to the end of the sequence.
		append(item) {
			return this.concat([item]);
		},
		/// Computes the average of a sequence of numeric values.
		average() {
			const agg = {
				count: 0
			};
			for(const item of this){
				agg.sum = agg.count === 0
					? _toNumber(item)
					: agg.sum + _toNumber(item);
				agg.count ++;
			}
			return agg.count == 0
				? undefined
				: agg.sum / agg.count;
		},
		/// Returns the same enumerable
		asEnumerable() {
			return this;
		},
		/// Checks the elements of a sequence based on their type
		/// If type is a string, it will check based on typeof, else it will use instanceof.
		/// Throws if types are different.
		cast(type) {
			const f = typeof type === 'string'
				? x => typeof x === type
				: x => x instanceof type;
			return this.where(item=>{
				if (!f(item)) throw new Error(item+' not of type '+type);
				return true;
			});
		},
		/// Concatenates two sequences by appending iterable to the existing one.
		concat(iterable) {
			_ensureIterable(iterable);
			const gen = function* () {
				for (const item of this) {
					yield item;
				}
				for (const item of iterable) {
					yield item;
				}
			};
			const result = new Enumerable(gen.bind(this));
			const self = this;
			result._count = () => {
				const other = new Enumerable(iterable);
				return self.count()+other.count();
			};
			return result;
		},
		/// Determines whether a sequence contains a specified element.
		/// A custom function can be used to determine equality between elements.
		contains(item, equalityComparer = EqualityComparer.default) {
			_ensureFunction(equalityComparer);
			return this.any(x => equalityComparer(x, item));
		},
		/// Returns the number of elements in a sequence.
		count() {
			_ensureInternalCount(this);
			return this._count();
		},
		defaultIfEmpty() {
			throw new Error('defaultIfEmpty not implemented for Javascript');
		},
		/// Returns distinct elements from a sequence. WARNING: using a comparer makes this slower
		distinct(equalityComparer = EqualityComparer.default) {
			const gen = equalityComparer === EqualityComparer.default
				? function* () {
					const distinctValues = new Set();
					for (const item of this) {
						const size = distinctValues.size;
						distinctValues.add(item);
						if (size < distinctValues.size) {
							yield item;
						}
					}
				}
				: function* () {
					const values = [];
					for (const item of this) {
						let unique = true;
						for (const prevItem of values) {
							if (equalityComparer(item,prevItem)) {
								unique = false;
								break;
							}
						}
						if (unique) yield item;
						values.push(item);
					}
				};
			return new Enumerable(gen.bind(this));
		},
		/// Returns the element at a specified index in a sequence.
		elementAt(index) {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt(index);
			if (!result) throw new Error('Index out of range');
			return result.value;
		},
		/// Returns the element at a specified index in a sequence or a default value if the index is out of range.
		elementAtOrDefault(index) {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt(index);
			if (!result) return undefined;
			return result.value;
		},
		/// Produces the set difference of two sequences WARNING: using the comparer is slower
		except(iterable, equalityComparer = EqualityComparer.default) {
			_ensureIterable(iterable);
			const gen = equalityComparer === EqualityComparer.default
				? function* () {
					const distinctValues = new Set(iterable);
					for (const item of this) {
						if (!distinctValues.has(item)) yield item;
					}
				}
				: function* () {
					const values = _toArray(iterable);
					for (const item of this) {
						let unique = true;
						for (const value of values) {
							if (equalityComparer(item,value)) {
								unique = false;
								break;
							}
						}
						if (unique) yield item;
					}
				};
			return new Enumerable(gen.bind(this));
		},
		/// Returns the first element of a sequence.
		first() {
			return this.elementAt(0);
		},
		/// Returns the first element of a sequence, or a default value if no element is found.
		firstOrDefault() {
			return this.elementAtOrDefault(0);
		},
		/// Groups the elements of a sequence.
		groupBy(keySelector) {
			_ensureFunction(keySelector);
			const gen = function* () {
				const groupMap = new Map();
				for (const item of this) {
					const key = keySelector(item);
					const group = groupMap.get(key);
					if (group) {
						group.push(item);
					} else {
						groupMap.set(key, [item]);
					}
				}
				for (const pair of groupMap) {
					const group = new Enumerable(pair[1]);
					group.key = pair[0];
					yield group;
				}
			};
			const result = new Enumerable(gen.bind(this));
			return result;
		},
		/// Correlates the elements of two sequences based on key equality and groups the results. A specified equalityComparer is used to compare keys.
		/// WARNING: using the equality comparer will be slower
		groupJoin(iterable, innerKeySelector, outerKeySelector, resultSelector, equalityComparer = EqualityComparer.default) {
			const gen = equalityComparer === EqualityComparer.default
				? function*() {
					const lookup = new Enumerable(iterable)
						.groupBy(outerKeySelector)
						.toMap(g=>g.key,g=>g);
					for(const innerItem of this) {
						const arr = _toArray(lookup.get(innerKeySelector(innerItem)));
						yield resultSelector(innerItem, arr);
					}
				}
				: function*() {
					for (const innerItem of this) {
						const arr = [];
						for (const outerItem of iterable) {
							if (equalityComparer(innerKeySelector(innerItem),outerKeySelector(outerItem))) {
								arr.push(outerItem);
							}
						}
						yield resultSelector(innerItem, arr);
					}
				};
			return new Enumerable(gen.bind(this));
		},
		/// Produces the set intersection of two sequences. WARNING: using a comparer is slower
		intersect(iterable, equalityComparer = EqualityComparer.default) {
			_ensureIterable(iterable);
			const gen = equalityComparer === EqualityComparer.default
				? function* () {
					const distinctValues = new Set(iterable);
					for (const item of this) {
						if (distinctValues.has(item)) yield item;
					}
				}
				: function* () {
					const values = _toArray(iterable);
					for (const item of this) {
						let unique = true;
						for (const value of values) {
							if (equalityComparer(item, value)) {
								unique= false;
								break;
							}
						}
						if (!unique) yield item;
					}
				};
			return new Enumerable(gen.bind(this));
		},
		/// Correlates the elements of two sequences based on matching keys.
		/// WARNING: using the equality comparer will be slower
		join(iterable, innerKeySelector, outerKeySelector, resultSelector, equalityComparer = EqualityComparer.default) {
			const gen = equalityComparer === EqualityComparer.default
				? function*() {
					const lookup = new Enumerable(iterable)
						.groupBy(outerKeySelector)
						.toMap(g=>g.key,g=>g);
					for(const innerItem of this) {
						const group = lookup.get(innerKeySelector(innerItem));
						if (group) {
							for(const outerItem of group) {
								yield resultSelector(innerItem, outerItem);
							}
						}
					}
				}
				: function*() {
					for (const innerItem of this) {
						for (const outerItem of iterable) {
							if (equalityComparer(innerKeySelector(innerItem),outerKeySelector(outerItem))) {
								yield resultSelector(innerItem, outerItem);
							}
						}
					}
				};
			return new Enumerable(gen.bind(this));
		},
		/// Returns the last element of a sequence.
		last() {
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
		},
		/// Returns the last element of a sequence, or a default value if no element is found.
		lastOrDefault() {
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
		},
		/// same as count
		longCount() {
			return this.count();
		},
		/// Returns the maximum value in a sequence of values.
		/// A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
		max(comparer) {
			if (typeof comparer !== 'undefined') {
				_ensureFunction(comparer);
			} else {
				comparer = _defaultComparer;
			}
			return this.aggregate(undefined, (acc, item) => acc === undefined || comparer(item, acc) > 0 ? item : acc);
		},
		/// Returns the minimum value in a sequence of values.
		/// A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
		min(comparer) {
			if (typeof comparer !== 'undefined') {
				_ensureFunction(comparer);
			} else {
				comparer = _defaultComparer;
			}
			return this.aggregate(undefined, (acc, item) => acc === undefined || comparer(item, acc) < 0 ? item : acc);
		},
		/// Filters the elements of a sequence based on their type
		/// If type is a string, it will filter based on typeof, else it will use instanceof
		ofType(type) {
			const f = typeof type === 'string'
				? x => typeof x === type
				: x => x instanceof type;
			return this.where(f);
		},
		/// Sorts the elements of a sequence in ascending order.
		orderBy(keySelector) {
			if (keySelector) {
				_ensureFunction(keySelector);
			} else {
				keySelector = item => item;
			}
			return new OrderedEnumerable(this,keySelector, true);
		},
		/// Sorts the elements of a sequence in descending order.
		orderByDescending(keySelector) {
			if (keySelector) {
				_ensureFunction(keySelector);
			} else {
				keySelector = item => item;
			}
			return new OrderedEnumerable(this,keySelector, false);
		},
		/// Adds a value to the beginning of the sequence.
		prepend(item) {
			return new Enumerable([item]).concat(this);
		},
		/// Inverts the order of the elements in a sequence.
		reverse() {
			_ensureInternalTryGetAt(this);
			const gen = this._canSeek
				? function* () {
					const length = this.count();
					for (let index = length - 1; index >= 0; index--) {
						yield this.elementAt(index);
					}
				}
				: function* () {
					const arr = _toArray(this);
					for (let index = arr.length - 1; index >= 0; index--) {
						yield arr[index];
					}
				};
			const result = new Enumerable(gen.bind(this));
			_ensureInternalCount(this);
			result._count = this._count;
			return result;
		},
		/// Projects each element of a sequence into a new form.
		select(op) {
			_ensureFunction(op);
			const gen = function* () {
				for (const item of this) {
					yield op(item);
				}
			};
			const result = new Enumerable(gen.bind(this));
			_ensureInternalCount(this);
			result._count = this._count;
			return result;
		},
		/// Projects each element of a sequence to an iterable and flattens the resulting sequences into one sequence.
		selectMany(op) {
			if (typeof op !== 'undefined') {
				_ensureFunction(op);
			} else {
				op = x => x;
			}
			const gen = function* () {
				for (const item of this) {
					_ensureIterable(item);
					for (const child of op(item)) {
						yield child;
					}
				}
			};
			return new Enumerable(gen.bind(this));
		},
		/// Determines whether two sequences are equal and in the same order according to an equality comparer.
		sequenceEqual(iterable, equalityComparer = EqualityComparer.default) {
			_ensureIterable(iterable);
			_ensureFunction(equalityComparer);
			const iterator1 = this[Symbol.iterator]();
			const iterator2 = iterable[Symbol.iterator]();
			let done = false;
			do {
				const val1 = iterator1.next();
				const val2 = iterator2.next();
				const equal = (val1.done && val2.done) || (!val1.done && !val2.done && equalityComparer(val1.value, val2.value));
				if (!equal) return false;
				done = val1.done;
			} while (!done);
			return true;
		},
		/// Returns the single element of a sequence and throws if it doesn't have exactly one
		single() {
			const iterator = this[Symbol.iterator]();
			let val = iterator.next();
			if (val.done) throw new Error('Sequence contains no elements');
			const result = val.value;
			val = iterator.next();
			if (!val.done) throw new Error('Sequence contains more than one element');
			return result;
		},
		/// Returns the single element of a sequence or undefined if none found. It throws if the sequence contains multiple items.
		singleOrDefault() {
			const iterator = this[Symbol.iterator]();
			let val = iterator.next();
			if (val.done) return undefined;
			const result = val.value;
			val = iterator.next();
			if (!val.done) throw new Error('Sequence contains more than one element');
			return result;
		},
		/// Bypasses a specified number of elements in a sequence and then returns the remaining elements.
		skip(nr) {
			const gen = function* () {
				let nrLeft = nr;
				for (const item of this) {
					if (nrLeft > 0) {
						nrLeft--;
					} else {
						yield item;
					}
				}
			};
			const result = new Enumerable(gen.bind(this));
			const self = this;
			result._count = ()=>Math.max(0,self.count()-nr);
			return result;
		},
		/// Returns a new enumerable collection that contains the elements from source with the last nr elements of the source collection omitted.
		skipLast(nr) {
			const gen = function* () {
				let nrLeft = nr;
				const buffer = Array(nrLeft);
				let index = 0;
				let offset = 0;
				for (const item of this) {
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
			const result = new Enumerable(gen.bind(this));
			const self = this;
			result._count = ()=>Math.max(0,self.count()-nr);
			return result;
		},
		/// Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
		skipWhile(condition) {
			_ensureFunction(condition);
			let skip = true;
			const gen = function* () {
				for (const item of this) {
					if (skip && !condition(item)) {
						skip = false;
					}
					if (!skip) {
						yield item;
					}
				}
			};
			return new Enumerable(gen.bind(this));
		},
		/// Computes the sum of a sequence of numeric values.
		sum() {
			const agg = {
				count: 0
			};
			for(const item of this){
				agg.sum = agg.count === 0
					? _toNumber(item)
					: agg.sum + _toNumber(item);
				agg.count ++;
			}
			return agg.count == 0
				? undefined
				: agg.sum;
		},
		/// Returns a specified number of contiguous elements from the start of a sequence.
		take(nr) {
			const gen = function* () {
				let nrLeft = nr;
				for (const item of this) {
					if (nrLeft > 0) {
						yield item;
						nrLeft--;
					}
					if (nrLeft <= 0) {
						break;
					}
				}
			};
			const result = new Enumerable(gen.bind(this));
			const self = this;
			result._count = ()=>Math.min(nr,self.count());
			return result;
		},
		/// Returns a new enumerable collection that contains the last nr elements from source.
		takeLast(nr) {
			_ensureInternalTryGetAt(this);
			const gen = this._canSeek
				? function* () {
					let nrLeft = nr;
					const length = this.count();
					for (let index = length - nrLeft; index < length; index++) {
						yield this.elementAt(index);
					}
				}
				: function* () {
					let nrLeft = nr;
					let index = 0;
					const buffer = Array(nrLeft);
					for (const item of this) {
						buffer[index % nrLeft] = item;
						index++;
					}
					for (let i = 0; i < nrLeft && i < index; i++) {
						yield buffer[(index + i) % nrLeft];
					}
				};
			const result = new Enumerable(gen.bind(this));
			const self = this;
			result._count = ()=>Math.min(nr,self.count());
			return result;
		},
		/// Returns elements from a sequence as long as a specified condition is true, and then skips the remaining elements.
		takeWhile(condition) {
			_ensureFunction(condition);
			const gen = function* () {
				for (const item of this) {
					if (condition(item)) {
						yield item;
					} else {
						break;
					}
				}
			};
			return new Enumerable(gen.bind(this));
		},
		/// creates an array from an Enumerable
		toArray() {
			return Array.from(this);
		},
		toDictionary() {
			throw new Error('use toMap or toObject instead of toDictionary');
		},
		/// creates a map from an Enumerable
		toMap(keySelector, valueSelector = x => x) {
			_ensureFunction(keySelector);
			_ensureFunction(valueSelector);
			const result = new Map();
			for (const item of this) {
				result.set(keySelector(item), valueSelector(item));
			}
			return result;
		},
		/// creates an object from an enumerable
		toObject(keySelector, valueSelector = x => x) {
			_ensureFunction(keySelector);
			_ensureFunction(valueSelector);
			const result = {};
			for (const item of this) {
				result[keySelector(item)] = valueSelector(item);
			}
			return result;
		},
		toHashSet() {
			throw new Error('use toSet instead of toHashSet');
		},
		/// creates a set from an enumerable
		toSet() {
			const result = new Set();
			for (const item of this) {
				result.add(item);
			}
			return result;
		},
		toList() {
			throw new Error('use toArray instead of toList');
		},
		toLookup() {
			throw new Error('use groupBy instead of toLookup');
		},
		/// Produces the set union of two sequences.
		union(iterable, equalityComparer = EqualityComparer.default) {
			_ensureIterable(iterable);
			return this.concat(iterable).distinct(equalityComparer);
		},
		/// use QuickSort for ordering (default) if take, skip, takeLast, skipLast are used
		useQuickSort() {
			this._useQuickSort = true;
			return this;
		},
		/// use the default browser sort implementation for ordering at all times
		/// removes QuickSort optimization when take, skip, takeLast, skipLast are used
		useBrowserSort() {
			this._useQuickSort = false;
			return this;
		},
		/// Filters a sequence of values based on a predicate.
		where(op) {
			_ensureFunction(op);
			const gen = function* () {
				let index = 0;
				for (const item of this) {
					if (op(item, index)) {
						yield item;
					}
					index++;
				}
			};
			return new Enumerable(gen.bind(this));
		},
		/// Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
		zip(iterable, zipper) {
			_ensureIterable(iterable);
			_ensureFunction(zipper);
			const gen = function* () {
				let index = 0;
				const iterator1 = this[Symbol.iterator]();
				const iterator2 = iterable[Symbol.iterator]();
				let done = false;
				do {
					const val1 = iterator1.next();
					const val2 = iterator2.next();
					done = val1.done || val2.done;
					if (!done) {
						yield zipper(val1.value, val2.value, index);
					}
					index++;
				} while (!done);
			};
			return new Enumerable(gen.bind(this));
		}
	};

	/// an Enumerable that accepts a chain of key selectors by which to order
	function OrderedEnumerable(enumerable, keySelector, ascending) {
		this._src = enumerable;
		this._canSeek = false;
		this._count = null;
		this._tryGetAt = null;
		this._wasIterated = false;
		this._keySelectors=[];
		this._restrictions = [];
		if (keySelector) {
			this._keySelectors.push({keySelector:keySelector,ascending:ascending});
		}
		this._useQuickSort = true;
		if (typeof enumerable._useQuickSort !== 'undefined') {
			this._useQuickSort = enumerable._useQuickSort;
		}
		if (typeof enumerable._forceQuickSort !== 'undefined') {
			this._forceQuickSort = enumerable._forceQuickSort;
		}
		this._generator = function* () {
			const arr = _toArray(this._src);
			let startIndex = 0;
			let endIndex = arr.length;
			for (var restriction of this._restrictions) {
				switch(restriction.type) {
					case 'take':
						endIndex = Math.min(endIndex, startIndex+restriction.nr);
						break;
					case 'skip':
						startIndex = Math.min(endIndex, startIndex+restriction.nr);
						break;
					case 'takeLast':
						startIndex = Math.max(startIndex, endIndex-restriction.nr);
						break;
					case 'skipLast':
						endIndex = Math.max(startIndex, endIndex-restriction.nr);
						break;
				}
			}
			if (startIndex<endIndex) {
				// only use QuickSort as an optimization for take, skip, takeLast, skipLast
				// _forceQuickSort forces it to be used at all times, used internally
				const sort = this._useQuickSort && (this._forceQuickSort || this._restrictions.length)
					? (a,c) => _quickSort(a,0,a.length-1,c,startIndex,endIndex)
					: (a,c) => a.sort(c);
				sort(arr, (i1,i2)=>{
					for (const selector of this._keySelectors) {
						const v1 = selector.keySelector(i1);
						const v2 = selector.keySelector(i2);
						if (v1>v2) return selector.ascending ? 1 : -1;
						if (v1<v2) return selector.ascending ? -1 : 1;
					}
					return 0;
				});
				for (let index=startIndex; index<endIndex; index++) {
					yield arr[index];
				}
			}
		};
		const self = this;
		this._count = ()=>{
			if (self._restrictions.length) {
				self._count = null;
				_ensureInternalCount(self);
				return self._count();
			}
			return self._src.count.call(self._src);
		};
	}
	OrderedEnumerable.prototype ={
		/// Performs a subsequent ordering of the elements in a sequence in ascending order.
		thenBy(keySelector) {
			this._keySelectors.push({keySelector:keySelector,ascending:true});
			return this;
		},
		/// Performs a subsequent ordering of the elements in a sequence in descending order.
		thenByDescending(keySelector) {
			this._keySelectors.push({keySelector:keySelector,ascending:false});
			return this;
		},
		/// Deferred and optimized implementation of take
		take(nr) {
			this._restrictions.push({type:'take',nr:nr});
			return this;
		},
		/// Deferred and optimized implementation of takeLast
		takeLast(nr) {
			this._restrictions.push({type:'takeLast',nr:nr});
			return this;
		},
		/// Deferred and optimized implementation of skip
		skip(nr) {
			this._restrictions.push({type:'skip',nr:nr});
			return this;
		},
		/// Deferred and optimized implementation of skipLast
		skipLast(nr) {
			this._restrictions.push({type:'skipLast',nr:nr});
			return this;
		}
	};
	Object.setPrototypeOf(OrderedEnumerable.prototype, Enumerable.prototype);

	function _ensureIterable(src) {
		if (!src || !src[Symbol.iterator]) throw new Error('the argument must be iterable!');
	}
	function _ensureFunction(f) {
		if (!f || typeof f !== 'function') throw new Error('the argument needs to be a function!');
	}
	function _toNumber(obj) {
		return typeof obj === 'number'
			? obj
			: Number.NaN;
	}
	function _toArray(enumerable) {
		if (!enumerable) return [];
		if (Array.isArray(enumerable)) return enumerable;
		return Array.from(enumerable);
	}
	function _ensureInternalCount(enumerable) {
		if (enumerable._count) return;
		if (typeof enumerable._src.length === 'number') {
			enumerable._count = () => enumerable._src.length;
			return;
		}
		if (typeof enumerable._src.size === 'number') {
			enumerable._count = () => enumerable._src.size;
			return;
		}
		enumerable._count = () => {
			let x = 0;
			for (const item of enumerable) x++;
			return x;
		};
	}
	function _ensureInternalTryGetAt(enumerable) {
		if (enumerable._tryGetAt) return;
		this._canSeek = true;
		if (typeof enumerable._src === 'string') {
			enumerable._tryGetAt = index => {
				if (index < enumerable._src.length) {
					return { value: enumerable._src.charAt(index) };
				}
				return null;
			};
			return;
		}
		if (Array.isArray(enumerable._src)) {
			enumerable._tryGetAt = index => {
				if (index >= 0 && index < enumerable._src.length) {
					return { value: enumerable._src[index] };
				}
				return null;
			};
			return;
		}
		if (typeof enumerable._src.length === 'number') {
			enumerable._tryGetAt = index => {
				if (index < enumerable._src.length && typeof enumerable._src[index] !== 'undefined') {
					return { value: enumerable._src[index] };
				}
				return null;
			};
			return;
		}
		this._canSeek = false;
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
	function _defaultComparer(item1, item2) {
		if (item1 > item2) return 1;
		if (item1 < item2) return -1;
		return 0;
	}
	function _swapArrayItems(array, leftIndex, rightIndex){
		const temp = array[leftIndex];
		array[leftIndex] = array[rightIndex];
		array[rightIndex] = temp;
	}
	function _partition(items, left, right, comparer) {
		const pivot   = items[(right + left) >> 1];
		while (left <= right) {
			while (comparer(items[left], pivot)<0) {
				left++;
			}
			while (comparer(items[right], pivot)>0) {
				right--;
			}
			if (left < right) {
				_swapArrayItems(items, left, right);
				left++;
				right--;
			} else {
				if (left === right) return left+1;
			}
		}
		return left;
	}
	function _quickSort(items, left, right, comparer=_defaultComparer, minIndex=0, maxIndex=Number.MAX_SAFE_INTEGER) {
		if (!items.length) return items;

		const partitions = [];
		partitions.push([left, right]);
		let partitionIndex = 0;
		while (partitionIndex<partitions.length) {
			[left,right]=partitions[partitionIndex];
			const index = _partition(items, left, right, comparer); //index returned from partition
			if (left < index - 1 && index - 1 >= minIndex) { //more elements on the left side of the pivot
				partitions.push([left,index-1]);
			}
			if (index < right && index < maxIndex) { //more elements on the right side of the pivot
				partitions.push([index,right]);
			}
			partitionIndex++;
		}
		return items;
	}

	/// default equality comparers
	const EqualityComparer = {
		default: (item1, item2) => item1 == item2,
		exact: (item1, item2) => item1 === item2,
	};

	return { Enumerable, OrderedEnumerable, EqualityComparer};
})());
