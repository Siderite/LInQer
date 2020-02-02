Enumerable = Linqer.Enumerable;

// object and method tests
QUnit.module('object and method tests');

QUnit.test("Enumerable.from with empty array", function (assert) {
    const enumerable = Enumerable.from([]);
    const result = [];
    for (const item of enumerable) result.push(item);

    assert.deepEqual(result, [], "Passed!");
});

QUnit.test("Enumerable.from with non empty array", function (assert) {
    const enumerable = Enumerable.from([1, 'a2', 3, null]);
    const result = [];
    for (const item of enumerable) result.push(item);

    assert.deepEqual(result, [1, 'a2', 3, null], "Passed!");
});

QUnit.test("Enumerable.from with generator function", function (assert) {
    function* gen() {
        yield 1;
        yield 'a2';
        yield 3;
        yield null;
    }
    const enumerable = Enumerable.from(gen());
    const result = [];
    for (const item of enumerable) result.push(item);

    assert.deepEqual(result, [1, 'a2', 3, null], "Passed!");
});

QUnit.test("Enumerable.concat", function (assert) {
    const result = Enumerable.from([1, 'xx2', 5]).concat([6, 7, 8]).toArray();
    assert.deepEqual(result, [1, 'xx2', 5, 6, 7, 8], "Passed!");
});

QUnit.test("Enumerable.count array", function (assert) {
    const result = Enumerable.from([1, 'xx2', 5]).count();
    assert.deepEqual(result, 3, "Passed!");
});
QUnit.test("Enumerable.count Map", function (assert) {
    const map = new Map();
    map.set(1, 2);
    map.set('a', '3');
    const result = Enumerable.from(map).count();
    assert.deepEqual(result, 2, "Passed!");
});
QUnit.test("Enumerable.count Set", function (assert) {
    const result = Enumerable.from(new Set().add(1).add(2).add(3).add(4)).count();
    assert.deepEqual(result, 4, "Passed!");
});
QUnit.test("Enumerable.count generator function", function (assert) {
    function* gen() {
        yield 'a';
        yield 1;
    }
    const result = Enumerable.from(gen()).count();
    assert.deepEqual(result, 2, "Passed!");
});

QUnit.test("Enumerable.distinct", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).distinct().toArray();
    assert.deepEqual(result, [1, 2, 3, '3'], "Passed!");
});
QUnit.test("Enumerable.distinct equality comparer", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).distinct((i1, i2) => +(i1) === +(i2)).toArray();
    assert.deepEqual(result, [1, 2, 3], "Passed!");
});

QUnit.test("Enumerable.elementAt in range array", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).elementAt(3);
    assert.deepEqual(result, 3, "Passed!");
});
QUnit.test("Enumerable.elementAt below range array", function (assert) {
    assert.throws(() => Enumerable.from([1, 2, 2, 3, '3']).elementAt(-3), "Passed!");
});
QUnit.test("Enumerable.elementAt above range array", function (assert) {
    assert.throws(() => Enumerable.from([1, 2, 2, 3, '3']).elementAt(30), "Passed!");
});
QUnit.test("Enumerable.elementAtOrDefault in range array", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).elementAtOrDefault(3);
    assert.deepEqual(result, 3, "Passed!");
});
QUnit.test("Enumerable.elementAtOrDefault below range array", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).elementAtOrDefault(-3);
    assert.deepEqual(result, undefined, "Passed!");
});
QUnit.test("Enumerable.elementAtOrDefault above range array", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).elementAtOrDefault(30);
    assert.deepEqual(result, undefined, "Passed!");
});

QUnit.test("Enumerable.first", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).first();
    assert.deepEqual(result, 1, "Passed!");
});
QUnit.test("Enumerable.first empty", function (assert) {
    assert.throws(() => Enumerable.from([]).first(), "Passed!");
});
QUnit.test("Enumerable.firstOrDefault", function (assert) {
    const result = Enumerable.from([]).firstOrDefault();
    assert.deepEqual(result, undefined, "Passed!");
});

QUnit.test("Enumerable.last", function (assert) {
    const result = Enumerable.from([1, 2, 2, 3, '3']).last();
    assert.deepEqual(result, '3', "Passed!");
});
QUnit.test("Enumerable.last empty", function (assert) {
    assert.throws(() => Enumerable.from([]).last(), "Passed!");
});
QUnit.test("Enumerable.lastOrDefault", function (assert) {
    const result = Enumerable.from([]).lastOrDefault();
    assert.deepEqual(result, undefined, "Passed!");
});

QUnit.test("Enumerable.max numbers", function (assert) {
    const result = Enumerable.from([3, 5, 1, 2, 56, 2, -100, 43]).max();
    assert.deepEqual(result, 56, "Passed!");
});
QUnit.test("Enumerable.max strings", function (assert) {
    const result = Enumerable.from(['ba', 'a', 'abba', 'aaa', 'bb']).max();
    assert.deepEqual(result, 'bb', "Passed!");
});

QUnit.test("Enumerable.min number", function (assert) {
    const result = Enumerable.from([3, 5, 1, 2, 56, 2, -100, 43]).min();
    assert.deepEqual(result, -100, "Passed!");
});
QUnit.test("Enumerable.min custom comparer", function (assert) {
    const result = Enumerable.from([3, 5, 1, 2, 56, 2, -100, 43]).min((i1, i2) => i1.toString().length - i2.toString().length);
    assert.deepEqual(result, 3, "Passed!");
});

QUnit.test("Enumerable.select", function (assert) {
    const result = Enumerable.from(['a', 1, 3, 2]).select(item => Number.isInteger(item) ? item * item : item + '^2').toArray();
    assert.deepEqual(result, ['a^2', 1, 9, 4], "Passed!");
});

QUnit.test("Enumerable.skip", function (assert) {
    const result = Enumerable.from([1, 2, 3, 4, 5]).skip(2).toArray();
    assert.deepEqual(result, [3, 4, 5], "Passed!");
});

QUnit.test("Enumerable.sum numbers", function (assert) {
    const result = Enumerable.from([1, 2, 3, 4, 5]).sum();
    assert.deepEqual(result, 15, "Passed!");
});
QUnit.test("Enumerable.sum numbers with some strings", function (assert) {
    const result = Enumerable.from([1, 2, 3, 4, 5, '6']).sum();
    assert.deepEqual(result, Number.NaN, "Passed!");
});

QUnit.test("Enumerable.take", function (assert) {
    const result = Enumerable.from([1, 2, 3, 4, 5]).take(2).toArray();
    assert.deepEqual(result, [1, 2], "Passed!");
});

QUnit.test("Enumerable.where", function (assert) {
    const result = Enumerable.from([1, 2, 3, 4, 5]).where(item => item % 2).toArray();
    assert.deepEqual(result, [1, 3, 5], "Passed!");
});
QUnit.test("Enumerable.where with index", function (assert) {
    const idxs = [];
    const result = Enumerable.from([1, 2, 3, 4, 5]).where((item, index) => {
        idxs.push(index);
        return item % 2;
    }).toArray();
    assert.deepEqual(result, [1, 3, 5], "Passed!");
    assert.deepEqual(idxs, [0, 1, 2, 3, 4], "Passed!");
});


// composable count tests
QUnit.module('composable count tests');

QUnit.test("Enumerable.concat seekable count ", function (assert) {
    const result = Enumerable.range(100, 10000).concat(Enumerable.range(10, 20000));
    assert.deepEqual(result.count(), 30000, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("Enumerable.concat unseekable count", function (assert) {
    const iterable = Enumerable.from(function* () { yield 1; })
    const result = Enumerable.range(100, 10000).concat(iterable);
    assert.deepEqual(result.count(), 10001, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
    assert.deepEqual(iterable._wasIterated, true, "Passed!");
});
QUnit.test("skip count", function (assert) {
    const result = Enumerable.range(100, 10000).skip(5);
    assert.deepEqual(result.count(), 9995, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("take count", function (assert) {
    const result = Enumerable.range(100, 10000).take(5);
    assert.deepEqual(result.count(), 5, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});

// seek tests
QUnit.module('seek tests');
QUnit.test("Enumerable.empty seek", function (assert) {
    const result = Enumerable.from([]);
    assert.deepEqual(result.count(), 0, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(10000), undefined, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("concat array seek", function (assert) {
    const result = Enumerable.range(0, 100000).concat([0, 1, 2, 3, 4, 5]);
    assert.deepEqual(result.count(), 100006, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(100004), 4, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("concat Enumerable seek", function (assert) {
    const result = Enumerable.range(0, 100000).concat(Enumerable.range(0, 6));
    assert.deepEqual(result.count(), 100006, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(100004), 4, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("select seek", function (assert) {
    const result = Enumerable.range(0, 100000).select(i => 'a' + i);
    assert.deepEqual(result.count(), 100000, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(10000), 'a10000', "Passed!");
    assert.deepEqual(result.elementAtOrDefault(1000000), undefined, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("skip seek", function (assert) {
    const result = Enumerable.range(0, 100000).skip(50000);
    assert.deepEqual(result.count(), 50000, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(10000), 60000, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(1000000), undefined, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});
QUnit.test("take seek", function (assert) {
    const result = Enumerable.range(0, 100000).take(50000);
    assert.deepEqual(result.count(), 50000, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(10000), 10000, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(50000), undefined, "Passed!");
    assert.deepEqual(result.elementAtOrDefault(1000000), undefined, "Passed!");
    assert.deepEqual(result._wasIterated, false, "Passed!");
});

// performance tests
QUnit.module('performance tests');

QUnit.test("Use only items that are required - standard", function (assert) {
    const largeArray = Array(10000000).fill(10);
    const startTime = performance.now();
    const someCalculation = largeArray.filter(x => x === 10).map(x => 'v' + x).slice(100, 110);
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true, 'Standard array use took ' + (endTime - startTime) + 'milliseconds');
});

QUnit.test("Use only items that are required - Enumerable", function (assert) {
    const largeArray = Array(10000000).fill(10);
    const startTime = performance.now();
    const someCalculation = Enumerable.from(largeArray).where(x => x === 10).select(x => 'v' + x).skip(100).take(10).toArray();
    Array.from(someCalculation);
    const endTime = performance.now();
    assert.ok(true, 'Enumerable use took ' + (endTime - startTime) + 'milliseconds');
});
