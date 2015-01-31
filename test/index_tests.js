var Validator = require('../index');
var expect = require('chai').expect;

describe('expect', function() {
  var subject;

  beforeEach(function() {
    subject = new Validator();
  });

  describe('when the subject is a single value', function() {
    it('uses the value as the subject', function() {
      var obj = { foo: 'bar' };
      expect(subject.expect(obj).value).to.equal(obj);
    });
  });

  describe('when subject is an object and path to a property to test', function() {
    describe('and a path is provided to a nested property', function() {
      it('traverses the path to the value', function() {
        var obj = { foo: { bar: 'baz' } };
        expect(subject.expect(obj, 'foo.bar').value).to.equal('baz');
      });

      it('uses a value of \'undefined\' if the property could not be found', function() {
        var obj = { foo: { bar: 'baz' } };
        expect(subject.expect(obj, 'foo.gumpf').value).to.be.undefined;
      });

      it('uses the path in the result message', function() {
        var obj = { foo: { bar: 'baz' } };
        subject.expect(obj, 'foo.gumpf').to.equal('baz');
        expect(subject.results[0]).to.equal('Expected \'foo.gumpf\' to equal \'baz\'');
      });
    });

    describe('and a path is provided that includes an array', function() {
      it('traverses the path to the value', function() {
        var obj = { foo: [1,{ bar: 'baz' },3] };
        expect(subject.expect(obj, 'foo.1.bar').value).to.equal('baz');
      });

      it('uses a value of \'undefined\' if the property could not be found', function() {
        var obj = { foo: [1,{ bar: 'baz' },3] };
        expect(subject.expect(obj, 'foo.1.gumpf').value).to.be.undefined;
      });

      it('uses the path in the result message', function() {
        var obj = { foo: [1,{ bar: 'baz' },3] };
        subject.expect(obj, 'foo.1.gumpf').to.equal('baz');
        expect(subject.results[0]).to.equal('Expected \'foo.1.gumpf\' to equal \'baz\'');
      });
    });
  });
});

describe('assertion methods', function() {
  var subject;

  beforeEach(function() {
    subject = new Validator();
  });

  describe('#equal', function() {
    it('can test for strict equality', function() {
      expect(subject.expect('foo').to.equal('foo')).to.be.true;
    });

    it('can fail strict equality', function() {
      expect(subject.expect(1).to.equal('1')).to.be.false;
      expect(subject.results[0]).to.equal('Expected 1 to equal \'1\'');
    });
  });
});

describe('language chains', function() {
  var subject;

  beforeEach(function() {
    subject = new Validator();
  });

  describe('#not', function() {
    it('negates any chained assertions', function() {
      expect(subject.expect('foo').to.not.equal('bar')).to.be.true;
    });

    it('not possible to \'not\' a not', function() {
      expect(subject.expect('foo').to.not).to.not.have.property('not');
    });
  });
});
