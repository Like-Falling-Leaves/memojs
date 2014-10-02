module.exports = {
  maxAge: -1,
  store: require('./memory.js').create(),
  serialize: JSON.stringify,
  deserialize: JSON.parse,
  getCacheProperties: function (info) {
    info.key = 'memo-' + (info.options.name || info.fn.name) + '-' + JSON.stringify(info.args);
    return info;
  }
}
