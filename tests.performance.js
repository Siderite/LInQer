Enumerable = Linqer.Enumerable;
const largeNumber = 10000000;

// performance tests
QUnit.module('performance tests');

QUnit.test( "Use only items that are required - standard", function( assert ) {
    const largeArray = Array(largeNumber).fill(10);
    const startTime = performance.now();
    const someCalculation = largeArray.filter(x=>x===10).map(x=>'v'+x).slice(100,110);
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true,'Standard array use took '+(endTime-startTime)+'milliseconds');
});

QUnit.test( "Use only items that are required - Enumerable", function( assert ) {
    const largeArray = Array(largeNumber).fill(10);
    const startTime = performance.now();
    const someCalculation = Enumerable.from(largeArray).where(x=>x===10).select(x=>'v'+x).skip(100).take(10).toArray();
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true,'Enumerable use took '+(endTime-startTime)+'milliseconds');
});

QUnit.test( "OrderBy performance random", function( assert ) {
    const size = largeNumber;
    const largeArray1 = Enumerable.range(1,size).shuffle().toArray();

    let startTime = performance.now();
    const result1 = Array.from(largeArray1).sort((i1,i2)=>i2-i1);
    let endTime = performance.now();
    assert.ok(true,'Order '+size+' items using Array.from then .sort took '+(endTime-startTime)+' milliseconds');

    startTime = performance.now();
    const result2 = Enumerable.from(largeArray1).orderBy(i=>size-i).useBrowserSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using browser sort internally took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result2[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result2[i]);
            break;
        }
    }

    startTime = performance.now();
    const result3 = Enumerable.from(largeArray1).orderBy(i=>size-i).useQuickSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using QuickSort took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result3[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result3[i]);
            break;
        }
    }
});

QUnit.test( "OrderBy performance already ordered", function( assert ) {
    const size = largeNumber;
    const largeArray1 = Enumerable.range(1,size).toArray();

    let startTime = performance.now();
    const result1 = Array.from(largeArray1).sort((i1,i2)=>i2-i1);
    let endTime = performance.now();
    assert.ok(true,'Order '+size+' items using Array.from then .sort took '+(endTime-startTime)+' milliseconds');

    startTime = performance.now();
    const result2 = Enumerable.from(largeArray1).orderBy(i=>size-i).useBrowserSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using browser sort internally took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result2[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result2[i]);
            break;
        }
    }

    startTime = performance.now();
    const result3 = Enumerable.from(largeArray1).orderBy(i=>size-i).useQuickSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using QuickSort took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result3[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result3[i]);
            break;
        }
    }
});

QUnit.test( "OrderBy performance same value", function( assert ) {
    const size = largeNumber;
    const largeArray1 = Enumerable.repeat(1,size).toArray();

    let startTime = performance.now();
    const result1 = Array.from(largeArray1).sort((i1,i2)=>i2-i1);
    let endTime = performance.now();
    assert.ok(true,'Order '+size+' items using Array.from then .sort took '+(endTime-startTime)+' milliseconds');

    startTime = performance.now();
    const result2 = Enumerable.from(largeArray1).orderBy(i=>size-i).useBrowserSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using browser sort internally took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result2[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result2[i]);
            break;
        }
    }

    startTime = performance.now();
    const result3 = Enumerable.from(largeArray1).orderBy(i=>size-i).useQuickSort().toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items using QuickSort took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result3[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result3[i]);
            break;
        }
    }
});

QUnit.test( "OrderBy take performance random", function( assert ) {
    const size = largeNumber;
    const largeArray1 = Enumerable.range(1,size).shuffle().toArray();
    const largeArray2 = Array.from(largeArray1);

    let startTime = performance.now();
    let result1 = Enumerable.from(largeArray1.sort((i1,i2)=>i2-i1)).skip(100000).take(10000).toArray();
    let endTime = performance.now();
    assert.ok(true,'Order '+size+' items skip and take using .sort took '+(endTime-startTime)+' milliseconds');

    startTime = performance.now();
    let result2 = Enumerable.from(largeArray2).orderBy(i=>size-i).skip(100000).take(10000).toArray();
    endTime = performance.now();
    assert.ok(true,'Order '+size+' items skip and take using QuickSort took '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result2[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result2[i]);
            break;
        }
    }
});

QUnit.test( "sort in place performance random", function( assert ) {
    const size = largeNumber;
    const largeArray1 = Enumerable.range(1,size).shuffle().toArray();
    const largeArray2 = Array.from(largeArray1);

    let startTime = performance.now();
    const result1 = largeArray1.sort(Linqer._defaultComparer);
    let endTime = performance.now();
    assert.ok(true,'Sort inline '+size+' items using Array.sort took '+(endTime-startTime)+' milliseconds');

    startTime = performance.now();
    const result2 = Enumerable.sort(largeArray2);
    endTime = performance.now();
    assert.ok(true,'Sort inline '+size+' items using QuickSort '+(endTime-startTime)+' milliseconds');

    for (let i=0; i<size; i++) {
        if (result1[i]!=result2[i]) {
            assert.ok(false,'Arrays are not the same at index '+i+': '+result1[i]+' != '+result2[i]);
            break;
        }
    }
});
