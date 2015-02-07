/*jshint expr: true*/

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
    describe('strings', function() {
      it('can test for strict equality', function() {
        expect(subject.expect('foo').to.equal('foo')).to.be.true;
      });

      it('can negate test for strict equality', function() {
        expect(subject.expect('foo').to.not.equal('foo')).to.be.false;
        expect(subject.results[0]).to.equal('Expected \'foo\' to not equal \'foo\'');
      });

      it('can fail strict equality', function() {
        expect(subject.expect('1').to.equal('2')).to.be.false;
        expect(subject.results[0]).to.equal('Expected \'1\' to equal \'2\'');
      });
    });
  });

  describe('#eql', function() {
    describe('strings', function() {
      it('can test for deep equality', function() {
        expect(subject.expect('1').to.eql(1)).to.be.true;
      });

      it('can negate test for deep equality', function() {
        expect(subject.expect('1').to.not.eql(1)).to.be.false;
        expect(subject.results[0]).to.eql('Expected \'1\' to kind of not equal 1');
      });

      it('can fail deep equality', function() {
        expect(subject.expect('one').to.eql(1)).to.be.false;
        expect(subject.results[0]).to.eql('Expected \'one\' to kind of equal 1');
      });
    });

    describe('arrays', function() {
      it('can test for deep equality', function() {
        expect(subject.expect([1,2,3]).to.eql([1,2,3])).to.be.true;
      });

      it('can negate test for deep equality', function() {
        expect(subject.expect([1,2,3]).to.not.eql([1,2,3])).to.be.false;
        expect(subject.results[0]).to.eql('Expected [1,2,3] to kind of not equal [1,2,3]');
      });

      it('can fail deep equality', function() {
        expect(subject.expect({ foo: 'bar' }).to.eql({ foo: 'gumpf' })).to.be.false;
        expect(subject.results[0]).to.eql('Expected {"foo":"bar"} to kind of equal {"foo":"gumpf"}');
      });
    });

    describe('objects', function() {
      it('can test for deep equality', function() {
        expect(subject.expect({ foo: 'bar' }).to.eql({ foo: 'bar' })).to.be.true;
      });

      it('can negate test for deep equality', function() {
        expect(subject.expect({ foo: 'bar' }).to.not.eql({ foo: 'bar' })).to.be.false;
        expect(subject.results[0]).to.eql('Expected {"foo":"bar"} to kind of not equal {"foo":"bar"}');
      });

      it('can fail deep equality', function() {
        expect(subject.expect({ foo: 'bar' }).to.eql({ foo: 'gumpf' })).to.be.false;
        expect(subject.results[0]).to.eql('Expected {"foo":"bar"} to kind of equal {"foo":"gumpf"}');
      });
    });
  });

  describe('#ok', function() {
    it('can test for truthyness', function() {
      expect(subject.expect('1').to.be.ok).to.be.true;
    });

    it('can negate truthyness', function() {
      expect(subject.expect('1').to.not.be.ok).to.be.false;
      expect(subject.results[0]).to.eql('Expected \'1\' to not be truthy');
    });

    it('can fail truthyness', function() {
      expect(subject.expect(undefined).to.be.ok).to.be.false;
      expect(subject.results[0]).to.eql('Expected undefined to be truthy');
    });
  });

  describe('#empty', function() {
    describe('strings', function() {
      it('can test for emptiness', function() {
        expect(subject.expect('').to.be.empty).to.be.true;
      });

      it('can negate test for emptiness', function() {
        expect(subject.expect('').to.not.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected \'\' to not be empty');
      });

      it('can test for not emptiness', function() {
        expect(subject.expect('aa').to.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected \'aa\' to be empty');
      });
    });

    describe('arrays', function() {
      it('can test for emptiness', function() {
        expect(subject.expect([]).to.be.empty).to.be.true;
      });

      it('can negate test for emptiness', function() {
        expect(subject.expect([]).to.not.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected [] to not be empty');
      });

      it('can test for not emptiness', function() {
        expect(subject.expect([1,2,3]).to.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected [1,2,3] to be empty');
      });
    });

    describe('objects', function() {
      it('can test for emptiness', function() {
        expect(subject.expect({}).to.be.empty).to.be.true;
      });

      it('can negate test for emptiness', function() {
        expect(subject.expect({}).to.not.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected {} to not be empty');
      });

      it('can test for not emptiness', function() {
        expect(subject.expect({foo: 'bar'}).to.be.empty).to.be.false;
        expect(subject.results[0]).to.equal('Expected {"foo":"bar"} to be empty');
      });
    });
  });

  describe('#exist', function() {
    it('can test for existence', function() {
      expect(subject.expect('foo').to.exist).to.be.true;
    });

    it('can negate test for existence', function() {
      expect(subject.expect('foo').to.not.exist).to.be.false;
      expect(subject.results[0]).to.equal('Expected \'foo\' to not exist');
    });

    it('can test for non-existence', function() {
      expect(subject.expect(null).to.exist).to.be.false;
      expect(subject.results[0]).to.equal('Expected null to exist');
    });
  });

  describe('#in', function() {
    it('can test for inclusion', function() {
      expect(subject.expect('bar').to.be.oneOf(['foo', 'bar', 'baz'])).to.be.true;
    });

    it('can test for non-existence', function() {
      expect(subject.expect('bar').to.be.oneOf(['foo', 'baz'])).to.be.false;
      expect(subject.results[0]).to.equal('Expected \'bar\' to be one of ["foo","baz"]');
    });

    it('can negate test for existence', function() {
      expect(subject.expect('bar').to.not.be.oneOf(['foo', 'bar', 'baz'])).to.be.false;
      expect(subject.results[0]).to.equal('Expected \'bar\' to not be one of ["foo","bar","baz"]');
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
