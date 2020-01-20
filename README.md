# LInQer
The C# Language Integrated Queries ported for Javascript for amazing performance

Array functions in Javascript create a new array for each operation, which is terribly wasteful. Using iterators and generator functions and objects, we can limit the operations to the items in the array that interest us, not all of them.

More details on the blog post for it: https://siderite.dev/blog/linq-in-javascript-linqer/. Leave comments there or add Issues here in order to get features or bug fixes or whatever.

Find it hosted on GitHub Pages and use it freely in your projects at: https://siderite.github.io/LInQer/LInQer.min.js and https://siderite.github.io/LInQer/LInQer.extra.min.js .

**Usage**

```
const source = ... an array or a generator function or anything that is iterable... ;
const enumerable = Enumerable.from(source); // now you can both iterate and use LINQ like functions
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
