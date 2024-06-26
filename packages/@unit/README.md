# [rJS Test](https://github.com/t-ski/rJS Test) Unit Testing `unit`

rJS Test test suite for unit testing providing the expression symmetrical `UnitTest` class.

``` cli
npx rjs:test unit <tests-path>
```

> Integrated in [`rapidjs-org/test`](https://github.com/t-ski/rJS Test)

## Test Anatomy

### Expressions

``` ts
.actual(expression: any)
.expected(expression: any)  // Identity assertion
```

### Value-based Assertion

``` js
new UnitTest("Computes quotient of positive integers")
.actual(4 / 2)
.expected(2);
```

### Error-based Assertion

``` ts
new UnitTest("Computes quotient of positive integers")
.actual(() => 4 / x)
.error("x is not defined", ReferenceError);
```

<sup>[View More Examples](../../examples/unit)</sup>

## Comparison Strategy

Unit tests work on arbitrary values. That being said, the comparison strategy implements soft (`==`) deep equality:
  
**✅ &thinsp; SUCCESS**

``` js
.actual({
  foo: {
    bar: 2
  }
})
.expected({
  foo: {
    bar: "2"
  }
})
```
  
**❌ &thinsp; FAILURE**

``` js
.actual({
  foo: {
    bar: 2
  }
})
.expected({
  foo: {
	bar: 4
  }
})
```

``` js
.actual({
  foo: {
    bar: 2
  }
})
.expected({
  foo: {
	bar: 2
  },
  baz: 4
})
```

##

<sub>&copy; Thassilo Martin Schiepanski</sub>