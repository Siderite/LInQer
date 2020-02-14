declare namespace Linqer {
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
        _tryGetAt: null | ((index: number) => {
            value: any;
        } | null);
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
        constructor(src: IterableType);
        /**
         * Wraps an iterable item into an Enumerable if it's not already one
         *
         * @static
         * @param {IterableType} iterable
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        static from(iterable: IterableType): Enumerable;
        /**
         * the Enumerable instance exposes the same iterator as the wrapped iterable or generator function
         *
         * @returns {Iterator<any>}
         * @memberof Enumerable
         */
        [Symbol.iterator](): Iterator<any>;
        /**
         * returns an empty Enumerable
         *
         * @static
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        static empty(): Enumerable;
        /**
         * generates a sequence of integer numbers within a specified range.
         *
         * @static
         * @param {number} start
         * @param {number} count
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        static range(start: number, count: number): Enumerable;
        /**
         *  Generates a sequence that contains one repeated value.
         *
         * @static
         * @param {*} item
         * @param {number} count
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        static repeat(item: any, count: number): Enumerable;
        /**
         * Same value as count(), but will throw an Error if enumerable is not seekable and has to be iterated to get the length
         */
        get length(): number;
        /**
         * Concatenates two sequences by appending iterable to the existing one.
         *
         * @param {IterableType} iterable
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        concat(iterable: IterableType): Enumerable;
        /**
         * Returns distinct elements from a sequence.
         * WARNING: using a comparer makes this slower. Not specifying it uses a Set to determine distinctiveness.
         *
         * @param {IEqualityComparer} [equalityComparer=EqualityComparer.default]
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        distinct(equalityComparer?: IEqualityComparer): Enumerable;
        /**
         * Returns the element at a specified index in a sequence.
         *
         * @param {number} index
         * @returns {*}
         * @memberof Enumerable
         */
        elementAt(index: number): any;
        /**
         * Returns the element at a specified index in a sequence or undefined if the index is out of range.
         *
         * @param {number} index
         * @returns {(any | undefined)}
         * @memberof Enumerable
         */
        elementAtOrDefault(index: number): any | undefined;
        /**
         * Returns the first element of a sequence.
         *
         * @returns {*}
         * @memberof Enumerable
         */
        first(): any;
        /**
         * Returns the first element of a sequence, or a default value if no element is found.
         *
         * @returns {(any | undefined)}
         * @memberof Enumerable
         */
        firstOrDefault(): any | undefined;
        /**
         * Returns the last element of a sequence.
         *
         * @returns {*}
         * @memberof Enumerable
         */
        last(): any;
        /**
         * Returns the last element of a sequence, or undefined if no element is found.
         *
         * @returns {(any | undefined)}
         * @memberof Enumerable
         */
        lastOrDefault(): any | undefined;
        /**
         * Returns the count, minimum and maximum value in a sequence of values.
         * A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
         *
         * @param {IComparer} [comparer]
         * @returns {{ count: number, min: any, max: any }}
         * @memberof Enumerable
         */
        stats(comparer?: IComparer): {
            count: number;
            min: any;
            max: any;
        };
        /**
         *  Returns the minimum value in a sequence of values.
         *  A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
         *
         * @param {IComparer} [comparer]
         * @returns {*}
         * @memberof Enumerable
         */
        min(comparer?: IComparer): any;
        /**
         *  Returns the maximum value in a sequence of values.
         *  A custom function can be used to establish order (the result 0 means equal, 1 means larger, -1 means smaller)
         *
         * @param {IComparer} [comparer]
         * @returns {*}
         * @memberof Enumerable
         */
        max(comparer?: IComparer): any;
        /**
         * Projects each element of a sequence into a new form.
         *
         * @param {ISelector} selector
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        select(selector: ISelector): Enumerable;
        /**
         * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
         *
         * @param {number} nr
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        skip(nr: number): Enumerable;
        /**
         * Takes start elements, ignores howmany elements, continues with the new items and continues with the original enumerable
         * Equivalent to the value of an array after performing splice on it with the same parameters
         * @param start
         * @param howmany
         * @param items
         * @returns splice
         */
        splice(start: number, howmany: number, ...newItems: any[]): Enumerable;
        /**
         * Computes the sum of a sequence of numeric values.
         *
         * @returns {(number | undefined)}
         * @memberof Enumerable
         */
        sum(): number | undefined;
        /**
         * Computes the sum and count of a sequence of numeric values.
         *
         * @returns {{ sum: number, count: number }}
         * @memberof Enumerable
         */
        sumAndCount(): {
            sum: number;
            count: number;
        };
        /**
         * Returns a specified number of contiguous elements from the start of a sequence.
         *
         * @param {number} nr
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        take(nr: number): Enumerable;
        /**
         * creates an array from an Enumerable
         *
         * @returns {any[]}
         * @memberof Enumerable
         */
        toArray(): any[];
        /**
         * similar to toArray, but returns a seekable Enumerable (itself if already seekable) that can do count and elementAt without iterating
         *
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        toList(): Enumerable;
        /**
         * Filters a sequence of values based on a predicate.
         *
         * @param {IFilter} condition
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        where(condition: IFilter): Enumerable;
    }
    export function _ensureIterable(src: IterableType): void;
    export function _ensureFunction(f: Function): void;
    export function _toArray(enumerable: IterableType): any[];
    export function _ensureInternalCount(enumerable: Enumerable): void;
    export function _ensureInternalTryGetAt(enumerable: Enumerable): void;
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
    export const _defaultComparer: IComparer;
    /**
     * Interface for an equality comparer
     */
    export type IEqualityComparer = (item1: any, item2: any) => boolean;
    /**
     * Predefined equality comparers
     * default is the equivalent of ==
     * exact is the equivalent of ===
     */
    export const EqualityComparer: {
        default: (item1: any, item2: any) => boolean;
        exact: (item1: any, item2: any) => boolean;
    };
    interface IUsesQuickSort {
        _useQuickSort: boolean;
    }
    export {};
}
declare namespace Linqer {
    interface Enumerable extends Iterable<any> {
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
         * Selects the elements starting at the given start argument, and ends at, but does not include, the given end argument.
         * @param start
         * @param end
         * @returns slice
         */
        slice(start: number | undefined, end: number | undefined): Enumerable;
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
        toObject(keySelector: ISelector, valueSelector: ISelector): {
            [key: string]: any;
        };
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
}
declare namespace Linqer {
    interface Enumerable extends Iterable<any> {
        /**
         * Groups the elements of a sequence.
         *
         * @param {ISelector} keySelector
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        groupBy(keySelector: ISelector): Enumerable;
        /**
         * Correlates the elements of two sequences based on key equality and groups the results. A specified equalityComparer is used to compare keys.
         * WARNING: using the equality comparer will be slower
         *
         * @param {IterableType} iterable
         * @param {ISelector} innerKeySelector
         * @param {ISelector} outerKeySelector
         * @param {(item1: any, item2: any) => any} resultSelector
         * @param {IEqualityComparer} equalityComparer
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        groupJoin(iterable: IterableType, innerKeySelector: ISelector, outerKeySelector: ISelector, resultSelector: (item1: any, item2: any) => any, equalityComparer: IEqualityComparer): Enumerable;
        /**
         * Correlates the elements of two sequences based on matching keys.
         * WARNING: using the equality comparer will be slower
         *
         * @param {IterableType} iterable
         * @param {ISelector} innerKeySelector
         * @param {ISelector} outerKeySelector
         * @param {(item1: any, item2: any) => any} resultSelector
         * @param {IEqualityComparer} equalityComparer
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        join(iterable: IterableType, innerKeySelector: ISelector, outerKeySelector: ISelector, resultSelector: (item1: any, item2: any) => any, equalityComparer: IEqualityComparer): Enumerable;
        toLookup(): never;
    }
    /**
     * An Enumerable that also exposes a group key
     *
     * @export
     * @class GroupEnumerable
     * @extends {Enumerable}
     */
    class GroupEnumerable extends Enumerable {
        key: string;
        constructor(iterable: IterableType, key: string);
    }
}
declare namespace Linqer {
    export interface Enumerable extends Iterable<any> {
        /**
         * Sorts the elements of a sequence in ascending order.
         *
         * @param {ISelector} keySelector
         * @returns {OrderedEnumerable}
         * @memberof Enumerable
         */
        orderBy(keySelector: ISelector): OrderedEnumerable;
        /**
         * Sorts the elements of a sequence in descending order.
         *
         * @param {ISelector} keySelector
         * @returns {OrderedEnumerable}
         * @memberof Enumerable
         */
        orderByDescending(keySelector: ISelector): OrderedEnumerable;
        /**
         * use QuickSort for ordering (default). Recommended when take, skip, takeLast, skipLast are used after orderBy
         *
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        useQuickSort(): Enumerable;
        /**
         * use the default browser sort implementation for ordering at all times
         *
         * @returns {Enumerable}
         * @memberof Enumerable
         */
        useBrowserSort(): Enumerable;
    }
    enum RestrictionType {
        skip = 0,
        skipLast = 1,
        take = 2,
        takeLast = 3
    }
    /**
     * An Enumerable yielding ordered items
     *
     * @export
     * @class OrderedEnumerable
     * @extends {Enumerable}
     */
    export class OrderedEnumerable extends Enumerable {
        _keySelectors: {
            keySelector: ISelector;
            ascending: boolean;
        }[];
        _restrictions: {
            type: RestrictionType;
            nr: number;
        }[];
        /**
         *Creates an instance of OrderedEnumerable.
         * @param {IterableType} src
         * @param {ISelector} [keySelector]
         * @param {boolean} [ascending=true]
         * @memberof OrderedEnumerable
         */
        constructor(src: IterableType, keySelector?: ISelector, ascending?: boolean);
        private getSortedArray;
        private generateSortFunc;
        private getStartAndEndIndexes;
        /**
         * Performs a subsequent ordering of the elements in a sequence in ascending order.
         *
         * @param {ISelector} keySelector
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        thenBy(keySelector: ISelector): OrderedEnumerable;
        /**
         * Performs a subsequent ordering of the elements in a sequence in descending order.
         *
         * @param {ISelector} keySelector
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        thenByDescending(keySelector: ISelector): OrderedEnumerable;
        /**
         * Deferred and optimized implementation of take
         *
         * @param {number} nr
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        take(nr: number): OrderedEnumerable;
        /**
         * Deferred and optimized implementation of takeLast
         *
         * @param {number} nr
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        takeLast(nr: number): OrderedEnumerable;
        /**
         * Deferred and optimized implementation of skip
         *
         * @param {number} nr
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        skip(nr: number): OrderedEnumerable;
        /**
         * Deferred and optimized implementation of skipLast
         *
         * @param {number} nr
         * @returns {OrderedEnumerable}
         * @memberof OrderedEnumerable
         */
        skipLast(nr: number): OrderedEnumerable;
        /**
         * An optimized implementation of toArray
         *
         * @returns {any[]}
         * @memberof OrderedEnumerable
         */
        toArray(): any[];
        /**
         * An optimized implementation of toMap
         *
         * @param {ISelector} keySelector
         * @param {ISelector} [valueSelector=x => x]
         * @returns {Map<any, any>}
         * @memberof OrderedEnumerable
         */
        toMap(keySelector: ISelector, valueSelector?: ISelector): Map<any, any>;
        /**
         * An optimized implementation of toObject
         *
         * @param {ISelector} keySelector
         * @param {ISelector} [valueSelector=x => x]
         * @returns {{ [key: string]: any }}
         * @memberof OrderedEnumerable
         */
        toObject(keySelector: ISelector, valueSelector?: ISelector): {
            [key: string]: any;
        };
        /**
         * An optimized implementation of to Set
         *
         * @returns {Set<any>}
         * @memberof OrderedEnumerable
         */
        toSet(): Set<any>;
    }
    export {};
}
declare namespace Linqer {
    interface Enumerable extends Iterable<any> {
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
}
