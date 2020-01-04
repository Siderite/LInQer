({ Enumerable, EqualityComparer } = (function () {
	function Enumerable(src) {
		_ensureIterable(src);
		this._src = src;
	}
	Enumerable.empty = function () {
		return new Enumerable([]);
	};
	Enumerable.range = function (start, count) {
		const f = function* () {
			for (let i = 0; i < count; i++) {
				yield start + i;
			}
		};
		return new Enumerable(f());
	}
	Enumerable.repeat = function (item, count) {
		const f = function* () {
			for (let i = 0; i < count; i++) {
				yield item;
			}
		};
		return new Enumerable(f());
	}
	Enumerable.from = function (src) {
		if (src instanceof Enumerable) return src;
		return new Enumerable(src);
	}
	Enumerable.prototype = {
		[Symbol.iterator]() {
			const iterator = this._src[Symbol.iterator].bind(this._src);
			return iterator();
		},
		aggregate(acc, op) {
			_ensureFunction(op);
			for (const item of this) {
				acc = op(acc, item);
			}
			return acc;
		},
		all(op) {
			_ensureFunction(op);
			return !this.any(x => !op(x));
		},
		any(op) {
			_ensureFunction(op);
			for (const item of this) {
				if (op(item)) return true;
			}
			return false;
		},
		append(item) {
			return this.concat([item]);
		},
		average() {
			return this.sum() / this.count();
		},
		concat(iterable) {
			_ensureIterable(iterable);
			const gen = function* () {
				for (const item of this) {
					yield item;
				}
				for (const item of iterable) {
					yield item;
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		contains(item, equalityComparer = EqualityComparer.default) {
			_ensureFunction(equalityComparer);
			return this.any(x => equalityComparer(x, item));
		},
		count() {
			_ensureInternalCount(this);
			return this._count();
		},
		distinct() {
			// TODO comparer function (probably a hashing function, rather than comparer)
			const distinctValues = new Set();
			const gen = function* () {
				for (const item of this) {
					const size = distinctValues.size;
					distinctValues.add(item);
					if (size < distinctValues.size) {
						yield item;
					}
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		elementAt(index) {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt(index);
			if (!result) throw new Error('Index out of range');
			return result.value;
		},
		elementAtOrDefault(index) {
			_ensureInternalTryGetAt(this);
			const result = this._tryGetAt(index);
			if (!result) return undefined;
			return result.value;
		},
		except(iterable) {
			// TODO comparer function (probably a hashing function, rather than comparer)
			_ensureIterable(iterable);
			const distinctValues = new Set(iterable);
			const gen = function* () {
				for (const item of this) {
					if (!distinctValues.has(item)) yield item;
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		first() {
			return this.elementAt(0);
		},
		firstOrDefault() {
			return this.elementAtOrDefault(0);
		},
		groupBy(keySelector) {
			_ensureFunction(keySelector);
			const result = new Map();
			for (const item of this) {
				const key = keySelector(item);
				const arr = result.get(key);
				if (arr) {
					arr.push(item);
				} else {
					result.set(key, [item]);
				}
			}
			const enumerable = new Enumerable(result);
			// TODO check the keys do not contain 'keys' and whatever members Enumerable has
			for (const pair of result) {
				enumerable[pair[0]] = pair[1];
			}
			enumerable.keys = Array.from(result.keys());
			return enumerable;
		},
		intersect(iterable) {
			// TODO comparer function (probably a hashing function, rather than comparer)
			_ensureIterable(iterable);
			const distinctValues = new Set(iterable);
			const gen = function* () {
				for (const item of this) {
					if (distinctValues.has(item)) yield item;
				}
			}.bind(this);
			return new Enumerable(gen()).distinct();
		},
		join() {
			// TODO implement this?
			throw new Error('join is not implemented for Javascript')
		},
		last() {
			_ensureInternalCount(this);
			if (this._usesDefaultCount) {
				let result = null;
				let found = false;
				for (const item of this) {
					result = item;
					found = true;
				}
				if (found) return result;
			}
			const count = this.count();
			return this.elementAt(count - 1);
		},
		lastOrDefault() {
			_ensureInternalCount(this);
			if (this._usesDefaultCount) {
				let result = undefined;
				for (const item of this) {
					result = item;
				}
				return result;
			}
			const count = this.count();
			return this.elementAtOrDefault(count - 1);
		},
		longCount() {
			return this.count();
		},
		max(comparer) {
			if (typeof comparer !== 'undefined') {
				_ensureFunction(comparer);
			} else {
				// TODO find a solution for comparison between numbers and strings
				comparer = (item1, item2) => item1 > item2 ? 1 : (item1 < item2 ? -1 : 0);
			}
			return this.aggregate(undefined, (acc, item) => acc === undefined || comparer(item, acc) > 0 ? item : acc);
		},
		min(comparer) {
			if (typeof comparer !== 'undefined') {
				_ensureFunction(comparer);
			} else {
				// TODO find a solution for comparison between numbers and strings
				comparer = (item1, item2) => item1 > item2 ? 1 : (item1 < item2 ? -1 : 0);
			}
			return this.aggregate(undefined, (acc, item) => acc === undefined || comparer(item, acc) < 0 ? item : acc);
		},
		ofType(type) {
			// TODO check the utility of this method
			const f = typeof type === 'string'
				? x => typeof x === type
				: x => x instanceof type;
			const gen = function* () {
				for (const item of this) {
					if (f(item)) yield item;
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		orderBy(comparer) {
			if (typeof comparer !== 'undefined') {
				_ensureFunction(comparer);
			}
			const gen = function* () {
				const arr = _toArray(this._src);
				arr.sort(comparer);
				for (const item of arr) {
					yield item;
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		orderByDescending(comparer) {
			return this.orderBy(comparer).reverse();
		},
		prepend(item) {
			return new Enumerable([item]).concat(this);
		},
		reverse() {
			const gen = function* () {
				const arr = _toArray(this._src);
				for (let index = arr.length - 1; index >= 0; index--) {
					yield arr[index];
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		select(op) {
			_ensureFunction(op);
			const gen = function* () {
				for (const item of this) {
					yield op(item);
				}
			}.bind(this);
			return new Enumerable(gen());
		},
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
			}.bind(this);
			return new Enumerable(gen());
		},
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
		single() {
			const iterator = this[Symbol.iterator]();
			let val = iterator.next();
			if (val.done) throw new Error('Sequence contains no elements');
			const result = val.value;
			val = iterator.next();
			if (!val.done) throw new Error('Sequence contains more than one element');
			return result;
		},
		singleOrDefault() {
			const iterator = this[Symbol.iterator]();
			let val = iterator.next();
			if (val.done) return undefined;
			const result = val.value;
			val = iterator.next();
			if (!val.done) throw new Error('Sequence contains more than one element');
			return result;
		},
		skip(nr) {
			const gen = function* () {
				for (const item of this) {
					if (nr > 0) {
						nr--;
					} else {
						yield item;
					}
				}
			}.bind(this);
			return new Enumerable(gen());
		},
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
			}.bind(this);
			return new Enumerable(gen());
		},
		sum() {
			return this.aggregate(undefined, (acc, item) => acc === undefined ? _toNumber(item) : _toNumber(acc) + _toNumber(item));
		},
		take(nr) {
			const gen = function* () {
				for (const item of this) {
					if (nr > 0) {
						yield item;
						nr--;
					}
					if (nr <= 0) {
						break;
					}
				}
			}.bind(this);
			return new Enumerable(gen());
		},
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
			}.bind(this);
			return new Enumerable(gen());
		},
		thenBy(comparer) {
			//TODO implement OrderedEnumerable?
			throw new Error('thenBy not implemented for Javascript');
		},
		thenByDescending(comparer) {
			//TODO implement OrderedEnumerable?
			throw new Error('thenByDescending not implemented for Javascript');
		},
		toArray() {
			return Array.from(this);
		},
		toDictionary() {
			throw new Error('use toMap or toObject instead of toDictionary');
		},
		toMap(keySelector, valueSelector = x => x) {
			_ensureFunction(keySelector);
			_ensureFunction(valueSelector);
			const result = new Map();
			for (const item of this) {
				result.set(keySelector(item), valueSelector(item));
			}
			return result;
		},
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
		toSet() {
			// TODO comparer function (probably a hashing function, rather than comparer)
			const result = new Set();
			for (const item of this) {
				result.add(item);
			}
			return result;
		},
		toList() {
			throw new Error('toList not implemented for Javascript');
		},
		toLookup() {
			throw new Error('toLookup not implemented for Javascript');
		},
		union(iterable) {
			// TODO comparer function (probably a hashing function, rather than comparer)
			_ensureIterable(iterable);
			return this.concat(iterable).distinct();
		},
		where(op) {
			_ensureFunction(op);
			const gen = function* () {
				for (const item of this) {
					if (op(item)) {
						yield item;
					}
				}
			}.bind(this);
			return new Enumerable(gen());
		},
		zip(iterable, zipper) {
			_ensureIterable(iterable);
			_ensureFunction(zipper);
			const gen = function* () {
				const iterator1 = this[Symbol.iterator]();
				const iterator2 = iterable[Symbol.iterator]();
				let done = false;
				do {
					const val1 = iterator1.next();
					const val2 = iterator2.next();
					done = val1.done || val2.done;
					if (!done) {
						yield zipper(val1.value, val2.value);
					}
				} while (!done);
			}.bind(this);
			return new Enumerable(gen());
		}
	};

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
		enumerable._usesDefaultCount = true;
		enumerable._count = () => {
			let x = 0;
			for (const item of enumerable._src) x++;
			return x;
		};
	}
	function _ensureInternalTryGetAt(enumerable) {
		if (enumerable._tryGetAt) return;
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
		// TODO other specialized types? objects, maps, sets?
		enumerable._tryGetAt = index => {
			let x = 0;
			for (const item of enumerable._src) {
				if (index === x) return { value: item };
				x++;
			}
			return null;
		}
	}

	const EqualityComparer = {
		default: (item1, item2) => item1 == item2,
		exact: (item1, item2) => item1 === item2,
	}
	return { Enumerable, EqualityComparer };
})());
