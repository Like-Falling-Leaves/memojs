module.exports.create = createMemoryStore;

function createMemoryStore(previousStore) {
  var store = {};

  function setter(key, options, value) {
    if (value === undefined || options.maxAge === 0) {
      delete store[key];
      return;
    }

    var expires = (options.maxAge < 0) ? 0 : (new Date().getTime() + options.maxAge * 1000);
    store[key] = {expires: expires, value: value};
    return store[key];
  }

  function getter(key, options, done) {
    var ret = store[key];
    if (!ret || (ret.expires && ret.expires < new Date().getTime())) {
      delete store[key];
      return done('Not Found');
    }
    return done(null, ret.value, ret);
  }

  function chainedGetter(key, options, done) {
    getter(key, options, function (err, value, entry) {
      if (!err || !previousStore) return done(err, value, entry);
      return previousStore.get(key, options, onReadThrough);
    });

    function onReadThrough(err, value, entry) {
      if (err) return done(err, value, entry);
      var now = new Date().getTime();
      if (entry.expires < now) return done(err, value, entry);

      var newOptions = Object.create(options);
      newOptions.maxAge = Math.floor((entry.expires - now) / 1000);
      return done(err, value, setter(key, newOptions, value) || entry);
    }
  }

  return {
    set: function (key, options, value) {
      if (previousStore) previousStore.set(key, options, value);
      return setter(key, options, value);
    },
    get: function (key, options, done) {
      if (options.simulatedAsyncDelay) return setTimeout(function () {
        chainedGetter(key, options, done);
      }, options.simulatedAsyncDelay);
      return chainedGetter(key, options, done);
    },
    clear: function () {
      store = {};
    }
  };
}

