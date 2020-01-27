# LInQer v1.0.0
The C# Language Integrated Queries ported for Javascript for amazing performance

Array functions in Javascript create a new array for each operation, which is terribly wasteful. Using iterators and generator functions and objects, we can limit the operations to the items in the array that interest us, not all of them.

More details on the blog post for it: https://siderite.dev/blog/linq-in-javascript-linqer/. Leave comments there or add Issues here in order to get features or bug fixes or whatever.

Find it hosted on GitHub Pages and use it freely in your projects at: 
 - https://siderite.github.io/LInQer/LInQer.min.js
 - https://siderite.github.io/LInQer/LInQer.slim.min.js
 - https://siderite.github.io/LInQer/LInQer.extra.min.js .

**Usage**

Reference Linqer.slim.js for the basic methods:
- the static from, empty, range, repeat
- concat
- count
- distinct
- elementAt and elementAtOrDefault
- first and firstOrDefault
- last and lastOrDefault
- min, max, stats (min, max and count)
- select
- skip and take
- sum and sumAndCount (sum and count)
- toArray
- toList - similar to toArray, but returns an Enumerable (itself if already seekable)
- where

Reference Linqer.js for all of the original Enumerable methods, the ones in slim plus:
- aggregate
- all
- any
- append
- average
- asEnumerable
- cast
- contains
- defaultIfEmpty - throws not implemented
- except
- intersect
- longCount
- ofType
- prepend
- reverse
- selectMany
- sequenceEqual
- single
- singleOrDefault
- skipLast
- skipWhile
- takeLast
- takeWhile
- toDictionary - throws not implemented
- toMap
- toObject
- toHashSet - throws not implemented
- toSet
- toList - throws not implemented
- union
- zip

Reference Linqer.extra.js (needs Linqer.js) for some additional methods:
- shuffle - randomizes the enumerable
- randomSample - implements random reservoir sampling of k items
- distinctByHash - distinct based on a hashing function, not a comparer - faster
- exceptByHash - except based on a hashing function, not a comparer - faster
- intersectByHash - intersect based on a hashing function, not a comparer - faster
- binarySearch - find the index of a value in a sorted enumerable by binary search
- lag - joins each item of the enumerable with previous items from the same enumerable
- lead - joins each item of the enumerable with next items from the same enumerable
- padStart - pad enumerable at the start to a minimum length
- padEnd - pad enumerable at the end to a minimum length

```
const source = ... an array or a generator function or anything that is iterable... ;
const enumerable = Linqer.Enumerable.from(source); // now you can both iterate and use LINQ like functions
const result = enumerable
                .where(item=>!!item.value) // like filter
                .select(item=>{ value: item.value, key: item.name }) // like map
                .groupBy(item=>item.key)
                .where(g=>g.length>10)
                .selectMany()
                .skip(15)
                .take(5)
                .toArray();
 ```
                
**Original Enumerable**

The original C# class can be found here: https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable .

**Building the solution**

The source files have been moved to Typescript. Run build.bat to create the js and map files.