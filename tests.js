// object and method tests

QUnit.test( "Enumerable.from with empty array", function( assert ) {
    const enumerable = Enumerable.from([]);
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[], "Passed!" );
});

QUnit.test( "Enumerable.from with non empty array", function( assert ) {
    const enumerable = Enumerable.from([1,'a2',3,null]);
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[1,'a2',3,null], "Passed!" );
});

QUnit.test( "Enumerable.from with generator function", function( assert ) {
    function* gen() {
        yield 1;
        yield 'a2';
        yield 3;
        yield null;
    }
    const enumerable = Enumerable.from(gen());
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[1,'a2',3,null], "Passed!" );
});

QUnit.test( "Enumerable.empty", function( assert ) {
    const enumerable = Enumerable.empty();
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[], "Passed!" );
});

QUnit.test( "Enumerable.range", function( assert ) {
    const enumerable = Enumerable.range(10,2);
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[10,11], "Passed!" );
});

QUnit.test( "Enumerable.repeat", function( assert ) {
    const enumerable = Enumerable.repeat(10,2);
    const result =[];
    for (var item of enumerable) result.push(item);
            
    assert.deepEqual( result,[10,10], "Passed!" );
});


QUnit.test( "Enumerable.aggregate with numbers", function( assert ) {
    const result = Enumerable.from([1,2,3]).aggregate(10,(acc,item)=>acc+item*2);
    assert.deepEqual( result,22, "Passed!" );
});

QUnit.test( "Enumerable.aggregate with text", function( assert ) {
    const result = Enumerable.from([1,2,3]).aggregate(10,(acc,item)=>acc+' '+(item*2));
    assert.deepEqual( result,'10 2 4 6', "Passed!" );
});

QUnit.test( "Enumerable.all true", function( assert ) {
    const result = Enumerable.from([1,2,3]).all(item=>item>0);
    assert.deepEqual( result,true, "Passed!" );
});
QUnit.test( "Enumerable.all false", function( assert ) {
    const result = Enumerable.from([1,2,3]).all(item=>item>2);
    assert.deepEqual( result,false, "Passed!" );
});


QUnit.test( "Enumerable.any true", function( assert ) {
    const result = Enumerable.from([1,2,3]).any(item=>item>2);
    assert.deepEqual( result,true, "Passed!" );
});
QUnit.test( "Enumerable.any false", function( assert ) {
    const result = Enumerable.from([1,2,3]).any(item=>item>10);
    assert.deepEqual( result,false, "Passed!" );
});

QUnit.test( "Enumerable.append", function( assert ) {
    const result = Enumerable.from([1,2,3]).append(4).toArray();
    assert.deepEqual( result,[1,2,3,4], "Passed!" );
});

QUnit.test( "Enumerable.average empty", function( assert ) {
    const result = Enumerable.from([]).average();
    assert.deepEqual( result,undefined, "Passed!" );
});
QUnit.test( "Enumerable.average numbers", function( assert ) {
    const result = Enumerable.from([1,2,3]).average();
    assert.deepEqual( result,2, "Passed!" );
});
QUnit.test( "Enumerable.average not numbers", function( assert ) {
    const result = Enumerable.from([1,'xx2',5]).average();
    assert.deepEqual( result,Number.NaN, "Passed!" );
});

QUnit.test( "Enumerable.concat", function( assert ) {
    const result = Enumerable.from([1,'xx2',5]).concat([6,7,8]).toArray();
    assert.deepEqual( result,[1,'xx2',5,6,7,8], "Passed!" );
});

QUnit.test( "Enumerable.contains true", function( assert ) {
    const result = Enumerable.from([1,'xx2',5]).contains(5);
    assert.deepEqual( result,true, "Passed!" );
});
QUnit.test( "Enumerable.contains false", function( assert ) {
    const result = Enumerable.from([1,'xx2',5]).contains(6);
    assert.deepEqual( result,false, "Passed!" );
});

QUnit.test( "Enumerable.count array", function( assert ) {
    const result = Enumerable.from([1,'xx2',5]).count();
    assert.deepEqual( result,3, "Passed!" );
});
QUnit.test( "Enumerable.count Map", function( assert ) {
    const map = new Map();
    map.set(1,2);
    map.set('a','3');
    const result = Enumerable.from(map).count();
    assert.deepEqual( result,2, "Passed!" );
});
QUnit.test( "Enumerable.count Set", function( assert ) {
    const result = Enumerable.from(new Set().add(1).add(2).add(3).add(4)).count();
    assert.deepEqual( result,4, "Passed!" );
});
QUnit.test( "Enumerable.count generator function", function( assert ) {
    function* gen() {
        yield 'a';
        yield 1;
    }
    const result = Enumerable.from(gen()).count();
    assert.deepEqual( result,2, "Passed!" );
});

QUnit.test( "Enumerable.distinct", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).distinct().toArray();
    assert.deepEqual( result,[1,2,3,'3'], "Passed!" );
});
QUnit.test( "Enumerable.distinct equality comparer", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).distinct((i1,i2)=>+(i1) === +(i2)).toArray();
    assert.deepEqual( result,[1,2,3], "Passed!" );
});

QUnit.test( "Enumerable.elementAt in range array", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).elementAt(3);
    assert.deepEqual( result,3, "Passed!" );
});
QUnit.test( "Enumerable.elementAt below range array", function( assert ) {
    assert.throws( ()=>Enumerable.from([1,2,2,3,'3']).elementAt(-3), "Passed!" );
});
QUnit.test( "Enumerable.elementAt above range array", function( assert ) {
    assert.throws( ()=>Enumerable.from([1,2,2,3,'3']).elementAt(30), "Passed!" );
});
QUnit.test( "Enumerable.elementAtOrDefault in range array", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).elementAtOrDefault(3);
    assert.deepEqual( result,3, "Passed!" );
});
QUnit.test( "Enumerable.elementAtOrDefault below range array", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).elementAtOrDefault(-3);
    assert.deepEqual( result,undefined, "Passed!" );
});
QUnit.test( "Enumerable.elementAtOrDefault above range array", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).elementAtOrDefault(30);
    assert.deepEqual( result,undefined, "Passed!" );
});

QUnit.test( "Enumerable.except", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).except([2,3]).toArray();
    assert.deepEqual( result,[1,'3'], "Passed!" );
});
QUnit.test( "Enumerable.except equality comparer", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).except([2,3],(i1,i2)=>+(i1) === +(i2)).toArray();
    assert.deepEqual( result,[1], "Passed!" );
});

QUnit.test( "Enumerable.first", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).first();
    assert.deepEqual( result,1, "Passed!" );
});
QUnit.test( "Enumerable.first empty", function( assert ) {
    assert.throws(()=>Enumerable.from([]).first(), "Passed!" );
});
QUnit.test( "Enumerable.firstOrDefault", function( assert ) {
    const result = Enumerable.from([]).firstOrDefault();
    assert.deepEqual( result,undefined, "Passed!" );
});

QUnit.test( "Enumerable.groupBy", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3','sasa','0x4']).groupBy(item=>+(item)>2);
    assert.deepEqual( result.keys,[false,true], "Passed!" );
    assert.deepEqual( result[true],[3,'3','0x4'], "Passed!" );
    assert.deepEqual( result[false],[1,2,2,'sasa'], "Passed!" );
    assert.deepEqual( result.toArray(),[[false,[1,2,2,'sasa']],[true,[3,'3','0x4']]], "Passed!" );
});

QUnit.test( "Enumerable.intersect", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).intersect([2,3,4]).toArray();
    assert.deepEqual( result,[2,2,3], "Passed!" );
});
QUnit.test( "Enumerable.intersect equality comparer", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).intersect([2,3,4],(i1,i2)=>+i1 === +i2).toArray();
    assert.deepEqual( result,[2,2,3,'3'], "Passed!" );
});

QUnit.test( "Enumerable.last", function( assert ) {
    const result = Enumerable.from([1,2,2,3,'3']).last();
    assert.deepEqual( result,'3', "Passed!" );
});
QUnit.test( "Enumerable.last empty", function( assert ) {
    assert.throws(()=>Enumerable.from([]).last(), "Passed!" );
});
QUnit.test( "Enumerable.lastOrDefault", function( assert ) {
    const result = Enumerable.from([]).lastOrDefault();
    assert.deepEqual( result,undefined, "Passed!" );
});

QUnit.test( "Enumerable.longCount empty", function( assert ) {
    const result = Enumerable.from([]).longCount();
    assert.deepEqual( result,0, "Passed!" );
});
QUnit.test( "Enumerable.longCount array", function( assert ) {
    const result = Enumerable.from([1,2,3]).longCount();
    assert.deepEqual( result,3, "Passed!" );
});

QUnit.test( "Enumerable.max numbers", function( assert ) {
    const result = Enumerable.from([3,5,1,2,56,2,-100,43]).max();
    assert.deepEqual( result,56, "Passed!" );
});
QUnit.test( "Enumerable.max strings", function( assert ) {
    const result = Enumerable.from(['ba','a','abba','aaa','bb']).max();
    assert.deepEqual( result,'bb', "Passed!" );
});

QUnit.test( "Enumerable.min number", function( assert ) {
    const result = Enumerable.from([3,5,1,2,56,2,-100,43]).min();
    assert.deepEqual( result,-100, "Passed!" );
});
QUnit.test( "Enumerable.min custom comparer", function( assert ) {
    const result = Enumerable.from([3,5,1,2,56,2,-100,43]).min((i1,i2)=>i1.toString().length-i2.toString().length);
    assert.deepEqual( result,3, "Passed!" );
});

QUnit.test( "Enumerable.ofType string parameter", function( assert ) {
    const result = Enumerable.from([undefined, null, Number.NaN,1,-1000,'some text',{value:'an object'}, Enumerable.empty]).ofType('string').toArray();
    assert.deepEqual( result,['some text'], "Passed!" );
});
QUnit.test( "Enumerable.ofType type parameter", function( assert ) {
    const enumerable = Enumerable.empty();
    const result = Enumerable.from([undefined, null, Number.NaN,1,-1000,'some text',{value:'an object'}, enumerable]).ofType(Enumerable).toArray();
    assert.deepEqual( result,[enumerable], "Passed!" );
});

QUnit.test( "Enumerable.orderBy", function( assert ) {
    const result = Enumerable.from([1,3,2,4,5,0]).orderBy().toArray();
    assert.deepEqual( result,[0,1,2,3,4,5], "Passed!" );
});
QUnit.test( "Enumerable.orderBy custom comparer", function( assert ) {
    const result = Enumerable.from([1,3,2,4,5,0]).orderBy(i=>i%2).toArray();
    assert.deepEqual( result,[2,4,0,1,3,5], "Passed!" );
});
QUnit.test( "Enumerable.orderByDescending", function( assert ) {
    const result = Enumerable.from([1,3,2,4,5,0]).orderByDescending().toArray();
    assert.deepEqual( result,[5,4,3,2,1,0], "Passed!" );
});

QUnit.test( "Enumerable.prepend", function( assert ) {
    const result = Enumerable.from([1,3,2]).prepend(0).toArray();
    assert.deepEqual( result,[0,1,3,2], "Passed!" );
});

QUnit.test( "Enumerable.reverse", function( assert ) {
    const result = Enumerable.from(['a',1,3,2]).reverse().toArray();
    assert.deepEqual( result,[2,3,1,'a'], "Passed!" );
});

QUnit.test( "Enumerable.select", function( assert ) {
    const result = Enumerable.from(['a',1,3,2]).select(item=>Number.isInteger(item)?item*item:item+'^2').toArray();
    assert.deepEqual( result,['a^2',1,9,4], "Passed!" );
});

QUnit.test( "Enumerable.selectMany", function( assert ) {
    const result = Enumerable.from([[1,2],[2,3]]).selectMany().toArray();
    assert.deepEqual( result,[1,2,2,3], "Passed!" );
});
QUnit.test( "Enumerable.selectMany custom function", function( assert ) {
    const result = Enumerable.from([[1,2],[2,3,4]]).selectMany(item=>[item.length]).toArray();
    assert.deepEqual( result,[2,3], "Passed!" );
});

QUnit.test( "Enumerable.sequenceEqual true", function( assert ) {
    const result = Enumerable.from([1,2,3]).sequenceEqual([1,2,3]);
    assert.deepEqual( result,true, "Passed!" );
});
QUnit.test( "Enumerable.sequenceEqual false shorter", function( assert ) {
    const result = Enumerable.from([1,2]).sequenceEqual([1,2,3]);
    assert.deepEqual( result,false, "Passed!" );
});
QUnit.test( "Enumerable.sequenceEqual false shorter 2", function( assert ) {
    const result = Enumerable.from([1,2,3]).sequenceEqual([1,2]);
    assert.deepEqual( result,false, "Passed!" );
});
QUnit.test( "Enumerable.sequenceEqual false out of order", function( assert ) {
    const result = Enumerable.from([1,3,2]).sequenceEqual([1,2,3]);
    assert.deepEqual( result,false, "Passed!" );
});

QUnit.test( "Enumerable.single true", function( assert ) {
    const result = Enumerable.from([11]).single();
    assert.deepEqual( result,11, "Passed!" );
});
QUnit.test( "Enumerable.single empty throws", function( assert ) {
    assert.throws( ()=>Enumerable.empty().single(), "Passed!" );
});
QUnit.test( "Enumerable.single multiple throws", function( assert ) {
    assert.throws( ()=>Enumerable.from([1,2]).single(), "Passed!" );
});
QUnit.test( "Enumerable.singleOrDefault true", function( assert ) {
    const result = Enumerable.from([11]).singleOrDefault();
    assert.deepEqual( result,11, "Passed!" );
});
QUnit.test( "Enumerable.singleOrDefault empty", function( assert ) {
    const result = Enumerable.from([]).singleOrDefault();
    assert.deepEqual( result,undefined, "Passed!" );
});
QUnit.test( "Enumerable.singleOrDefault multiple throws", function( assert ) {
    assert.throws( ()=>Enumerable.from([1,2]).singleOrDefault(), "Passed!" );
});

QUnit.test( "Enumerable.skip", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).skip(2).toArray();
    assert.deepEqual( result,[3,4,5], "Passed!" );
});
QUnit.test( "Enumerable.skipLast", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).skipLast(2).toArray();
    assert.deepEqual( result,[1,2,3], "Passed!" );
});
QUnit.test( "Enumerable.skipWhile", function( assert ) {
    const result = Enumerable.from([1,2,3,2,1]).skipWhile(item=>item<3).toArray();
    assert.deepEqual( result,[3,2,1], "Passed!" );
});

QUnit.test( "Enumerable.sum numbers", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).sum();
    assert.deepEqual( result,15, "Passed!" );
});
QUnit.test( "Enumerable.sum numbers with some strings", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5,'6']).sum();
    assert.deepEqual( result,Number.NaN, "Passed!" );
});

QUnit.test( "Enumerable.take", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).take(2).toArray();
    assert.deepEqual( result,[1,2], "Passed!" );
});
QUnit.test( "Enumerable.takeLast array", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).takeLast(2).toArray();
    assert.deepEqual( result,[4,5], "Passed!" );
});
QUnit.test( "Enumerable.takeLast generator", function( assert ) {
    function* gen() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
    }
    const result = Enumerable.from(gen()).takeLast(2).toArray();
    assert.deepEqual( result,[4,5], "Passed!" );
});
QUnit.test( "Enumerable.takeWhile", function( assert ) {
    const result = Enumerable.from([1,2,3,2,1]).takeWhile(item=>item<3).toArray();
    assert.deepEqual( result,[1,2], "Passed!" );
});

QUnit.test( "Enumerable.toMap", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).toMap(item=>item,item=>item*item);
    assert.deepEqual( result,new Map([[1,1],[2,4],[3,9],[4,16],[5,25]]), "Passed!" );
});
QUnit.test( "Enumerable.toObject", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).toObject(item=>'k'+item);
    assert.deepEqual( result,{k1:1,k2:2,k3:3,k4:4,k5:5}, "Passed!" );
});
QUnit.test( "Enumerable.toSet", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).toSet();
    assert.deepEqual( result,new Set([1,2,3,4,5]), "Passed!" );
});

QUnit.test( "Enumerable.union", function( assert ) {
    const result = Enumerable.from([1,1,2]).union([3,2]).toArray();
    assert.deepEqual( result,[1,2,3], "Passed!" );
});

QUnit.test( "Enumerable.where", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5]).where(item=>item%2).toArray();
    assert.deepEqual( result,[1,3,5], "Passed!" );
});
QUnit.test( "Enumerable.where with index", function( assert ) {
    const idxs=[];
    const result = Enumerable.from([1,2,3,4,5]).where((item,index)=>{
        idxs.push(index);
        return item%2;
    }).toArray();
    assert.deepEqual( result,[1,3,5], "Passed!" );
    assert.deepEqual( idxs,[0,1,2,3,4], "Passed!" );
});

QUnit.test( "Enumerable.zip", function( assert ) {
    const result = Enumerable.from([1,2,3,4]).zip(['a','b','c'],(i1,i2)=>i2+' '+i1).toArray();
    assert.deepEqual( result,['a 1','b 2','c 3'], "Passed!" );
});
QUnit.test( "Enumerable.zip with index", function( assert ) {
    const idxs=[];
    const result = Enumerable.from([1,2,3,4]).zip(['a','b','c'],(i1,i2,index)=>{
        idxs.push(index);
        return i2+' '+i1;
    }).toArray();
    assert.deepEqual( result,['a 1','b 2','c 3'], "Passed!" );
    assert.deepEqual( idxs,[0, 1, 2], "Passed!" );
});

// repeat tests
QUnit.test( "Enumerable.range repeat", function( assert ) {
    const result = Enumerable.range(1,3);
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
});
QUnit.test( "Enumerable.take repeat", function( assert ) {
    const result = Enumerable.from([1,2,3,4,5,6,7,8,9]).take(3);
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
});
QUnit.test( "Enumerable.take repeat", function( assert ) {
    const result = Enumerable.from([3,2,1]).reverse();
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
    assert.deepEqual( Array.from(result),[1,2,3], "Passed!" );
});

// composable count tests

QUnit.test( "Enumerable.empty count", function( assert ) {
    const result = Enumerable.empty();
    assert.deepEqual( result.elementAtOrDefault(1), undefined, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "Enumerable.repeat count", function( assert ) {
    const result = Enumerable.repeat(100,1000000000);
    assert.deepEqual( result.elementAtOrDefault(12345), 100, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "Enumerable.range count", function( assert ) {
    const result = Enumerable.range(100,1000000000);
    assert.deepEqual( result.elementAtOrDefault(12345), 12445, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "Enumerable.concat count", function( assert ) {
    const result = Enumerable.range(100,10000).concat(Enumerable.repeat(10,20000));
    assert.deepEqual( result.count(), 30000, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "Enumerable.concat count", function( assert ) {
    const iterable = Enumerable.from(function*(){ yield 1; })
    const result = Enumerable.range(100,10000).concat(iterable);
    assert.deepEqual( result.count(), 10001, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
    assert.deepEqual( iterable._wasIterated, true, "Passed!" );
});
QUnit.test( "orderBy count", function( assert ) {
    const result = Enumerable.range(100,10000).orderBy(i=>i+1);
    assert.deepEqual( result.count(), 10000, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "reverse count", function( assert ) {
    const result = Enumerable.range(100,10000).reverse();
    assert.deepEqual( result.count(), 10000, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "skip count", function( assert ) {
    const result = Enumerable.range(100,10000).skip(5);
    assert.deepEqual( result.count(), 9995, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "skipLast count", function( assert ) {
    const result = Enumerable.range(100,10000).skipLast(5);
    assert.deepEqual( result.count(), 9995, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "take count", function( assert ) {
    const result = Enumerable.range(100,10000).take(5);
    assert.deepEqual( result.count(), 5, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});
QUnit.test( "takeLast count", function( assert ) {
    const result = Enumerable.range(100,10000).takeLast(5);
    assert.deepEqual( result.count(), 5, "Passed!" );
    assert.deepEqual( result._wasIterated, false, "Passed!" );
});

// performace tests

QUnit.test( "Use only items that are required - standard", function( assert ) {
    const largeArray = Array(10000000).fill(10);
    const startTime = performance.now();
    const someCalculation = largeArray.filter(x=>x===10).map(x=>'v'+x).slice(100,110);
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true,'Standard array use took '+(endTime-startTime)+'milliseconds');
});

QUnit.test( "Use only items that are required - Enumerable", function( assert ) {
    const largeArray = Array(10000000).fill(10);
    const startTime = performance.now();
    const someCalculation = Enumerable.from(largeArray).where(x=>x===10).select(x=>'v'+x).skip(100).take(10).toArray();
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true,'Enumerable use took '+(endTime-startTime)+'milliseconds');
});