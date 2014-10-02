var memoizer = require('./memoizer');
var defaults = require('./defaults');

module.exports = memoize(defaults);
Function.prototype.memoize = module.exports;
Object.defineProperty(Function.prototype, "memoized", {get: getMemoized});

function memoize() {
  var fn, args;
  if (typeof(this) == 'function') {
    fn = this;
  } else if (typeof(arguments[0]) == 'function') {
    fn = arguments[0]
  } else {
    // no fn available -- just return a memoize fn back so the fn can be supplied later on
    args = Array.prototype.slice.call(arguments);
    var ret = function () { 
      var args2 = Array.prototype.slice.call(arguments).concat(args);
      return memoize.apply(this, args2);
    };
    args[0] = args[0] || {};
    ret.configure = configure;
    ret.options = args[0] || {};
    return ret;
  }

  var options = Object.create(defaults);
  var memo = memoizer(fn, options);
  var memoized = memo.memoized;
  memoized.options = options;
  memoized.cached = memo.cached;
  memoized.readThrough = memo.readThrough;
  memoized.writeThrough = memo.writeThrough;
  memoized.configure = configure;

  for (var kk = arguments.length - 1; kk >= 0; kk --) {
    if (typeof(arguments[kk]) != 'function') memoized.configure(arguments[kk]);
  }

  return memoized;
}

function getMemoized() {
  if (this._memoized) this._memoized = this.memoize();
  return this._memoized;
}

function configure(opts) { copyProperties(this.options, opts); }
function copyProperties(dest, src) {
  if (!src) return;
  for (var key in src) if (src.hasOwnProperty(key)) dest[key] = src[key];
}
