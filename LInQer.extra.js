"use strict";
/// <reference path="./Linqer.Slim.ts" />
/// <reference path="./Linqer.Enumerable.ts" />
/// <reference path="./Linqer.OrderedEnumerable.ts" />
var Linqer;
/// <reference path="./Linqer.Slim.ts" />
/// <reference path="./Linqer.Enumerable.ts" />
/// <reference path="./Linqer.OrderedEnumerable.ts" />
(function (Linqer) {
    /// randomizes the enumerable
    Linqer.Enumerable.prototype.shuffle = function () {
        const self = this;
        function* gen() {
            const arr = Array.from(self);
            const len = arr.length;
            let n = 0;
            while (n < len) {
                let k = n + Math.floor(Math.random() * (len - n));
                const value = arr[k];
                arr[k] = arr[n];
                arr[n] = value;
                n++;
                yield value;
            }
        }
        const result = Linqer.Enumerable.from(gen);
        result._count = () => self.count();
        return result;
    };
    /// implements random reservoir sampling of k items, with the option to specify a maximum limit for the items
    Linqer.Enumerable.prototype.randomSample = function (k, limit = Number.MAX_SAFE_INTEGER) {
        let index = 0;
        const sample = [];
        Linqer._ensureInternalTryGetAt(this);
        if (this._canSeek) { // L algorithm
            const length = this.count();
            let index = 0;
            for (index = 0; index < k && index < limit && index < length; index++) {
                sample.push(this.elementAt(index));
            }
            let W = Math.exp(Math.log(Math.random()) / k);
            while (index < length && index < limit) {
                index += Math.floor(Math.log(Math.random()) / Math.log(1 - W)) + 1;
                if (index < length && index < limit) {
                    sample[Math.floor(Math.random() * k)] = this.elementAt(index);
                    W *= Math.exp(Math.log(Math.random()) / k);
                }
            }
        }
        else { // R algorithm
            for (const item of this) {
                if (index < k) {
                    sample.push(item);
                }
                else {
                    const j = Math.floor(Math.random() * index);
                    if (j < k) {
                        sample[j] = item;
                    }
                }
                index++;
                if (index >= limit)
                    break;
            }
        }
        return Linqer.Enumerable.from(sample);
    };
    /// returns the distinct values based on a hashing function
    Linqer.Enumerable.prototype.distinctByHash = function (hashFunc) {
        const self = this;
        const gen = function* () {
            const distinctValues = new Set();
            for (const item of self) {
                const size = distinctValues.size;
                distinctValues.add(hashFunc(item));
                if (size < distinctValues.size) {
                    yield item;
                }
            }
        };
        return new Linqer.Enumerable(gen);
    };
    /// returns the values that have different hashes from the items of the iterable provided
    Linqer.Enumerable.prototype.exceptByHash = function (iterable, hashFunc) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = function* () {
            const distinctValues = Linqer.Enumerable.from(iterable).select(hashFunc).toSet();
            for (const item of self) {
                if (!distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Linqer.Enumerable(gen);
    };
    /// returns the values that have the same hashes as items of the iterable provided
    Linqer.Enumerable.prototype.intersectByHash = function (iterable, hashFunc) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = function* () {
            const distinctValues = Linqer.Enumerable.from(iterable).select(hashFunc).toSet();
            for (const item of self) {
                if (distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Linqer.Enumerable(gen);
    };
    /// returns the index of a value in an ordered enumerable or false if not found
    /// WARNING: use the same comparer as the one used in the ordered enumerable. The algorithm assumes the enumerable is already sorted.
    Linqer.OrderedEnumerable.prototype.binarySearch = function (value, comparer = Linqer._defaultComparer) {
        let enumerable = this;
        Linqer._ensureInternalTryGetAt(this);
        if (!this._canSeek) {
            enumerable = Linqer.Enumerable.from(Array.from(this));
        }
        let start = 0;
        let end = enumerable.count() - 1;
        while (start <= end) {
            const mid = (start + end) >> 1;
            const comp = comparer(enumerable.elementAt(mid), value);
            if (comp == 0)
                return mid;
            if (comp < 0) {
                start = mid + 1;
            }
            else {
                end = mid - 1;
            }
        }
        return false;
    };
    /// joins each item of the enumerable with previous items from the same enumerable
    Linqer.Enumerable.prototype.lag = function (offset, zipper) {
        if (!offset) {
            throw new Error('offset has to be positive');
        }
        if (offset < 0) {
            throw new Error('offset has to be positive. Use .lead if you want to join with next items');
        }
        if (!zipper) {
            zipper = (i1, i2) => [i1, i2];
        }
        else {
            Linqer._ensureFunction(zipper);
        }
        const self = this;
        Linqer._ensureInternalTryGetAt(this);
        const gen = function* () {
            const buffer = Array(offset);
            let index = 0;
            for (const item of self) {
                const index2 = index - offset;
                const item2 = index2 < 0
                    ? undefined
                    : buffer[index2 % offset];
                yield zipper(item, item2);
                buffer[index % offset] = item;
                index++;
            }
        };
        const result = new Linqer.Enumerable(gen);
        result._count = () => {
            const count = self.count();
            if (!result._wasIterated)
                result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index) => {
                const val1 = self._tryGetAt(index);
                const val2 = self._tryGetAt(index - offset);
                if (val1) {
                    return {
                        value: zipper(val1.value, val2 ? val2.value : undefined)
                    };
                }
                return null;
            };
        }
        return result;
    };
    /// joins each item of the enumerable with next items from the same enumerable
    Linqer.Enumerable.prototype.lead = function (offset, zipper) {
        if (!offset) {
            throw new Error('offset has to be positive');
        }
        if (offset < 0) {
            throw new Error('offset has to be positive. Use .lag if you want to join with previous items');
        }
        if (!zipper) {
            zipper = (i1, i2) => [i1, i2];
        }
        else {
            Linqer._ensureFunction(zipper);
        }
        const self = this;
        Linqer._ensureInternalTryGetAt(this);
        const gen = function* () {
            const buffer = Array(offset);
            let index = 0;
            for (const item of self) {
                const index2 = index - offset;
                if (index2 >= 0) {
                    const item2 = buffer[index2 % offset];
                    yield zipper(item2, item);
                }
                buffer[index % offset] = item;
                index++;
            }
            for (let i = 0; i < offset; i++) {
                const item = buffer[(index + i) % offset];
                yield zipper(item, undefined);
            }
        };
        const result = new Linqer.Enumerable(gen);
        result._count = () => {
            const count = self.count();
            if (!result._wasIterated)
                result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index) => {
                const val1 = self._tryGetAt(index);
                const val2 = self._tryGetAt(index - offset);
                if (val1) {
                    return {
                        value: zipper(val1.value, val2 ? val2.value : undefined)
                    };
                }
                return null;
            };
        }
        return result;
    };
    /// returns an enumerable of at least minLength, padding the end with a value or the result of a function
    Linqer.Enumerable.prototype.padEnd = function (minLength, filler) {
        if (minLength <= 0) {
            throw new Error('minLength has to be positive.');
        }
        let fillerFunc;
        if (typeof filler !== 'function') {
            fillerFunc = (index) => filler;
        }
        else {
            fillerFunc = filler;
        }
        const self = this;
        Linqer._ensureInternalTryGetAt(this);
        const gen = function* () {
            let index = 0;
            for (const item of self) {
                yield item;
                index++;
            }
            for (; index < minLength; index++) {
                yield fillerFunc(index);
            }
        };
        const result = new Linqer.Enumerable(gen);
        result._count = () => {
            const count = Math.max(minLength, self.count());
            if (!result._wasIterated)
                result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index) => {
                const val = self._tryGetAt(index);
                if (val)
                    return val;
                if (index < minLength) {
                    return { value: fillerFunc(index) };
                }
                return null;
            };
        }
        return result;
    };
    /// returns an enumerable of at least minLength, padding the start with a value or the result of a function
    /// if the enumerable cannot seek, then it will be iterated minLength time
    Linqer.Enumerable.prototype.padStart = function (minLength, filler) {
        if (minLength <= 0) {
            throw new Error('minLength has to be positive.');
        }
        let fillerFunc;
        if (typeof filler !== 'function') {
            fillerFunc = (index) => filler;
        }
        else {
            fillerFunc = filler;
        }
        const self = this;
        Linqer._ensureInternalTryGetAt(self);
        const gen = function* () {
            const buffer = Array(minLength);
            let index = 0;
            const iterator = self[Symbol.iterator]();
            let flushed = false;
            let done = false;
            do {
                const val = iterator.next();
                done = !!val.done;
                if (!done) {
                    buffer[index] = val.value;
                    index++;
                }
                if (flushed && !done) {
                    yield val.value;
                }
                else {
                    if (done || index === minLength) {
                        for (let i = 0; i < minLength - index; i++) {
                            yield fillerFunc(i);
                        }
                        for (let i = 0; i < index; i++) {
                            yield buffer[i];
                        }
                        flushed = true;
                    }
                }
            } while (!done);
        };
        const result = new Linqer.Enumerable(gen);
        result._count = () => {
            const count = Math.max(minLength, self.count());
            if (!result._wasIterated)
                result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index) => {
                const count = self.count();
                const delta = minLength - count;
                if (delta <= 0) {
                    return self._tryGetAt(index);
                }
                if (index < delta) {
                    return { value: fillerFunc(index) };
                }
                return self._tryGetAt(index - delta);
            };
        }
        return result;
    };
})(Linqer || (Linqer = {}));
//# sourceMappingURL=LInQer.extra.js.map