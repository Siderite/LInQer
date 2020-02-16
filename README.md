# LInQer
The C# Language Integrated Queries ported for Javascript for amazing performance

[![npm version](https://badge.fury.io/js/%40siderite%2Flinqer.svg)](https://badge.fury.io/js/%40siderite%2Flinqer) [![License: MIT](https://img.shields.io/badge/Licence-MIT-blueviolet)](https://opensource.org/licenses/MIT)

# Installation
```sh
$ npm install @siderite/linqer
```

# Quick start
```sh
const source = ... an array or a generator function or anything that is iterable... ;
const enumerable = Linqer.Enumerable.from(source); // now you can both iterate and use LINQ like functions
const result = enumerable
                .where(item=>!!item.value) // like filter
                .select(item=>{ value: item.value, key: item.name }) // like map
                .groupBy(item=>item.key)
                .where(g=>g.length>10)
                .orderBy(g=>g.key)
                .selectMany()
                .skip(15)
                .take(5);
for (const item of result) ...
```
in Node.js you have to prepend:
```
const Linqer = require('@siderite/linqer');
```


# Licence
MIT

Array functions in Javascript create a new array for each operation, which is terribly wasteful. Using iterators and generator functions and objects, we can limit the operations to the items in the array that interest us, not all of them.

# Blog post
https://siderite.dev/blog/linq-in-javascript-linqer. Leave comments there or add Issues on GitHub for feedback and support.

# Hosted
Find it hosted on GitHub Pages and use it freely in your projects at: 
 - https://siderite.github.io/LInQer/LInQer.min.js - main library
 - https://siderite.github.io/LInQer/LInQer.slim.min.js - only basic functionality
 - https://siderite.github.io/LInQer/LInQer.extra.min.js - extra functionality (needs main Linqer)

# Reference
Reference **Linqer.slim.js** for the basic methods:
- from, empty, range, repeat - static on Linqer.Enumerable
- length property - same as count, but throws error if the enumerable needs to be enumerated to get the length (no side effects)
- concat
- count
- distinct
- elementAt and elementAtOrDefault
- first and firstOrDefault
- last and lastOrDefault
- min, max, stats (min, max and count)
- select
- skip and take
- splice function - kind of useless, but it was an experiment to see if I can make Enumerable appear as an Array-like object
- sum and sumAndCount (sum and count)
- toArray
- toList - similar to toArray, but returns a seekable Enumerable (itself if already seekable) that can do *count* and *elementAt* without iterating
- where

Reference **Linqer.js** for all of the original Enumerable methods, the ones in slim and then the following:
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
- join
- groupBy
- groupJoin
- longCount
- ofType
- orderBy
- orderByDescending
- prepend
- reverse
- selectMany
- sequenceEqual
- single
- singleOrDefault
- skip - on an ordered enumerable
- skipLast - on a regular or ordered enumerable
- skipWhile
- slice
- take - on an ordered enumerable
- takeLast - on a regular or ordered enumerable
- takeWhile
- thenBy - on an ordered enumerable
- thenByDescending - on an ordered enumerable
- toDictionary - throws not implemented
- toLookup - throws not implemented
- toMap
- toObject
- toHashSet - throws not implemented
- toSet
- union
- zip

Reference **Linqer.extra.js** (needs **Linqer.js**) for some additional methods:
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

# Original *Enumerable* .NET class

The original C# class can be found here: https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable .

# Building the solution

The library has been ported to Typescript. Run **build.bat** to create the .js and .map files from the .ts code.