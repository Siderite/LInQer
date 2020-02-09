/// <reference path="./LInQer.Slim.ts" />
/// <reference path="./LInQer.Enumerable.ts" />
/// <reference path="./LInQer.OrderedEnumerable.ts" />

namespace Linqer {

    export interface Enumerable extends Iterable<any> {
        /**
         * Returns a randomized sequence of items from an initial source
         * @returns shuffle 
         */
        shuffle(): Enumerable;
        /**
         * implements random reservoir sampling of k items, with the option to specify a maximum limit for the items
         * @param k 
         * @param limit 
         * @returns sample 
         */
        randomSample(k: number, limit: number): Enumerable;
        /**
         * Returns the count of the items in a sequence. Depending on the sequence type this iterates through it or not.
         * @returns count 
         */
        count(): number;
        /**
         * returns the distinct values based on a hashing function
         *
         * @param {ISelector} hashFunc
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        distinctByHash(hashFunc: ISelector): Enumerable;
        /**
         * returns the values that have different hashes from the items of the iterable provided
         *
         * @param {IterableType} iterable
         * @param {ISelector} hashFunc
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        exceptByHash(iterable: IterableType, hashFunc: ISelector): Enumerable;
        /**
         * returns the values that have the same hashes as items of the iterable provided
         *
         * @param {IterableType} iterable
         * @param {ISelector} hashFunc
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        intersectByHash(iterable: IterableType, hashFunc: ISelector): Enumerable;
        /**
         * returns the index of a value in an ordered enumerable or false if not found
         * WARNING: use the same comparer as the one used to order the enumerable. The algorithm assumes the enumerable is already sorted.
         *
         * @param {*} value
         * @param {IComparer} comparer
         * @returns {(number | boolean)}
         * @memberof Enumerable
         */
        binarySearch(value: any, comparer: IComparer): number | boolean;
        /**
         * joins each item of the enumerable with previous items from the same enumerable
         * @param offset 
         * @param zipper 
         * @returns lag 
         */
        lag(offset: number, zipper: (item1: any, item2: any) => any): Enumerable;
        /**
         * joins each item of the enumerable with next items from the same enumerable
         *
         * @param {number} offset
         * @param {(item1: any, item2: any) => any} zipper
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        lead(offset: number, zipper: (item1: any, item2: any) => any): Enumerable;
        /**
         * returns an enumerable of at least minLength, padding the end with a value or the result of a function
         *
         * @param {number} minLength
         * @param {(any | ((index: number) => any))} filler
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        padEnd(minLength: number, filler: any | ((index: number) => any)): Enumerable;
        /**
         * returns an enumerable of at least minLength, padding the start with a value or the result of a function
         * if the enumerable cannot seek, then it will be iterated minLength time
         *
         * @param {number} minLength
         * @param {(any | ((index: number) => any))} filler
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        padStart(minLength: number, filler: any | ((index: number) => any)): Enumerable;
    }

    /// randomizes the enumerable
    Enumerable.prototype.shuffle = function (): Enumerable {
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
    Enumerable.prototype.randomSample = function (k: number, limit: number = Number.MAX_SAFE_INTEGER): Enumerable {
        let index = 0;
        const sample = [];
        _ensureInternalTryGetAt(this);
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
        } else { // R algorithm
            for (const item of this) {
                if (index < k) {
                    sample.push(item);
                } else {
                    const j = Math.floor(Math.random() * index);
                    if (j < k) {
                        sample[j] = item;
                    }
                }
                index++;
                if (index >= limit) break;
            }
        }
        return Enumerable.from(sample);
    }

    /// returns the distinct values based on a hashing function
    Enumerable.prototype.distinctByHash = function (hashFunc: ISelector): Enumerable {
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
    Enumerable.prototype.exceptByHash = function (iterable: IterableType, hashFunc: ISelector): Enumerable {
        _ensureIterable(iterable);
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
    Enumerable.prototype.intersectByHash = function (iterable: IterableType, hashFunc: ISelector): Enumerable {
        _ensureIterable(iterable);
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
    Enumerable.prototype.binarySearch = function (value: any, comparer: IComparer = _defaultComparer): number | boolean {
        let enumerable: Enumerable = this;
        _ensureInternalTryGetAt(this);
        if (!this._canSeek) {
            enumerable = Enumerable.from(Array.from(this));
        }
        let start = 0;
        let end = enumerable.count() - 1;

        while (start <= end) {
            const mid = (start + end) >> 1;
            const comp = comparer(enumerable.elementAt(mid), value);
            if (comp == 0) return mid;
            if (comp < 0) {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }

        return false;
    };

    /// joins each item of the enumerable with previous items from the same enumerable
    Enumerable.prototype.lag = function (offset: number, zipper: (item1: any, item2: any) => any): Enumerable {
        if (!offset) {
            throw new Error('offset has to be positive');
        }
        if (offset < 0) {
            throw new Error('offset has to be positive. Use .lead if you want to join with next items');
        }
        if (!zipper) {
            zipper = (i1, i2) => [i1, i2];
        } else {
            _ensureFunction(zipper);
        }
        const self = this;
        _ensureInternalTryGetAt(this);
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
        const result = new Enumerable(gen);
        result._count = () => {
            const count = self.count();
            if (!result._wasIterated) result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index: number) => {
                const val1 = self._tryGetAt!(index);
                const val2 = self._tryGetAt!(index - offset);
                if (val1) {
                    return {
                        value: zipper(
                            val1.value,
                            val2 ? val2.value : undefined
                        )
                    };
                }
                return null;
            };
        }
        return result;
    }


    /// joins each item of the enumerable with next items from the same enumerable
    Enumerable.prototype.lead = function (offset: number, zipper: (item1: any, item2: any) => any): Enumerable {
        if (!offset) {
            throw new Error('offset has to be positive');
        }
        if (offset < 0) {
            throw new Error('offset has to be positive. Use .lag if you want to join with previous items');
        }
        if (!zipper) {
            zipper = (i1, i2) => [i1, i2];
        } else {
            _ensureFunction(zipper);
        }
        const self = this;
        _ensureInternalTryGetAt(this);
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
        const result = new Enumerable(gen);
        result._count = () => {
            const count = self.count();
            if (!result._wasIterated) result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index: number) => {
                const val1 = self._tryGetAt!(index);
                const val2 = self._tryGetAt!(index - offset);
                if (val1) {
                    return {
                        value: zipper(
                            val1.value,
                            val2 ? val2.value : undefined
                        )
                    };
                }
                return null;
            };
        }
        return result;
    }

    /// returns an enumerable of at least minLength, padding the end with a value or the result of a function
    Enumerable.prototype.padEnd = function (minLength: number, filler: any | ((index: number) => any)): Enumerable {
        if (minLength <= 0) {
            throw new Error('minLength has to be positive.');
        }
        let fillerFunc: (index: number) => any;
        if (typeof filler !== 'function') {
            fillerFunc = (index: number) => filler;
        } else {
            fillerFunc = filler;
        }
        const self = this;
        _ensureInternalTryGetAt(this);
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
        const result = new Enumerable(gen);
        result._count = () => {
            const count = Math.max(minLength, self.count());
            if (!result._wasIterated) result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index: number) => {
                const val = self._tryGetAt!(index);
                if (val) return val;
                if (index < minLength) {
                    return { value: fillerFunc(index) };
                }
                return null;
            };
        }
        return result;
    }


    /// returns an enumerable of at least minLength, padding the start with a value or the result of a function
    /// if the enumerable cannot seek, then it will be iterated minLength time
    Enumerable.prototype.padStart = function (minLength: number, filler: any | ((index: number) => any)): Enumerable {
        if (minLength <= 0) {
            throw new Error('minLength has to be positive.');
        }
        let fillerFunc: (index: number) => any;
        if (typeof filler !== 'function') {
            fillerFunc = (index: number) => filler;
        } else {
            fillerFunc = filler;
        }
        const self = this;
        _ensureInternalTryGetAt(self);
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
                } else {
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
        const result = new Enumerable(gen);
        result._count = () => {
            const count = Math.max(minLength, self.count());
            if (!result._wasIterated) result._wasIterated = self._wasIterated;
            return count;
        };
        if (self._canSeek) {
            result._canSeek = true;
            result._tryGetAt = (index: number) => {
                const count = self.count();
                const delta = minLength-count;
                if (delta<=0) {
                    return self._tryGetAt!(index);
                }
                if (index<delta) {
                    return { value: fillerFunc(index) };
                }
                return self._tryGetAt!(index-delta);
            };
        }
        return result;
    }
}
