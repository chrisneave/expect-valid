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

  if (_.isNull(value)) {
    return 'null';
  }
}

function equal(equalTo) {
  var result = true;

  if (this.value !== equalTo) {
    result = false;
  }

  if (this.negate) {
    result = !result;
  }

  if (!result) {
    if (this.negate) {
      this.addResult('Expected %s to not equal %s', this.path || this.value, equalTo);
    } else {
      this.addResult('Expected %s to equal %s', this.path || this.value, equalTo);
    }
  }

  return result;
}

function eql(equalTo) {
  var result = true;

  if (_.isObject(this.value)) {
    if (!_.isEqual(this.value, equalTo)) {
      result = false;
    }
  } else {
    if (this.value != equalTo) {
      result = false;
    }
  }

  if (this.negate) {
    result = !result;
  }

  if (!result) {
    if (this.negate) {
      this.addResult('Expected %s to kind of not equal %s', this.path || this.value, equalTo);
    } else {
      this.addResult('Expected %s to kind of equal %s', this.path || this.value, equalTo);
    }
  }

  return result;
}

function ok() {
  var result = true;

  if (!this.value) {
    result = false;
  }

  if (this.negate) {
    result = !result;
  }

  if (!result) {
    if (this.negate) {
      this.addResult('Expected %s to not be truthy', this.path || this.value);
    } else {
      this.addResult('Expected %s to be truthy', this.path || this.value);
    }
  }

  return result;
}

function empty() {
  var result;

  if (this.negate) {
    result = !_.isEmpty(this.value);
  } else {
    result = _.isEmpty(this.value);
  }

  if (!result) {
    if (this.negate) {
      this.addResult('Expected %s to not be empty', this.path || this.value);
    } else {
      this.addResult('Expected %s to be empty', this.path || this.value);
    }
  }

  return result;
}

function exist() {
  var result = true;

  if (_.isNull(this.value) || _.isUndefined(this.value)) {
    result = false;
  }

  if (this.negate) {
    result = !result;
  }

  if (!result) {
    if (this.negate) {
      this.addResult('Expected %s to not exist', this.path || this.value);
    } else {
      this.addResult('Expected %s to exist', this.path || this.value);
    }
  }

  return result;
}

function be() {
  Object.defineProperty(this, 'ok', {
    get: ok
  });

  Object.defineProperty(this, 'empty', {
    get: empty
  });

  return this;
}

function not() {
  this.negate = true;
  delete this.not;
  return this;
}

function to() {
  this.eql = eql;
  this.equal = equal;

  Object.defineProperty(this, 'be', {
    get: be
  });

  Object.defineProperty(this, 'not', {
    configurable: true,
    get: not
  });

  Object.defineProperty(this, 'exist', {
    get: exist
  });

  return this;
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
