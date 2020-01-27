"use strict";
var Linqer;
(function (Linqer) {
    /// wrapper class over iterable instances that exposes the methods usually found in .NET LINQ
    class Enumerable {
        constructor(src) {
            _ensureIterable(src);
            this._src = src;
            const iteratorFunction = src[Symbol.iterator];
            if (iteratorFunction) {
                this._generator = iteratorFunction.bind(src);
            }
            else {
                this._generator = src;
            }
            this._useQuickSort = src._useQuickSort !== undefined
                ? src._useQuickSort
                : true;
            this._canSeek = false;
            this._count = null;
            this._tryGetAt = null;
            this._wasIterated = false;
        }
        /// Wraps an iterable item into an Enumerable if it's not already one
        static from(iterable) {
            if (iterable instanceof Enumerable)
                return iterable;
            return new Enumerable(iterable);
        }
        /// the Enumerable instance exposes the same iterator as the wrapped iterable or generator function 
        [Symbol.iterator]() {
            this._wasIterated = true;
            return this._generator();
        }
        /// returns an empty Enumerable
        static empty() {
            const result = new Enumerable([]);
            result._count = () => 0;
            result._tryGetAt = (index) => null;
            result._canSeek = true;
            return result;
        }
        /// generates a sequence of integral numbers within a specified range.
        static range(start, count) {
            const gen = function* () {
                for (let i = 0; i < count; i++) {
                    yield start + i;
                }
            };
            const result = new Enumerable(gen);
            result._count = () => count;
            result._tryGetAt = index => {
                if (index >= 0 && index < count)
                    return { value: start + index };
                return null;
            };
            result._canSeek = true;
            return result;
        }
        /// Generates a sequence that contains one repeated value.
        static repeat(item, count) {
            const gen = function* () {
                for (let i = 0; i < count; i++) {
                    yield item;
                }
            };
            const result = new Enumerable(gen);
            result._count = () => count;
            result._tryGetAt = index => {
                if (index >= 0 && index < count)
                    return { value: item };
                return null;
            };
            result._canSeek = true;
            return result;
        }
        /// Concatenates two sequences by appending iterable to the existing one.
        concat(iterable) {
            _ensureIterable(iterable);
            const self = this;
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
                    return self._tryGetAt(index) || other._tryGetAt(index - self.count());
                };
            }
            return result;
        }
        /// Returns the number of elements in a sequence.
        count() {
            _ensureInternalCount(this);
            return this._count();
        }
        /// Returns distinct elements from a sequence. WARNING: using a comparer makes this slower
        distinct(equalityComparer = Linqer.EqualityComparer.default) {
            const self = this;
            const gen = equalityComparer === Linqer.EqualityComparer.default
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
                        for (const prevItem of values) {
                            if (equalityComparer(item, prevItem)) {
                                unique = false;
                                break;
                            }
                        }
                        if (unique)
                            yield item;
                        values.push(item);
                    }
                };
            return new Enumerable(gen);
        }
        /// Returns the element at a specified index in a sequence.
        elementAt(index) {
            _ensureInternalTryGetAt(this);
            const result = this._tryGetAt(index);
            if (!result)
                throw new Error('Index out of range');
            return result.value;
        }
        /// Returns the element at a specified index in a sequence or a default value if the index is out of range.
        elementAtOrDefault(index) {
            _ensureInternalTryGetAt(this);
            const result = this._tryGetAt(index);
            if (!result)
                return undefined;
            return result.value;
        }
        /// Returns the first element of a sequence.
        first() {
            return this.elementAt(0);
        }
        /// Returns the first element of a sequence, or a default value if no element is found.
        firstOrDefault() {
            return this.elementAtOrDefault(0);
        }
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
                if (found)
                    return result;
                throw new Error('The enumeration is empty');
            }
            const count = this.count();
            return this.elementAt(count - 1);
        }
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
        }
        /// Returns the count, minimum and maximum value in a sequence of values.
        /// A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
        stats(comparer) {
            if (comparer) {
                _ensureFunction(comparer);
            }
            else {
                comparer = Linqer._defaultComparer;
            }
            const agg = {
                count: 0,
                min: undefined,
                max: undefined
            };
            for (const item of this) {
                if (typeof agg.min === 'undefined' || comparer(item, agg.min) < 0)
                    agg.min = item;
                if (typeof agg.max === 'undefined' || comparer(item, agg.max) > 0)
                    agg.max = item;
                agg.count++;
            }
            return agg;
        }
        /// Returns the minimum value in a sequence of values.
        /// A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
        min(comparer) {
            const stats = this.stats(comparer);
            return stats.count === 0
                ? undefined
                : stats.min;
        }
        /// Returns the maximum value in a sequence of values.
        /// A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
        max(comparer) {
            const stats = this.stats(comparer);
            return stats.count === 0
                ? undefined
                : stats.max;
        }
        /// Projects each element of a sequence into a new form.
        select(selector) {
            _ensureFunction(selector);
            const self = this;
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
                const res = self._tryGetAt(index);
                if (!res)
                    return res;
                return { value: selector(res.value) };
            };
            return result;
        }
        /// Bypasses a specified number of elements in a sequence and then returns the remaining elements.
        skip(nr) {
            const self = this;
            const gen = function* () {
                let nrLeft = nr;
                for (const item of self) {
                    if (nrLeft > 0) {
                        nrLeft--;
                    }
                    else {
                        yield item;
                    }
                }
            };
            const result = new Enumerable(gen);
            result._count = () => Math.max(0, self.count() - nr);
            _ensureInternalTryGetAt(this);
            result._canSeek = this._canSeek;
            result._tryGetAt = index => self._tryGetAt(index + nr);
            return result;
        }
        /// Computes the sum of a sequence of numeric values.
        sum() {
            const stats = this.sumAndCount();
            return stats.count === 0
                ? undefined
                : stats.sum;
        }
        /// Computes the sum of a sequence of numeric values.
        sumAndCount() {
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
        /// Returns a specified number of contiguous elements from the start of a sequence.
        take(nr) {
            const self = this;
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
                    if (index >= nr)
                        return null;
                    return self._tryGetAt(index);
                };
            }
            return result;
        }
        /// creates an array from an Enumerable
        toArray() {
            return Array.from(this);
        }
        /// similar to toArray, but returns an Enumerable (itself if already seekable)
        toList() {
            _ensureInternalTryGetAt(this);
            if (this._canSeek)
                return this;
            return Enumerable.from(Array.from(this));
        }
        /// Filters a sequence of values based on a predicate.
        where(condition) {
            _ensureFunction(condition);
            const self = this;
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
    Linqer.Enumerable = Enumerable;
    function _ensureIterable(src) {
        if (src) {
            if (src[Symbol.iterator])
                return;
            if (typeof src === 'function' && src.constructor.name === 'GeneratorFunction')
                return;
        }
        throw new Error('the argument must be iterable!');
    }
    Linqer._ensureIterable = _ensureIterable;
    function _ensureFunction(f) {
        if (!f || typeof f !== 'function')
            throw new Error('the argument needs to be a function!');
    }
    Linqer._ensureFunction = _ensureFunction;
    function _toNumber(obj) {
        return typeof obj === 'number'
            ? obj
            : Number.NaN;
    }
    function _toArray(enumerable) {
        if (!enumerable)
            return [];
        if (Array.isArray(enumerable))
            return enumerable;
        return Array.from(enumerable);
    }
    Linqer._toArray = _toArray;
    function _ensureInternalCount(enumerable) {
        if (enumerable._count)
            return;
        const src = enumerable._src;
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
            for (const item of enumerable)
                x++;
            return x;
        };
    }
    Linqer._ensureInternalCount = _ensureInternalCount;
    function _ensureInternalTryGetAt(enumerable) {
        if (enumerable._tryGetAt)
            return;
        enumerable._canSeek = true;
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
        const src = enumerable._src;
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
                if (index === x)
                    return { value: item };
                x++;
            }
            return null;
        };
    }
    Linqer._ensureInternalTryGetAt = _ensureInternalTryGetAt;
    Linqer._defaultComparer = (item1, item2) => {
        if (item1 > item2)
            return 1;
        if (item1 < item2)
            return -1;
        return 0;
    };
    /// default equality comparers
    Linqer.EqualityComparer = {
        default: (item1, item2) => item1 == item2,
        exact: (item1, item2) => item1 === item2,
    };
})(Linqer || (Linqer = {}));
/// <reference path="./LInQer.Slim.ts" />
var Linqer;
/// <reference path="./LInQer.Slim.ts" />
(function (Linqer) {
    /// Applies an accumulator function over a sequence.
    /// The specified seed value is used as the initial accumulator value, and the specified function is used to select the result value.
    Linqer.Enumerable.prototype.aggregate = function (accumulator, aggregator) {
        Linqer._ensureFunction(aggregator);
        for (const item of this) {
            accumulator = aggregator(accumulator, item);
        }
        return accumulator;
    };
    /// Determines whether all elements of a sequence satisfy a condition.
    Linqer.Enumerable.prototype.all = function (condition) {
        Linqer._ensureFunction(condition);
        return !this.any(x => !condition(x));
    };
    /// Determines whether any element of a sequence exists or satisfies a condition.
    Linqer.Enumerable.prototype.any = function (condition) {
        Linqer._ensureFunction(condition);
        let index = 0;
        for (const item of this) {
            if (condition(item, index))
                return true;
            index++;
        }
        return false;
    };
    /// Appends a value to the end of the sequence.
    Linqer.Enumerable.prototype.append = function (item) {
        return this.concat([item]);
    };
    /// Computes the average of a sequence of numeric values.
    Linqer.Enumerable.prototype.average = function () {
        const stats = this.sumAndCount();
        return stats.count === 0
            ? undefined
            : stats.sum / stats.count;
    };
    /// Returns the same enumerable
    Linqer.Enumerable.prototype.asEnumerable = function () {
        return this;
    };
    /// Checks the elements of a sequence based on their type
    /// If type is a string, it will check based on typeof, else it will use instanceof.
    /// Throws if types are different.
    Linqer.Enumerable.prototype.cast = function (type) {
        const f = typeof type === 'string'
            ? x => typeof x === type
            : x => x instanceof type;
        return this.where(item => {
            if (!f(item))
                throw new Error(item + ' not of type ' + type);
            return true;
        });
    };
    /// Determines whether a sequence contains a specified element.
    /// A custom function can be used to determine equality between elements.
    Linqer.Enumerable.prototype.contains = function (item, equalityComparer = Linqer.EqualityComparer.default) {
        Linqer._ensureFunction(equalityComparer);
        return this.any(x => equalityComparer(x, item));
    };
    Linqer.Enumerable.prototype.defaultIfEmpty = function () {
        throw new Error('defaultIfEmpty not implemented for Javascript');
    };
    /// Produces the set difference of two sequences WARNING: using the comparer is slower
    Linqer.Enumerable.prototype.except = function (iterable, equalityComparer = Linqer.EqualityComparer.default) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = equalityComparer === Linqer.EqualityComparer.default
            ? function* () {
                const distinctValues = Linqer.Enumerable.from(iterable).toSet();
                for (const item of self) {
                    if (!distinctValues.has(item))
                        yield item;
                }
            }
            : function* () {
                const values = Linqer._toArray(iterable);
                for (const item of self) {
                    let unique = true;
                    for (const value of values) {
                        if (equalityComparer(item, value)) {
                            unique = false;
                            break;
                        }
                    }
                    if (unique)
                        yield item;
                }
            };
        return new Linqer.Enumerable(gen);
    };
    /// Produces the set intersection of two sequences. WARNING: using a comparer is slower
    Linqer.Enumerable.prototype.intersect = function (iterable, equalityComparer = Linqer.EqualityComparer.default) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = equalityComparer === Linqer.EqualityComparer.default
            ? function* () {
                const distinctValues = new Set(Linqer.Enumerable.from(iterable));
                for (const item of self) {
                    if (distinctValues.has(item))
                        yield item;
                }
            }
            : function* () {
                const values = Linqer._toArray(iterable);
                for (const item of self) {
                    let unique = true;
                    for (const value of values) {
                        if (equalityComparer(item, value)) {
                            unique = false;
                            break;
                        }
                    }
                    if (!unique)
                        yield item;
                }
            };
        return new Linqer.Enumerable(gen);
    };
    /// same as count
    Linqer.Enumerable.prototype.longCount = function () {
        return this.count();
    };
    /// Filters the elements of a sequence based on their type
    /// If type is a string, it will filter based on typeof, else it will use instanceof
    Linqer.Enumerable.prototype.ofType = function (type) {
        const condition = typeof type === 'string'
            ? x => typeof x === type
            : x => x instanceof type;
        return this.where(condition);
    };
    /// Adds a value to the beginning of the sequence.
    Linqer.Enumerable.prototype.prepend = function (item) {
        return new Linqer.Enumerable([item]).concat(this);
    };
    /// Inverts the order of the elements in a sequence.
    Linqer.Enumerable.prototype.reverse = function () {
        Linqer._ensureInternalTryGetAt(this);
        const self = this;
        const gen = this._canSeek
            ? function* () {
                const length = self.count();
                for (let index = length - 1; index >= 0; index--) {
                    yield self.elementAt(index);
                }
            }
            : function* () {
                const arr = Linqer._toArray(self);
                for (let index = arr.length - 1; index >= 0; index--) {
                    yield arr[index];
                }
            };
        const result = new Linqer.Enumerable(gen);
        Linqer._ensureInternalCount(this);
        result._count = this._count;
        Linqer._ensureInternalTryGetAt(this);
        if (this._canSeek) {
            const self = this;
            result._tryGetAt = index => self._tryGetAt(self.count() - index - 1);
        }
        return result;
    };
    /// Projects each element of a sequence to an iterable and flattens the resulting sequences into one sequence.
    Linqer.Enumerable.prototype.selectMany = function (selector) {
        if (typeof selector !== 'undefined') {
            Linqer._ensureFunction(selector);
        }
        else {
            selector = x => x;
        }
        const self = this;
        const gen = function* () {
            let index = 0;
            for (const item of self) {
                Linqer._ensureIterable(item);
                for (const child of selector(item, index)) {
                    yield child;
                }
                index++;
            }
        };
        return new Linqer.Enumerable(gen);
    };
    /// Determines whether two sequences are equal and in the same order according to an equality comparer.
    Linqer.Enumerable.prototype.sequenceEqual = function (iterable, equalityComparer = Linqer.EqualityComparer.default) {
        Linqer._ensureIterable(iterable);
        Linqer._ensureFunction(equalityComparer);
        const iterator1 = this[Symbol.iterator]();
        const iterator2 = Linqer.Enumerable.from(iterable)[Symbol.iterator]();
        let done = false;
        do {
            const val1 = iterator1.next();
            const val2 = iterator2.next();
            const equal = (val1.done && val2.done) || (!val1.done && !val2.done && equalityComparer(val1.value, val2.value));
            if (!equal)
                return false;
            done = !!val1.done;
        } while (!done);
        return true;
    };
    /// Returns the single element of a sequence and throws if it doesn't have exactly one
    Linqer.Enumerable.prototype.single = function () {
        const iterator = this[Symbol.iterator]();
        let val = iterator.next();
        if (val.done)
            throw new Error('Sequence contains no elements');
        const result = val.value;
        val = iterator.next();
        if (!val.done)
            throw new Error('Sequence contains more than one element');
        return result;
    };
    /// Returns the single element of a sequence or undefined if none found. It throws if the sequence contains multiple items.
    Linqer.Enumerable.prototype.singleOrDefault = function () {
        const iterator = this[Symbol.iterator]();
        let val = iterator.next();
        if (val.done)
            return undefined;
        const result = val.value;
        val = iterator.next();
        if (!val.done)
            throw new Error('Sequence contains more than one element');
        return result;
    };
    /// Returns a new enumerable collection that contains the elements from source with the last nr elements of the source collection omitted.
    Linqer.Enumerable.prototype.skipLast = function (nr) {
        const self = this;
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
        const result = new Linqer.Enumerable(gen);
        result._count = () => Math.max(0, self.count() - nr);
        Linqer._ensureInternalTryGetAt(this);
        result._canSeek = this._canSeek;
        if (this._canSeek) {
            result._tryGetAt = index => {
                if (index >= result.count())
                    return null;
                return self._tryGetAt(index);
            };
        }
        return result;
    };
    /// Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
    Linqer.Enumerable.prototype.skipWhile = function (condition) {
        Linqer._ensureFunction(condition);
        const self = this;
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
        return new Linqer.Enumerable(gen);
    };
    /// Returns a new enumerable collection that contains the last nr elements from source.
    Linqer.Enumerable.prototype.takeLast = function (nr) {
        Linqer._ensureInternalTryGetAt(this);
        const self = this;
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
        const result = new Linqer.Enumerable(gen);
        result._count = () => Math.min(nr, self.count());
        result._canSeek = self._canSeek;
        if (self._canSeek) {
            result._tryGetAt = index => {
                if (index < 0 || index >= result.count())
                    return null;
                return self._tryGetAt(self.count() - nr + index);
            };
        }
        return result;
    };
    /// Returns elements from a sequence as long as a specified condition is true, and then skips the remaining elements.
    Linqer.Enumerable.prototype.takeWhile = function (condition) {
        Linqer._ensureFunction(condition);
        const self = this;
        const gen = function* () {
            let index = 0;
            for (const item of self) {
                if (condition(item, index)) {
                    yield item;
                }
                else {
                    break;
                }
                index++;
            }
        };
        return new Linqer.Enumerable(gen);
    };
    Linqer.Enumerable.prototype.toDictionary = function () {
        throw new Error('use toMap or toObject instead of toDictionary');
    };
    /// creates a map from an Enumerable
    Linqer.Enumerable.prototype.toMap = function (keySelector, valueSelector = x => x) {
        Linqer._ensureFunction(keySelector);
        Linqer._ensureFunction(valueSelector);
        const result = new Map();
        let index = 0;
        for (const item of this) {
            result.set(keySelector(item, index), valueSelector(item, index));
            index++;
        }
        return result;
    };
    /// creates an object from an enumerable
    Linqer.Enumerable.prototype.toObject = function (keySelector, valueSelector = x => x) {
        Linqer._ensureFunction(keySelector);
        Linqer._ensureFunction(valueSelector);
        const result = {};
        let index = 0;
        for (const item of this) {
            result[keySelector(item, index)] = valueSelector(item);
            index++;
        }
        return result;
    };
    Linqer.Enumerable.prototype.toHashSet = function () {
        throw new Error('use toSet instead of toHashSet');
    };
    /// creates a set from an enumerable
    Linqer.Enumerable.prototype.toSet = function () {
        const result = new Set();
        for (const item of this) {
            result.add(item);
        }
        return result;
    };
    /// Produces the set union of two sequences.
    Linqer.Enumerable.prototype.union = function (iterable, equalityComparer = Linqer.EqualityComparer.default) {
        Linqer._ensureIterable(iterable);
        return this.concat(iterable).distinct(equalityComparer);
    };
    /// Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
    Linqer.Enumerable.prototype.zip = function (iterable, zipper) {
        Linqer._ensureIterable(iterable);
        if (!zipper) {
            zipper = (i1, i2) => [i1, i2];
        }
        else {
            Linqer._ensureFunction(zipper);
        }
        const self = this;
        const gen = function* () {
            let index = 0;
            const iterator1 = self[Symbol.iterator]();
            const iterator2 = Linqer.Enumerable.from(iterable)[Symbol.iterator]();
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
        return new Linqer.Enumerable(gen);
    };
})(Linqer || (Linqer = {}));
/// <reference path="./LInQer.Slim.ts" />
var Linqer;
/// <reference path="./LInQer.Slim.ts" />
(function (Linqer) {
    /// Groups the elements of a sequence.
    Linqer.Enumerable.prototype.groupBy = function (keySelector) {
        _ensureFunction(keySelector);
        const self = this;
        const gen = function* () {
            const groupMap = new Map();
            let index = 0;
            for (const item of self) {
                const key = keySelector(item, index);
                const group = groupMap.get(key);
                if (group) {
                    group.push(item);
                }
                else {
                    groupMap.set(key, [item]);
                }
                index++;
            }
            for (const [key, items] of groupMap) {
                const group = new GroupEnumerable(items, key);
                yield group;
            }
        };
        const result = new Linqer.Enumerable(gen);
        return result;
    };
    /// Correlates the elements of two sequences based on key equality and groups the results. A specified equalityComparer is used to compare keys.
    /// WARNING: using the equality comparer will be slower
    Linqer.Enumerable.prototype.groupJoin = function (iterable, innerKeySelector, outerKeySelector, resultSelector, equalityComparer = Linqer.EqualityComparer.default) {
        const self = this;
        const gen = equalityComparer === Linqer.EqualityComparer.default
            ? function* () {
                const lookup = new Linqer.Enumerable(iterable)
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
                    for (const outerItem of Linqer.Enumerable.from(iterable)) {
                        if (equalityComparer(innerKeySelector(innerItem, innerIndex), outerKeySelector(outerItem, outerIndex))) {
                            arr.push(outerItem);
                        }
                        outerIndex++;
                    }
                    yield resultSelector(innerItem, arr);
                    innerIndex++;
                }
            };
        return new Linqer.Enumerable(gen);
    };
    /// Correlates the elements of two sequences based on matching keys.
    /// WARNING: using the equality comparer will be slower
    Linqer.Enumerable.prototype.join = function (iterable, innerKeySelector, outerKeySelector, resultSelector, equalityComparer = Linqer.EqualityComparer.default) {
        const self = this;
        const gen = equalityComparer === Linqer.EqualityComparer.default
            ? function* () {
                const lookup = new Linqer.Enumerable(iterable)
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
                    for (const outerItem of Linqer.Enumerable.from(iterable)) {
                        if (equalityComparer(innerKeySelector(innerItem, innerIndex), outerKeySelector(outerItem, outerIndex))) {
                            yield resultSelector(innerItem, outerItem);
                        }
                        outerIndex++;
                    }
                    innerIndex++;
                }
            };
        return new Linqer.Enumerable(gen);
    };
    Linqer.Enumerable.prototype.toLookup = function () {
        throw new Error('use groupBy instead of toLookup');
    };
    class GroupEnumerable extends Linqer.Enumerable {
        constructor(iterable, key) {
            super(iterable);
            this.key = key;
        }
    }
    Linqer.GroupEnumerable = GroupEnumerable;
    function _ensureFunction(f) {
        if (!f || typeof f !== 'function')
            throw new Error('the argument needs to be a function!');
    }
    function _toArray(enumerable) {
        if (!enumerable)
            return [];
        if (Array.isArray(enumerable))
            return enumerable;
        return Array.from(enumerable);
    }
})(Linqer || (Linqer = {}));
/// <reference path="./LInQer.Slim.ts" />
var Linqer;
/// <reference path="./LInQer.Slim.ts" />
(function (Linqer) {
    /// Sorts the elements of a sequence in ascending order.
    Linqer.Enumerable.prototype.orderBy = function (keySelector) {
        if (keySelector) {
            _ensureFunction(keySelector);
        }
        else {
            keySelector = item => item;
        }
        return new OrderedEnumerable(this, keySelector, true);
    };
    /// Sorts the elements of a sequence in descending order.
    Linqer.Enumerable.prototype.orderByDescending = function (keySelector) {
        if (keySelector) {
            _ensureFunction(keySelector);
        }
        else {
            keySelector = item => item;
        }
        return new OrderedEnumerable(this, keySelector, false);
    };
    /// use QuickSort for ordering (default) if take, skip, takeLast, skipLast are used
    Linqer.Enumerable.prototype.useQuickSort = function () {
        this._useQuickSort = true;
        return this;
    };
    /// use the default browser sort implementation for ordering at all times
    /// removes QuickSort optimization when take, skip, takeLast, skipLast are used
    Linqer.Enumerable.prototype.useBrowserSort = function () {
        this._useQuickSort = false;
        return this;
    };
    let RestrictionType;
    (function (RestrictionType) {
        RestrictionType[RestrictionType["skip"] = 0] = "skip";
        RestrictionType[RestrictionType["skipLast"] = 1] = "skipLast";
        RestrictionType[RestrictionType["take"] = 2] = "take";
        RestrictionType[RestrictionType["takeLast"] = 3] = "takeLast";
    })(RestrictionType || (RestrictionType = {}));
    class OrderedEnumerable extends Linqer.Enumerable {
        constructor(src, keySelector, ascending = true) {
            super(src);
            this._keySelectors = [];
            this._restrictions = [];
            if (keySelector) {
                this._keySelectors.push({ keySelector: keySelector, ascending: ascending });
            }
            const self = this;
            this._generator = function* () {
                const arr = Array.from(this._src);
                const { startIndex, endIndex } = this.getStartAndEndIndexes(self._restrictions, arr.length);
                if (startIndex < endIndex) {
                    // only use QuickSort as an optimization for take, skip, takeLast, skipLast
                    const sort = this._useQuickSort && this._restrictions.length
                        ? (a, c) => _quickSort(a, 0, a.length - 1, c, startIndex, endIndex)
                        : (a, c) => a.sort(c);
                    sort(arr, (i1, i2) => {
                        for (const selector of self._keySelectors) {
                            const v1 = selector.keySelector(i1);
                            const v2 = selector.keySelector(i2);
                            if (v1 > v2)
                                return selector.ascending ? 1 : -1;
                            if (v1 < v2)
                                return selector.ascending ? -1 : 1;
                        }
                        return 0;
                    });
                    for (let index = startIndex; index < endIndex; index++) {
                        yield arr[index];
                    }
                }
            };
            this._count = () => {
                const totalCount = Linqer.Enumerable.from(self._src).count();
                const { startIndex, endIndex } = this.getStartAndEndIndexes(self._restrictions, totalCount);
                return endIndex - startIndex;
            };
        }
        getStartAndEndIndexes(restrictions, arrLength) {
            let startIndex = 0;
            let endIndex = arrLength;
            for (var restriction of restrictions) {
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
        thenBy(keySelector) {
            this._keySelectors.push({ keySelector: keySelector, ascending: true });
            return this;
        }
        /// Performs a subsequent ordering of the elements in a sequence in descending order.
        thenByDescending(keySelector) {
            this._keySelectors.push({ keySelector: keySelector, ascending: false });
            return this;
        }
        /// Deferred and optimized implementation of take
        take(nr) {
            this._restrictions.push({ type: RestrictionType.take, nr: nr });
            return this;
        }
        /// Deferred and optimized implementation of takeLast
        takeLast(nr) {
            this._restrictions.push({ type: RestrictionType.takeLast, nr: nr });
            return this;
        }
        /// Deferred and optimized implementation of skip
        skip(nr) {
            this._restrictions.push({ type: RestrictionType.skip, nr: nr });
            return this;
        }
        /// Deferred and optimized implementation of skipLast
        skipLast(nr) {
            this._restrictions.push({ type: RestrictionType.skipLast, nr: nr });
            return this;
        }
    }
    Linqer.OrderedEnumerable = OrderedEnumerable;
    function _ensureFunction(f) {
        if (!f || typeof f !== 'function')
            throw new Error('the argument needs to be a function!');
    }
    function _swapArrayItems(array, leftIndex, rightIndex) {
        const temp = array[leftIndex];
        array[leftIndex] = array[rightIndex];
        array[rightIndex] = temp;
    }
    function _partition(items, left, right, comparer) {
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
            }
            else {
                if (left === right)
                    return left + 1;
            }
        }
        return left;
    }
    function _quickSort(items, left, right, comparer = Linqer._defaultComparer, minIndex = 0, maxIndex = Number.MAX_SAFE_INTEGER) {
        if (!items.length)
            return items;
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
})(Linqer || (Linqer = {}));
//# sourceMappingURL=LInQer.js.map