module.exports = memoizer;

function memoizer(fn, options) {
  memoized.sync = memoizedSync;
  readThrough.sync = readThroughSync;
  cached.sync = cachedSync;
  writeThrough.sync = writeThroughSync;
  memoized.sync.cached = cachedSync;
  memoized.sync.readThrough = readThroughSync;
  memoized.sync.writeThrough = writeThroughSync;
  return {
    memoized: memoized,
    cached: cached,
    readThrough: readThrough,
    writeThrough: writeThrough
  };

  // check cache + call underlying function on miss + save to cache
  function memoized() {
    exec({
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }
  function memoizedSync() {
    exec({
      sync: true,
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }

  // check cache but do not call underlying function or save to cache
  function cached() {
    exec({
      cached: true,
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }

  function cachedSync() {
    exec({
      sync: true,
      cached: true,
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }

  // call underlying function directly but save to cache
  function readThrough() {
    exec({
      readThrough: true,
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }
  function readThroughSync() {
    exec({
      sync: true,
      readThrough: true,
      context: this,
      fn: fn,
      args: Array.prototype.slice.call(arguments),
      options: options
    });
  }

  // assume value and save to cache
  function writeThrough(val) {
    return function () {
      exec({
        writeThrough: true,
        writeThroughValue: val,
        context: this,
        fn: fn,
        args: Array.prototype.slice.call(arguments),
        options: options
      });
    };
  }
  function writeThroughSync(val) {
    return function () {
      exec({
        sync: true,
        writeThrough: true,
        writeThroughValue: val,
        context: this,
        fn: fn,
        args: Array.prototype.slice.call(arguments),
        options: options
      });
    };
  }

  function exec(info) {
    var done = info.args[info.args.length - 1];
    if (typeof (done) != 'function') done = null;
    else if (info.sync) info.args.pop();

    // first fetch the new info to use
    info = info.options.getCacheProperties(info);

    // read from cache
    if (info.readThrough) return onFound('Read Through');
    if (info.writeThrough) return onFound('Write Through');
    info.options.store.get(info.key, info.options, onFound);

    function onFound(err, value, cacheEntry) {
      if (!err) return done && done(null, value, cacheEntry);
      if (info.cached) return done && done('Cache Miss');

      // cache miss: override callback if necessary
      var ll = info.args.length - 1, cb = info.args[ll];
      if (!info.sync && typeof(cb) == 'function') {
        info.args[ll] = saveToCache;
      }

      // call the underlying function
      value = info.writeThrough ? info.writeThroughValue : info.fn.apply(info.context, info.args);

      // if call was sync, save to cache manually
      if (!cb || info.writeThrough || info.sync) saveToCache(null, value);

      // save to cache and call callback if needed
      function saveToCache(err, value) {
        if (err) return done && done(err);
        return done && done(err, value, info.options.store.set(info.key, info.options, value));
      }
    }
  }
}
