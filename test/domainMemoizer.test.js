//
// Unit test: Run using mocha
//

var assert = require('assert');
var memoize = require('..');
var perDomainCache = require('../memoryDomain').create();
var domain = require('domain');

var readThrough = false;
function testIt(x, y) { return readThrough ? 42 : (x + y); }
function testItAsync(x, y, done) { setTimeout(function () { done(null, readThrough ? 42 : x + y); }, 100); }

function itNewDomain(str, cb) {
  return it(str, function (done) {
    var dd = domain.create();
    dd.on('error', done);
    dd.run(function () {
      cb(function (err) {
        dd.exit();
        if (!err) assert.ok(dd.memojsStore);
        return done(err);
      });
    });
  });
}

describe('Domain: Global Configuration', function () {
  describe('Module level', function () {
    beforeEach(function () { memoize.configure({store: perDomainCache}); });
    itNewDomain('should allow creating configuration globally', function (done) {
      memoize.configure({maxAge: 30});
      var memoized = memoize(testIt);
      memoized.configure({name: 'MMMM'});
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        assert.ok(_entry.expires <= (new Date().getTime()) + (30 * 1000));
        done();
      });
    });
  });
});

describe('Domain: Explicit Memoizer', function () {
  beforeEach(function () { memoize.configure({store: perDomainCache}); });
  describe('Sync tests', function () {
    itNewDomain('should create a memoizer for a sync function', function (done) {
      var memoized = memoize(testIt);
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.sync(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow fetching the sync function value via cache', function (done) {
      var memoized = memoize(testIt);
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.cached.sync(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow writing through the cache for a sync function', function (done) {
      var memoized = memoize(testIt);
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.sync.writeThrough(52)(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(52, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized.sync(20, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(52, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });

    itNewDomain('should allow reading through the cache for a sync function', function (done) {
      var memoized = memoize(testIt);
      var entry = null;
      memoized.sync(22, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(25, value);
        assert.ok(_entry);
        entry = _entry;
        readThrough = true;
        memoized.sync.readThrough(22, 3, function (err, value, _entry) {
          readThrough = false;
          assert.ok(!err);
          assert.equal(42, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized.sync(22, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(42, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });
  });

  describe('Sync tests with async memory store and alternate name for key', function () {
    itNewDomain('should create a memoizer for a sync function', function (done) {
      var memoized = memoize(testIt, {simulatedAsyncDelay: 100, name: 'testIt2'});
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.sync(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow fetching the sync function value via cache', function (done) {
      var memoized = memoize(testIt, {simulatedAsyncDelay: 100, name: 'testIt2'});
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.cached.sync(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow writing through the cache for a sync function', function (done) {
      var memoized = memoize(testIt, {simulatedAsyncDelay: 100, name: 'testIt2'});
      var entry = null;
      memoized.sync(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.sync.writeThrough(52)(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(52, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized.sync(20, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(52, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });

    itNewDomain('should allow reading through the cache for a sync function', function (done) {
      var memoized = memoize(testIt, {simulatedAsyncDelay: 100, name: 'testIt2'});
      var entry = null;
      memoized.sync(22, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(25, value);
        assert.ok(_entry);
        entry = _entry;
        readThrough = true;
        memoized.sync.readThrough(22, 3, function (err, value, _entry) {
          readThrough = false;
          assert.ok(!err);
          assert.equal(42, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized.sync(22, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(42, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });
  });

  describe('Async tests', function () {
    itNewDomain('should create a memoizer for an async function', function (done) {
      var memoized = memoize(testItAsync);
      var entry = null;
      memoized(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow fetching the async function value via cache', function (done) {
      var memoized = memoize(testItAsync);
      var entry = null;
      memoized(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.cached(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(23, value);
          assert.ok(_entry);
          assert.strictEqual(entry, _entry);
          done();
        });
      });
    });

    itNewDomain('should allow writing through the cache for an async function', function (done) {
      var memoized = memoize(testItAsync);
      var entry = null;
      memoized(20, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(23, value);
        assert.ok(_entry);
        entry = _entry;
        memoized.writeThrough(52)(20, 3, function (err, value, _entry) {
          assert.ok(!err);
          assert.equal(52, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized(20, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(52, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });

    itNewDomain('should allow reading through the cache for an async function', function (done) {
      var memoized = memoize(testItAsync);
      var entry = null;
      memoized(22, 3, function (err, value, _entry) {
        assert.ok(!err);
        assert.equal(25, value);
        assert.ok(_entry);
        entry = _entry;
        readThrough = true;
        memoized.readThrough(22, 3, function (err, value, _entry) {
          readThrough = false;
          assert.ok(!err);
          assert.equal(42, value);
          assert.ok(_entry);
          assert.notEqual(JSON.stringify(entry), JSON.stringify(_entry));
          entry = _entry;
          memoized(22, 3, function (err, value, _entry) {
            assert.ok(!err);
            assert.equal(42, value);
            assert.ok(_entry);
            assert.strictEqual(entry, _entry);
            done();
          });
        });
      });
    });
  });
});
