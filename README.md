# memojs

Memoization framework for NodeJS.  There are several memoization modules already for Node.JS that are very good.  The difference is that this module is built with plugins for cache and ease of use in mind.

This is not a complex ES6-compliant memoization library but it will work for simple caches.  In particular, this comes with a very basic memory cache but REDIS, MongoDB and S3 plugins are in the works. In addition, it is possible to do multi-layered caching this way.

[![NPM info](https://nodei.co/npm/memjos.png?downloads=true)](https://npmjs.org/package/memojs)

[![Travis build status](https://api.travis-ci.org/Like-Falling-Leaves/memojs.png?branch=master)](
https://travis-ci.org/Like-Falling-Leaves/memojs)

This module is experimental and the kinks have yet to be worked out.

## Install

    npm install memojs


## API

There are two seperate ways to invoke this library.  The simpler approach is by Function prototype and the other approach is explicit initialization.

More explicit documentation will be added soon.

### Function prototype

```javascript
   var memojs = require('memojs');

   function someSyncFunction(arg1, arg2) {
     return arg1 + arg2;
   }

   function someFunction(arg1, arg2, done) {
     return done(null, arg1 + arg2);
   }
   
   // note that someFunction.memoized is declared via prototype automatically.
   someFunction.memoized(5, 3, function (err, val) {
     // now if you call someFunction.memoized(5, 3, cb) it will use the cache.
   });

   // you can configure the cache and other details as follows
   someFunction.memoized.configure({store: yourStoreImplementation()});

   // you can also get a one-off implementation that uses a different store as follows
   var someFunctionButDifferentCache = someFunction.memoize({store: anotherStore()});

   // you can get contents from the cache directly via the cached property.
   // the following call will not actually ever call someFunction
   someFunction.memoized.cached(5, 3, callback);

   // you can readThrough values via readThrough.  This does not read from the cache 
   // but will end up saving to the cache though.
   someFunction.memoized.readThrough(5, 3, callback);

   // you can also write through to the cache.  This does not call someFunction but allows updating
   // the caches directly.
   someFunction.memoized.writeThrough(42)(5, 3, callback);

   // if you want to delete an item from the cache, writeThrough 'undefined'
   someFunction.memoized.writeThrough(undefined)(5, 3, callback);

   // if you api was sync instead of callback, you can use the .sync variants but note that 
   // all the responses are still async as the cache underneath is expected to be async.
   someSyncFunction.memoized.sync(5, 3, callback);

   // By default memoized uses the name of the function and JSON.stringify of the arguments to determine
   // the cache key.  If you have two functions with the same name but destined for different caches, you 
   // can configure different names like so:
   someSyncFunction.memoized.configure({name: 'someSyncFunction-alternate'});
   
   // if you want to normalize the arguments for the cache, you can provide your own method that does that.
   someSyncFunction.memoized.configure({getCacheProperties: function (info) { info.key = some_func_of(info.args); }});
}
```

### Explicit usage

```javascript
   var memojs = require('memojs');

   function someSyncFunction(arg1, arg2) {
     return arg1 + arg2;
   }

   function someFunction(arg1, arg2, done) {
     return done(null, arg1 + arg2);
   }
   
   var memoized;

   // note that someFunction.memoized is declared via prototype automatically.
   memoized = memojs(someFunction);
   memoized(5, 3, function (err, val) {
     // now if you call someFunction.memoized(5, 3, cb) it will use the cache.
   });

   // you can configure the cache and other details as follows
   memoized.configure({store: yourStoreImplementation()});

   // you can also get a one-off implementation that uses a different store as follows
   var someFunctionButDifferentCache = memojs(someFunction, {store: anotherStore()});

   // you can get contents from the cache directly via the cached property.
   // the following call will not actually ever call someFunction
   memoized.cached(5, 3, callback);

   // you can readThrough values via readThrough.  This does not read from the cache 
   // but will end up saving to the cache though.
   memoized.readThrough(5, 3, callback);

   // you can also write through to the cache.  This does not call someFunction but allows updating
   // the caches directly.
   memoized.writeThrough(42)(5, 3, callback);

   // if you want to delete an item from the cache, writeThrough 'undefined'
   memoized.writeThrough(undefined)(5, 3, callback);

   // if you api was sync instead of callback, you can use the .sync variants but note that 
   // all the responses are still async as the cache underneath is expected to be async.
   var memoizedSync = memojs(memoizedSync);
   memoizedSync(5, 3, callback);

   // By default memoized uses the name of the function and JSON.stringify of the arguments to determine
   // the cache key.  If you have two functions with the same name but destined for different caches, you 
   // can configure different names like so:
   memoized.configure({name: 'someSyncFunction-alternate'});
   
   // if you want to normalize the arguments for the cache, you can provide your own method that does that.
   memoized.configure({getCacheProperties: function (info) { info.key = some_func_of(info.args); }});
}
```

