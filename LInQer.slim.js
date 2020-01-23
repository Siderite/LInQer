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
//# sourceMappingURL=LInQer.slim.js.map