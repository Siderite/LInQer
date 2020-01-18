(function () {
    /// randomizes the enumerable
    Enumerable.prototype.shuffle = function () {
        function* gen() {
            const arr = Array.from(this);
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
        return Enumerable.from(gen.bind(this));
    };
    /// returns the distinct values based on a hashing function
    Enumerable.prototype.distinctByHash = function (hashFunc) {
        const gen = function* () {
            const distinctValues = new Set();
            for (const item of this) {
                const size = distinctValues.size;
                distinctValues.add(hashFunc(item));
                if (size < distinctValues.size) {
                    yield item;
                }
            }
        };
        return new Enumerable(gen.bind(this));
    };
    /// returns the values that have different hashes from the items of the iterable provided
    Enumerable.prototype.exceptByHash = function (iterable, hashFunc) {
        _ensureIterable(iterable);
        const gen = function* () {
            const distinctValues = new Enumerable(iterable).select(hashFunc).toSet();
            for (const item of this) {
                if (!distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Enumerable(gen.bind(this));
    };
    /// returns the values that have the same hashes as items of the iterable provided
    Enumerable.prototype.intersectByHash = function (iterable, hashFunc) {
        _ensureIterable(iterable);
        const gen = function* () {
            const distinctValues = new Enumerable(iterable).select(hashFunc).toSet();
            for (const item of this) {
                if (distinctValues.has(hashFunc(item))) {
                    yield item;
                }
            }
        };
        return new Enumerable(gen.bind(this));
    };

    /// returns the index of a value in an ordered enumerable or false if not found
    /// WARNING: use the same comparer as the one used in the ordered enumerable. The algorithm assumes the enumerable is already sorted.
    OrderedEnumerable.prototype.binarySearch = function(value, comparer = _defaultComparer) {
        const arr = _toArray(this);
        let start = 0;
        let end = arr.length - 1;

        while (start <= end) {
            const mid = (start + end) >> 1;
            const comp = comparer(arr[mid], value);
            if (comp==0) return mid;
            if (comp<0) {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }

        return false;
    };

	function _ensureIterable(src) {
		if (!src || !src[Symbol.iterator]) throw new Error('the argument must be iterable!');
	}
    function _toArray(enumerable) {
		if (!enumerable) return [];
		if (Array.isArray(enumerable)) return enumerable;
		return Array.from(enumerable);
	}
	function _defaultComparer(item1, item2) {
		if (item1 > item2) return 1;
		if (item1 < item2) return -1;
		return 0;
	}

})();