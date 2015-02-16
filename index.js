/*
The MIT License (MIT)

Copyright (c) 2015 Chris Neave

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var _ = require('underscore');
var util = require('util');

function find(object, path) {
  if (!_.isString(path)) { return object; }

  return _.reduce(path.split('.'), function(memo, p) {
    if (memo) { return memo[p]; }
  }, object);
}

function format(value) {
  if (_.isString(value)) {
    return util.format('\'%s\'', value);
  }

  if (_.isNumber(value)) {
    return value;
  }

  if (_.isRegExp(value)) {
    return value.toString();
  }

  if (_.isObject(value)) {
    return util.format('%s', JSON.stringify(value));
  }

  if (_.isNull(value)) {
    return 'null';
  }

  if (_.isUndefined(value)) {
    return '[undefined]';
  }
}

function assert(predicate, message, negatedMessage) {
  return function() {
    var result = predicate.apply(this, arguments);

    if (this.negate) {
      result = !result;
    }

    if (!result) {
      if (!this.negate) {
        this.addResult(this.customMessage || message, this.value, this.path, arguments[0]);
      } else {
        this.addResult(this.customMessage || negatedMessage, this.value, this.path, arguments[0]);
      }
    }

    return result;
  };
}

function equal(equalTo) {
  return this.value === equalTo;
}

function eql(equalTo) {
  if (_.isObject(this.value)) { return _.isEqual(this.value, equalTo); }
  return this.value == equalTo;
}

function ok() {
  return this.value == true; // jshint ignore:line
}

function empty() {
  return _.isEmpty(this.value);
}

function exist() {
  return !(_.isNull(this.value) || _.isUndefined(this.value));
}

function oneOf(set) {
  return _.contains(set, this.value);
}

function match(regexp) {
  return regexp.test(this.value);
}

function be() {
  Object.defineProperty(this, 'ok', {
    get: assert(ok, 'Expected #{a} to be truthy', 'Expected #{a} to not be truthy')
  });

  Object.defineProperty(this, 'empty', {
    get: assert(empty, 'Expected #{a} to be empty', 'Expected #{a} to not be empty')
  });

  this.oneOf = assert(oneOf, 'Expected #{a} to be one of #{e}', 'Expected #{a} to not be one of #{e}');

  return this;
}

function not() {
  this.negate = true;
  delete this.not;
  return this;
}

function to() {
  this.eql = assert(eql, 'Expected #{a} to kind of equal #{e}', 'Expected #{a} to kind of not equal #{e}');
  this.equal = assert(equal, 'Expected #{a} to equal #{e}', 'Expected #{a} to not equal #{e}');
  this.match = assert(match, 'Expected #{a} to match #{e}', 'Expected #{a} to not match #{e}');

  Object.defineProperty(this, 'be', {
    get: be
  });

  Object.defineProperty(this, 'not', {
    configurable: true,
    get: not
  });

  Object.defineProperty(this, 'exist', {
    get: assert(exist, 'Expected #{a} to exist', 'Expected #{a} to not exist')
  });

  return this;
}

function Validator() {
  var self = this;
  var regExps = [/#{a}/, /#{p}/, /#{e}/];
  self.results = [];

  var addResult = function(message, value, path, expected) {
    var args = arguments;
    var newMessage = _.reduce(regExps, function(memo, re, index) {
      return memo.replace(re, format(args[index + 1]));
    }, message);

    self.results.push({
      message: newMessage,
      actual: value,
      expected: expected,
      path: path
    });
  };

  var withMessage = function(message) {
    this.customMessage = message;
    return this;
  };

  self.expect = function(subject, path) {
    var context = {
      value: find(subject, path),
      path: path,
      negate: false,
      addResult: addResult,
      withMessage: withMessage
    };

    Object.defineProperty(context, 'to', {
      get: to
    });

    return context;
  };
}

module.exports = Validator;
