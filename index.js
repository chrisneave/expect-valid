var _ = require('underscore');
var printf = require('printf');

function find(object, path) {
  if (!_.isString(path)) { return object; }

  return _.reduce(path.split('.'), function(memo, p) {
    if (memo) { return memo[p]; }
  }, object);
}

function format(value) {
  if (_.isString(value)) {
    return printf('\'%s\'', value);
  }

  if (_.isNumber(value)) {
    return value;
  }

  if (_.isObject(value)) {
    return printf('%s', JSON.stringify(value));
  }
}

function Validator() {
  var self = this;
  self.results = [];

  var addResult = function(message, path, equalTo) {
    self.results.push(printf(message, format(path), format(equalTo)));
  }

  self.expect = function(subject, path) {
    var value = find(subject, path);
    var notTo = {};
    var to = {};
    var be = {};

    var equal = function(equalTo) {
      if ((value === equalTo) === this.negate) {
        addResult('Expected %s to equal %s', path || value, equalTo);
        return false;
      }

      return true;
    }

    var eql = function(equalTo) {
      if (_.isObject(value)) {
        if (_.isEqual(value, equalTo) === this.negate) {
          addResult('Expected %s to kind of equal %s', path || value, equalTo);
          return false;
        }
      } else {
        if ((value == equalTo) === this.negate) {
          addResult('Expected %s to kind of equal %s', path || value, equalTo);
          return false;
        }
      }

      return true;
    }

    var ok = function() {
      if (!value && this.negate === false) {
        addResult('Expected %s to be truthy', path || value);
        return false;
      }

      if (value && this.negate === true) {
        addResult('Expected %s to be truthy', path || value);
        return false;
      }

      return true;
    }

    Object.defineProperty(be, 'ok', {
      get: ok
    });

    notTo.negate = to.negate = false;
    notTo.equal = to.equal = equal;
    notTo.eql = to.eql = eql;

    Object.defineProperty(to, 'not', {
      get: function() {
        notTo.negate = true;
        return notTo;
      }
    });

    Object.defineProperty(to, 'be', {
      get: function() {
        be.negate = false;
        return be;
      }
    });

    Object.defineProperty(notTo, 'be', {
      get: function() {
        be.negate = true;
        return be;
      }
    });

    return {
      value: value,
      to: to
    }
  }
}


module.exports = Validator;
