# Expect-valid

A library for validating JavaScript object structures using assertion like language.

For example:

```javascript
var validator = new require('expect-valid')();

validator.expect('foo').to.equal('bar');
// => false
validator.results;
// => [{ message: 'Expected \'foo\' to equal \'bar\'', actual: 'foo', expected: 'bar', path: undefined }]
```

# Features

- Expect syntax heavily influenced by other libraries, e.g. [Chai](http://chaijs.com/).
- Captures expectation failures in a results array rather than throwing errors for each failure. Allows multiple expectations to be tested and then the results reviewed separately.
- Supports custom messages using runtime interpolation of variables.
- Nested properties can be specified using dot notation, e.g. 'foo.bar' to get the value 'baz' from { foo: { bar: 'baz' } }.

# Installation

Install from [NPM](https://www.npmjs.com/) using:

```
npm install expect-valid
```

# API

Require the module and create a new Validator instance using the single exported constructor function.

```javascript
var validator = new require('expect-valid')();

// Strict test for true.
validator.expect(false).to.be.true;
```

## .expect(value, [path])

```expect()``` provides the actual value to test. This can be any JavaScript value.

The second argument is an optional path to the value to test specified using dot notation.
String values in dot notation indicate properties while integer values indicate array indexes. For example, ```'foo.3.bar'``` will return the value of the ```'bar'``` property of the third entry in the array stored in the ```'foo'``` property.

The return of ```expect()``` plus any language chains and the matcher is a boolean value indicating whether the expectation was met or not.

```javascript
validator.expect('foo').to.equal('bar');
// => false
validator.expect(true).to.be.true;
// => true
```

## Language chains

### .to

```to``` acts as a language chain that immediately follows the call to ```expect()```.

#### .be

```be``` is an optional language chain used by some matchers to make the expectation more readable. For example:

```javascript
validator.expect('foo').to.be.ok;
```

reads better than

```javascript
validator.expect('foo').to.ok;
```

### .not

```not``` is used to negate an expectation. The effect is to reverse the outcome of the matcher. For example:

```javascript
validator.expect('foo').to.not.equal('bar');
// => true
```

## Matchers

Matchers are functions or properties that are used to compare the actual value against the expected value. Many matchers take an expected value as an argument while others specify the expected value explicitly.

### .equal(value)

Strict equals, i.e. objects must be the same object reference to match.

```javascript
validator.expect('foo').to.equal('foo');
// => true
```

### .eql(value)

Loose equals.

```javascript
validator.expect({foo: 'bar'}).to.equal({foo: 'bar'});
// => true
```

Works with arrays to:

```javascript
validator.expect([1,2,3]).to.equal([1,2,3]);
// => true
```

### .ok

Tests for truthiness.

```javascript
validator.expect('one').to.be.ok;
// => true
```

```javascript
validator.expect(undefined).to.be.ok;
// => false
```

### .true (and .false)

Test for true or false boolean values.

```javascript
validator.expect(true).to.be.true;
// => true
```

```javascript
validator.expect(false).to.be.false;
// => true
```

### .empty

Tests strings, arrays and objects for emptiness. For strings and arrays a value is considered empty if it doesn't contain any elements, i.e. value.length === 0. For object, a value is considered empty if it does not contain any keys, e.g. '{}'.

```javascript
validator.expect('').to.be.empty;
// => true
```

```javascript
validator.expect([1,2,3]).to.be.empty;
// => false
```

### .exist

Tests whether a value is defined, i.e. not ```null``` or ```undefined```.

```javascript
validator.expect('foo').to.exist;
// => true
```

```javascript
validator.expect(undefined).to.exist;
// => false
```

### .oneOf(array)

Tests whether a value is a member of the given array. Only uses strict equals to compare values.

```javascript
validator.expect('bar').to.be.oneOf(['foo','bar','baz']);
// => true
```

```javascript
validator.expect(2).to.be.oneOf(['foo','bar','baz']);
// => false
```

### .match(RegExp)

Test a string value against a regular expression. The regular express can either be a literal or an instance of a ```RegExp()```.

```javascript
validator.expect('bar').to.match(/b.*/);
// => true
```

```javascript
validator.expect('bar').to.match(new RegExp('foo'));
// => false
```

### .satisfy(function)

Use a function predicate to test a value. The function will be passed the value to test and be expected to return ```true``` or ```false``` to indicate the result.

```javascript
validator.expect('foo').to.satisfy(function(value) { return value === 'foo'; });
// => true
```

## Custom messages using .withMessage(message)

The built in validation messages can be overwritten by using the ```withMessage()``` function within an expectation chain. The expected, actual and path values are inserted into the message whenever a specific token is found.

The supported format tokens are:

Token | Meaning
--- | ---
#{a} | Actual value passed into or evaluated by ```expect()```.
#{e} | Expected value depending on matcher being used.
#{p} | The dot notation passed into ```expect()``` to locate the actual value.

For example:

```javascript
validator.expect({foo: [1,2,3]}, 'foo.1')
  .withMessage('Value #{a} at path #{p} should really equal #{e}')
  .to.equal('bar');
// => false
validator.results[0].message;
// => 'Value 2 at path \'foo.1\' should really equal \'bar\''
```

## The results object

As each expectation is evaluated any failed expectation are added to a results array to be queried at a later point in time. Each element in the results array will contain an object that describes the outcome of the expectation as well as the variables used to determine the outcome.

Each element in the results array is an object with the following properties:

Property | Meaning
--- | ---
message | The validation message generated by the expectation. This will contain a custom message if ```.withMessage()``` was used in the expectation chain.
actual | The value either passed into or evaluated by ```expect()```.
expected | The expected value determined by or passed into the matcher.
path | The path used to evaluate the actual value if passed into ```expect()```.

For example:

```javascript
validator.expect({foo: [1,2,3]}, 'foo.1')
  .withMessage('Value #{a} at path #{p} should really equal #{e}')
  .to.equal('bar');
validator.results[0];
// => { message: 'Value 2 at path \'foo.1\' should really equal \'bar\'', actual: 2, expected: 'bar', path: 'foo.1' }
```

# Contributing to expect-valid

[![Build Status](https://travis-ci.org/chrisneave/expect-valid.svg)](https://travis-ci.org/chrisneave/expect-valid)

Please create issues, fork and send a pull request for any improvements or bug fixes. All I ask is that you write tests for your code and run ```npm test``` and ```npm run lint``` before commiting your change.

# Licensing

expect-valid is licensed under the MIT license. See the [LICENSE](https://github.com/chrisneave/expect-valid/blob/master/LICENSE) file for the full license text.
