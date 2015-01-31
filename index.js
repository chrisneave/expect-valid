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
}

function Validator() {
  var self = this;
  self.results = [];

  var addResult = function(message, path, equalTo) {
    self.results.push(printf(message, format(path), format(equalTo)));
  }

  self.expect = function(subject, path) {
    var value = find(subject, path);

    return {
      value: value,
      to: {
        equal: function(equalTo) {
          if (value !== equalTo) {
            addResult('Expected %s to equal %s', path || value, equalTo);
          }
        }
      }
    }
  }
}


module.exports = Validator;
