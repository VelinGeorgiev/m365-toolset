(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
require("promise-polyfill");
require("isomorphic-unfetch");

var s = {
    url: 'https://velingeorgiev.sharepoint.com/sites/s1',
    auth: function () {
        return fetch(this.url + '/_api/contextinfo', {
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-type": "application/json;odata=nometadata"
            },
            method: "POST"
        }).then(function (response) {
            if (!response.ok) {
                return Promise.reject(response);
            }
            return response.json();
        });
    },
    e: encodeURIComponent,
    def: {
        headers: function (response, isMerge) {
            var headers = {
                "Accept": "application/json;odata=nometadata",
                "Content-type": "application/json;odata=nometadata",
                'user-agent': "NONISV|SharePointPnP|VelinGeorgievToolset/1.0.0",
                "X-RequestDigest": response.FormDigestValue
            };
            if (isMerge) {
                headers["X-HTTP-Method"] = "MERGE";
                headers["If-Match"] = "*";
            }
            return headers;
        },
        json: function (response) {
            if (!response.ok) {
                console.log(response);
            }
            return response.json();
        },
        success: function (response) {
            console.log(response);
            return Promise.resolve(response);
        },
        error: function (error) {
            console.log(error);
        },
        get: function (apiUrl) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + apiUrl, {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
        post: function (apiUrl, json, isMerge) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + apiUrl, {
                        headers: s.def.headers(response, isMerge),
                        method: "POST",
                        body: JSON.stringify(json)
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        }
    },
    user: {
        search: function (keyword) {
            return s.def.get("/_api/search/query?querytext='" + s.e(keyword) + "'&selectproperties='UserName,Title,JobTitle,WorkPhone'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&clienttype='PeopleResultsQuery'")
                .then(function (response) {
                    var rows = response.PrimaryQueryResult.RelevantResults.Table.Rows;
                    var l = rows.length;
                    var result = [];
                    while (l--) {
                        var userName = rows[l].Cells.filter(function (x) { return x.Key === 'UserName' })[0];
                        result.push({ email: userName.Value, props: rows[l] });
                    }
                    console.log(result);
                    return Promise.resolve(result);
                })
                .catch(s.def.error);
        },
        get: function (email) {
            return s.def.get("/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + s.e("i:0#.f|membership|" + email) + "'");
        },
        me: function () {
            return s.def.get("/_api/SP.UserProfiles.PeopleManager/GetMyProperties");
        },
    },
    search: function (keyword, selectproperties) {
        return s.auth()
            .then(function (response) {
                var apiUrl = s.url + "/_api/search/query?querytext='" + s.e(keyword) + "'";
                if (selectproperties) {
                    apiUrl += "&selectproperties='" + selectproperties + "'";
                }
                return fetch(apiUrl, {
                    headers: s.def.headers(response)
                });
            })
            .then(s.def.json)
            .then(function (response) {
                var result = response.PrimaryQueryResult.RelevantResults.Table.Rows;
                console.log(result);
                return Promise.resolve(result);
            })
            .catch(s.def.error);
    },
    site: {
        get: function () {
            return s.def.get("/_api/site");
        },
        properties: function () {
            return s.def.get("/_api/site/AllProperties");
        },
    },
    web: {
        get: function () {
            return s.def.get("/_api/web");
        },
        properties: function () {
            return s.def.get("/_api/web/AllProperties");
        },
        getRegionalSettings: function () {
            return s.def.get("/_api/web/regionalsettings");
        },
    },
    list: {
        addList: function (title, baseTemplate) {
            return s.def.post("/_api/web/lists", {
                "Title": title,
                "BaseTemplate": baseTemplate || 100, // GenericList = 100, DocumentLibrary = 101, Events = 106, Tasks = 107
                "ContentTypesEnabled": true,
                "AllowContentTypes": true,
                "EnableVersioning": true
            });
        },
        addLibrary: function (title) {
            return s.def.post("/_api/web/lists", {
                "Title": title,
                "BaseTemplate": 101,
                "ContentTypesEnabled": true,
                "AllowContentTypes": true,
                "EnableVersioning": true,
                "EnableFolderCreation": true
            });
        },
        all: function () {
            return s.def.get("/_api/web/lists");
        },
        titles: function () {
            return s.def.get("/_api/web/lists")
                .then(function (response) {
                    var result = [];
                    var i = response.value.length;
                    while (i--) {
                        result.push(response.value[i].Title);
                        console.log(response.value[i].Title);
                    }
                    return Promise.resolve(result);
                })
                .catch(s.def.error);
        },
        get: function (listTitle) {
            return s.def.get("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')");
        },
        getFields: function (listTitle) {
            return s.def.get("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/fields")
                .then(function (response) {
                    console.log(response.value);
                    return Promise.resolve(response.value);
                })
                .catch(s.def.error);
        },
        getFieldsTitles: function (listTitle) {
            return s.def.get("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/fields")
                .then(function (response) {
                    var result = [];
                    var i = response.value.length;
                    while (i--) {
                        var v = response.value[i];
                        var t = v.Title + ", " + v.TypeAsString + ", " + v.InternalName + ", " + (v.Indexed == true ? '>> INDEXED' : '');
                        console.log(t);
                        result.push(t);
                    }
                    return Promise.resolve(result);
                })
                .catch(s.def.error);
        },
        setHidden: function (listTitle, isHidden) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')", {
                "Hidden": isHidden
            }, true);
        },
        setTitle: function (listCurrentTitle, listNewTitle) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listCurrentTitle) + "')", {
                "Title": listNewTitle
            }, true);
        },
        setModeration: function (listTitle, isEnabled) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')", {
                "EnableModeration": isEnabled
            }, true);
        },
        setVersioning: function (listTitle, isEnabled) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')", {
                "EnableVersioning": isEnabled
            }, true);
        },
        setFolderCreation: function (listTitle, isEnabled) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')", {
                "EnableFolderCreation": isEnabled
            }, true);
        },
        setContentTypes: function (listTitle, isEnabled) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')", {
                "AllowContentTypes": isEnabled,
                "ContentTypesEnabled": isEnabled
            }, true);
        },
    },
    view: {
        all: function (listTitle) {
            return s.def.get("/_api/lists/getByTitle('" + s.e(listTitle) + "')/views")
                .then(function (response) {
                    console.log(response.value);
                    return Promise.resolve(response.value);
                })
                .catch(s.def.error);
        },
        get: function (listTitle, viewTitle) {
            return s.def.get("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/views/GetByTitle('" + s.e(viewTitle) + "')");
        },
        setHidden: function (listTitle, viewTitle, isHidden) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/views/GetByTitle('" + s.e(viewTitle) + "')", {
                "Hidden": isHidden
            }, true);
        },
        setViewQuery: function (listTitle, viewTitle, camlQuery) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/views/GetByTitle('" + s.e(viewTitle) + "')", {
                "ViewQuery": camlQuery // "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>"
            }, true);
        },
        setRowLimit: function (listTitle, viewTitle, rowLimit) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/views/GetByTitle('" + s.e(viewTitle) + "')", {
                "RowLimit": rowLimit // 30
            }, true);
        },
        setFormatter: function (listTitle, viewTitle, json) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/views/GetByTitle('" + s.e(viewTitle) + "')", {
                "CustomFormatter": JSON.stringify(json)
            }, true);
        },
    },
    field: {
        setFormatter: function (listTitle, fieldTitle, json) {
            return s.def.post("/_api/web/lists/GetByTitle('" + s.e(listTitle) + "')/Fields/GetByInternalNameOrTitle('" + s.e(fieldTitle) + "')", {
                "CustomFormatter": JSON.stringify(json)
            }, true);
        }
    }
}
if(window) {
    window.s = s;
}
},{"isomorphic-unfetch":2,"promise-polyfill":4}],2:[function(require,module,exports){
module.exports = window.fetch || (window.fetch = require('unfetch').default || require('unfetch'));

},{"unfetch":6}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (setImmediate){
'use strict';

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

}).call(this,require("timers").setImmediate)
},{"timers":5}],5:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":3,"timers":5}],6:[function(require,module,exports){
module.exports=function(e,n){return n=n||{},new Promise(function(t,r){var s=new XMLHttpRequest,o=[],u=[],i={},a=function(){return{ok:2==(s.status/100|0),statusText:s.statusText,status:s.status,url:s.responseURL,text:function(){return Promise.resolve(s.responseText)},json:function(){return Promise.resolve(JSON.parse(s.responseText))},blob:function(){return Promise.resolve(new Blob([s.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var l in s.open(n.method||"get",e,!0),s.onload=function(){s.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t}),t(a())},s.onerror=r,s.withCredentials="include"==n.credentials,n.headers)s.setRequestHeader(l,n.headers[l]);s.send(n.body||null)})};


},{}]},{},[1]);
