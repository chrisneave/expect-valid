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
}

function assert(predicate, message, negatedMessage) {
  return function() {
    var result = predicate.apply(this, arguments);

    if (this.negate) {
      result = !result;
    }

    if (!result) {
      if (!this.negate) {
        this.addResult(message, this.path || this.value, arguments[0]);
      } else {
        this.addResult(negatedMessage, this.path || this.value, arguments[0]);
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
    get: assert(ok, 'Expected %s to be truthy', 'Expected %s to not be truthy')
  });

  Object.defineProperty(this, 'empty', {
    get: assert(empty, 'Expected %s to be empty', 'Expected %s to not be empty')
  });

  this.oneOf = assert(oneOf, 'Expected %s to be one of %s', 'Expected %s to not be one of %s');

  return this;
}

function not() {
  this.negate = true;
  delete this.not;
  return this;
}

function to() {
  this.eql = assert(eql, 'Expected %s to kind of equal %s', 'Expected %s to kind of not equal %s');
  this.equal = assert(equal, 'Expected %s to equal %s', 'Expected %s to not equal %s');
  this.match = assert(match, 'Expected %s to match %s', 'Expected %s to not match %s');

  Object.defineProperty(this, 'be', {
    get: be
  });

  Object.defineProperty(this, 'not', {
    configurable: true,
    get: not
  });

  Object.defineProperty(this, 'exist', {
    get: assert(exist, 'Expected %s to exist', 'Expected %s to not exist')
  });

  return this;
}

function Validator() {
  var self = this;
  self.results = [];

  var addResult = function(message) {
    // Exclude any arguments that are not explicitly stated in the message.
    var otherArgs = _.tail(arguments);
    formattedArgs = _.map(_.head(otherArgs, message.match(/(%s)/g).length), function(arg) {
      return format(arg);
    });
    formattedArgs.unshift(message);

    self.results.push(util.format.apply(this, formattedArgs));
  };

  self.expect = function(subject, path) {
    var context = {
      value: find(subject, path),
      path: path,
      negate: false,
      addResult: addResult
    };

    Object.defineProperty(context, 'to', {
      get: to
    });

    return context;
  };
}

module.exports = Validator;
