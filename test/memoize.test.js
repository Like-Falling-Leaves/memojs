//
// Unit test: Run using mocha
//

var assert = require('assert');
var memoize = require('..');

var readThrough = false;
function testIt(x, y) { return readThrough ? 42 : (x + y); }
function testItAsync(x, y, done) { setTimeout(function () { done(null, readThrough ? 42 : x + y); }, 100); }

describe('Global Configuration', function () {
  describe('Module level', function () {
    it ('should allow creating configuration globally', function (done) {
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

describe('Explicit Memoizer', function () {
  describe('Sync tests', function () {
    it('should create a memoizer for a sync function', function (done) {
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

    it('should allow fetching the sync function value via cache', function (done) {
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

    it('should allow writing through the cache for a sync function', function (done) {
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

    it('should allow reading through the cache for a sync function', function (done) {
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
    it('should create a memoizer for a sync function', function (done) {
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

    it('should allow fetching the sync function value via cache', function (done) {
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

    it('should allow writing through the cache for a sync function', function (done) {
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

    it('should allow reading through the cache for a sync function', function (done) {
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
    it('should create a memoizer for an async function', function (done) {
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

    it('should allow fetching the async function value via cache', function (done) {
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

    it('should allow writing through the cache for an async function', function (done) {
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

    it('should allow reading through the cache for an async function', function (done) {
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
