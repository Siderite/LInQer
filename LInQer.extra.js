"use strict";
/// <reference path="./LInQer.Slim.ts" />
/// <reference path="./LInQer.Enumerable.ts" />
/// <reference path="./LInQer.OrderedEnumerable.ts" />
var Linqer;
/// <reference path="./LInQer.Slim.ts" />
/// <reference path="./LInQer.Enumerable.ts" />
/// <reference path="./LInQer.OrderedEnumerable.ts" />
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
        const result = Enumerable.from(gen);
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
        return Enumerable.from(sample);
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
        return new Enumerable(gen);
    };
    /// returns the values that have different hashes from the items of the iterable provided
    Linqer.Enumerable.prototype.exceptByHash = function (iterable, hashFunc) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = function* () {
            const distinctValues = Enumerable.from(iterable).select(hashFunc).toSet();
            for (const item of self) {
                if (!distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Enumerable(gen);
    };
    /// returns the values that have the same hashes as items of the iterable provided
    Linqer.Enumerable.prototype.intersectByHash = function (iterable, hashFunc) {
        Linqer._ensureIterable(iterable);
        const self = this;
        const gen = function* () {
            const distinctValues = Enumerable.from(iterable).select(hashFunc).toSet();
            for (const item of self) {
                if (distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Enumerable(gen);
    };
    /// returns the index of a value in an ordered enumerable or false if not found
    /// WARNING: use the same comparer as the one used in the ordered enumerable. The algorithm assumes the enumerable is already sorted.
    Linqer.OrderedEnumerable.prototype.binarySearch = function (value, comparer = Linqer._defaultComparer) {
        let enumerable = this;
        Linqer._ensureInternalTryGetAt(this);
        if (!this._canSeek) {
            enumerable = Enumerable.from(Array.from(this));
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
})(Linqer || (Linqer = {}));
//# sourceMappingURL=LInQer.extra.js.map