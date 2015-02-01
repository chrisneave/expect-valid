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

  if (_.isObject(value)) {
    return util.format('%s', JSON.stringify(value));
  }
}

function Validator() {
  var self = this;
  self.results = [];

  var addResult = function(message) {
    otherArgs = _.map(_.tail(arguments, 1), function(arg) {
      return format(arg);
    });
    otherArgs.unshift(message);

    self.results.push(util.format.apply(this, otherArgs));
  }

  self.expect = function(subject, path) {
    var context = {
      value: find(subject, path),
      path: path,
      negate: false
    };

    var equal = function(equalTo) {
      if ((this.value === equalTo) === this.negate) {
        addResult('Expected %s to equal %s', this.path || this.value, equalTo);
        return false;
      }

      return true;
    }

    var eql = function(equalTo) {
      if (_.isObject(this.value)) {
        if (_.isEqual(this.value, equalTo) === this.negate) {
          addResult('Expected %s to kind of equal %s', this.path || this.value, equalTo);
          return false;
        }
      } else {
        if ((this.value == equalTo) === this.negate) {
          addResult('Expected %s to kind of equal %s', this.path || this.value, equalTo);
          return false;
        }
      }

      return true;
    }

    Object.defineProperty(context, 'to', {
      get: function() {
        this.eql = eql;
        this.equal = equal;

        Object.defineProperty(this, 'be', {
          get: function() {

            Object.defineProperty(this, 'ok', {
              get: function() {
                if ((!this.value && this.negate === false) || (this.value && this.negate === true)) {
                  addResult('Expected %s to be truthy', this.path || this.value);
                  return false;
                }

                return true;
              }
            });

            return this;
          }
        });

        Object.defineProperty(this, 'not', {
          configurable: true,
          get: function() {
            this.negate = true;
            delete this.not;
            return this;
          }
        });

        return this;
      }
    });

    return context;
  }
}


module.exports = Validator;
