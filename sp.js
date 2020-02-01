!function (e, n) { "object" == typeof exports && "undefined" != typeof module ? n() : "function" == typeof define && define.amd ? define(n) : n() }(0, function () { "use strict"; function e(e) { var n = this.constructor; return this.then(function (t) { return n.resolve(e()).then(function () { return t }) }, function (t) { return n.resolve(e()).then(function () { return n.reject(t) }) }) } function n(e) { return !(!e || "undefined" == typeof e.length) } function t() { } function o(e) { if (!(this instanceof o)) throw new TypeError("Promises must be constructed via new"); if ("function" != typeof e) throw new TypeError("not a function"); this._state = 0, this._handled = !1, this._value = undefined, this._deferreds = [], c(e, this) } function r(e, n) { for (; 3 === e._state;)e = e._value; 0 !== e._state ? (e._handled = !0, o._immediateFn(function () { var t = 1 === e._state ? n.onFulfilled : n.onRejected; if (null !== t) { var o; try { o = t(e._value) } catch (r) { return void f(n.promise, r) } i(n.promise, o) } else (1 === e._state ? i : f)(n.promise, e._value) })) : e._deferreds.push(n) } function i(e, n) { try { if (n === e) throw new TypeError("A promise cannot be resolved with itself."); if (n && ("object" == typeof n || "function" == typeof n)) { var t = n.then; if (n instanceof o) return e._state = 3, e._value = n, void u(e); if ("function" == typeof t) return void c(function (e, n) { return function () { e.apply(n, arguments) } }(t, n), e) } e._state = 1, e._value = n, u(e) } catch (r) { f(e, r) } } function f(e, n) { e._state = 2, e._value = n, u(e) } function u(e) { 2 === e._state && 0 === e._deferreds.length && o._immediateFn(function () { e._handled || o._unhandledRejectionFn(e._value) }); for (var n = 0, t = e._deferreds.length; t > n; n++)r(e, e._deferreds[n]); e._deferreds = null } function c(e, n) { var t = !1; try { e(function (e) { t || (t = !0, i(n, e)) }, function (e) { t || (t = !0, f(n, e)) }) } catch (o) { if (t) return; t = !0, f(n, o) } } var a = setTimeout; o.prototype["catch"] = function (e) { return this.then(null, e) }, o.prototype.then = function (e, n) { var o = new this.constructor(t); return r(this, new function (e, n, t) { this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof n ? n : null, this.promise = t }(e, n, o)), o }, o.prototype["finally"] = e, o.all = function (e) { return new o(function (t, o) { function r(e, n) { try { if (n && ("object" == typeof n || "function" == typeof n)) { var u = n.then; if ("function" == typeof u) return void u.call(n, function (n) { r(e, n) }, o) } i[e] = n, 0 == --f && t(i) } catch (c) { o(c) } } if (!n(e)) return o(new TypeError("Promise.all accepts an array")); var i = Array.prototype.slice.call(e); if (0 === i.length) return t([]); for (var f = i.length, u = 0; i.length > u; u++)r(u, i[u]) }) }, o.resolve = function (e) { return e && "object" == typeof e && e.constructor === o ? e : new o(function (n) { n(e) }) }, o.reject = function (e) { return new o(function (n, t) { t(e) }) }, o.race = function (e) { return new o(function (t, r) { if (!n(e)) return r(new TypeError("Promise.race accepts an array")); for (var i = 0, f = e.length; f > i; i++)o.resolve(e[i]).then(t, r) }) }, o._immediateFn = "function" == typeof setImmediate && function (e) { setImmediate(e) } || function (e) { a(e, 0) }, o._unhandledRejectionFn = function (e) { void 0 !== console && console && console.warn("Possible Unhandled Promise Rejection:", e) }; var l = function () { if ("undefined" != typeof self) return self; if ("undefined" != typeof window) return window; if ("undefined" != typeof global) return global; throw Error("unable to locate global object") }(); "Promise" in l ? l.Promise.prototype["finally"] || (l.Promise.prototype["finally"] = e) : l.Promise = o });
!function (t) { "use strict"; if (!t.fetch) { var s = { searchParams: "URLSearchParams" in t, iterable: "Symbol" in t && "iterator" in Symbol, blob: "FileReader" in t && "Blob" in t && function () { try { return new Blob, !0 } catch (t) { return !1 } }(), formData: "FormData" in t, arrayBuffer: "ArrayBuffer" in t }; if (s.arrayBuffer) var e = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"], r = function (t) { return t && DataView.prototype.isPrototypeOf(t) }, o = ArrayBuffer.isView || function (t) { return t && -1 < e.indexOf(Object.prototype.toString.call(t)) }; f.prototype.append = function (t, e) { t = a(t), e = h(e); var r = this.map[t]; this.map[t] = r ? r + "," + e : e }, f.prototype.delete = function (t) { delete this.map[a(t)] }, f.prototype.get = function (t) { return t = a(t), this.has(t) ? this.map[t] : null }, f.prototype.has = function (t) { return this.map.hasOwnProperty(a(t)) }, f.prototype.set = function (t, e) { this.map[a(t)] = h(e) }, f.prototype.forEach = function (t, e) { for (var r in this.map) this.map.hasOwnProperty(r) && t.call(e, this.map[r], r, this) }, f.prototype.keys = function () { var r = []; return this.forEach(function (t, e) { r.push(e) }), u(r) }, f.prototype.values = function () { var e = []; return this.forEach(function (t) { e.push(t) }), u(e) }, f.prototype.entries = function () { var r = []; return this.forEach(function (t, e) { r.push([e, t]) }), u(r) }, s.iterable && (f.prototype[Symbol.iterator] = f.prototype.entries); var i = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"]; b.prototype.clone = function () { return new b(this, { body: this._bodyInit }) }, c.call(b.prototype), c.call(w.prototype), w.prototype.clone = function () { return new w(this._bodyInit, { status: this.status, statusText: this.statusText, headers: new f(this.headers), url: this.url }) }, w.error = function () { var t = new w(null, { status: 0, statusText: "" }); return t.type = "error", t }; var n = [301, 302, 303, 307, 308]; w.redirect = function (t, e) { if (-1 === n.indexOf(e)) throw new RangeError("Invalid status code"); return new w(null, { status: e, headers: { location: t } }) }, t.Headers = f, t.Request = b, t.Response = w, t.fetch = function (r, n) { return new Promise(function (o, t) { var e = new b(r, n), i = new XMLHttpRequest; i.onload = function () { var t, n, e = { status: i.status, statusText: i.statusText, headers: (t = i.getAllResponseHeaders() || "", n = new f, t.replace(/\r?\n[\t ]+/g, " ").split(/\r?\n/).forEach(function (t) { var e = t.split(":"), r = e.shift().trim(); if (r) { var o = e.join(":").trim(); n.append(r, o) } }), n) }; e.url = "responseURL" in i ? i.responseURL : e.headers.get("X-Request-URL"); var r = "response" in i ? i.response : i.responseText; o(new w(r, e)) }, i.onerror = function () { t(new TypeError("Network request failed")) }, i.ontimeout = function () { t(new TypeError("Network request failed")) }, i.open(e.method, e.url, !0), "include" === e.credentials ? i.withCredentials = !0 : "omit" === e.credentials && (i.withCredentials = !1), "responseType" in i && s.blob && (i.responseType = "blob"), e.headers.forEach(function (t, e) { i.setRequestHeader(e, t) }), i.send(void 0 === e._bodyInit ? null : e._bodyInit) }) }, t.fetch.polyfill = !0 } function a(t) { if ("string" != typeof t && (t = String(t)), /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t)) throw new TypeError("Invalid character in header field name"); return t.toLowerCase() } function h(t) { return "string" != typeof t && (t = String(t)), t } function u(e) { var t = { next: function () { var t = e.shift(); return { done: void 0 === t, value: t } } }; return s.iterable && (t[Symbol.iterator] = function () { return t }), t } function f(e) { this.map = {}, e instanceof f ? e.forEach(function (t, e) { this.append(e, t) }, this) : Array.isArray(e) ? e.forEach(function (t) { this.append(t[0], t[1]) }, this) : e && Object.getOwnPropertyNames(e).forEach(function (t) { this.append(t, e[t]) }, this) } function d(t) { if (t.bodyUsed) return Promise.reject(new TypeError("Already read")); t.bodyUsed = !0 } function y(r) { return new Promise(function (t, e) { r.onload = function () { t(r.result) }, r.onerror = function () { e(r.error) } }) } function l(t) { var e = new FileReader, r = y(e); return e.readAsArrayBuffer(t), r } function p(t) { if (t.slice) return t.slice(0); var e = new Uint8Array(t.byteLength); return e.set(new Uint8Array(t)), e.buffer } function c() { return this.bodyUsed = !1, this._initBody = function (t) { if (this._bodyInit = t) if ("string" == typeof t) this._bodyText = t; else if (s.blob && Blob.prototype.isPrototypeOf(t)) this._bodyBlob = t; else if (s.formData && FormData.prototype.isPrototypeOf(t)) this._bodyFormData = t; else if (s.searchParams && URLSearchParams.prototype.isPrototypeOf(t)) this._bodyText = t.toString(); else if (s.arrayBuffer && s.blob && r(t)) this._bodyArrayBuffer = p(t.buffer), this._bodyInit = new Blob([this._bodyArrayBuffer]); else { if (!s.arrayBuffer || !ArrayBuffer.prototype.isPrototypeOf(t) && !o(t)) throw new Error("unsupported BodyInit type"); this._bodyArrayBuffer = p(t) } else this._bodyText = ""; this.headers.get("content-type") || ("string" == typeof t ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : s.searchParams && URLSearchParams.prototype.isPrototypeOf(t) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")) }, s.blob && (this.blob = function () { var t = d(this); if (t) return t; if (this._bodyBlob) return Promise.resolve(this._bodyBlob); if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer])); if (this._bodyFormData) throw new Error("could not read FormData body as blob"); return Promise.resolve(new Blob([this._bodyText])) }, this.arrayBuffer = function () { return this._bodyArrayBuffer ? d(this) || Promise.resolve(this._bodyArrayBuffer) : this.blob().then(l) }), this.text = function () { var t, e, r, o = d(this); if (o) return o; if (this._bodyBlob) return t = this._bodyBlob, e = new FileReader, r = y(e), e.readAsText(t), r; if (this._bodyArrayBuffer) return Promise.resolve(function (t) { for (var e = new Uint8Array(t), r = new Array(e.length), o = 0; o < e.length; o++)r[o] = String.fromCharCode(e[o]); return r.join("") }(this._bodyArrayBuffer)); if (this._bodyFormData) throw new Error("could not read FormData body as text"); return Promise.resolve(this._bodyText) }, s.formData && (this.formData = function () { return this.text().then(m) }), this.json = function () { return this.text().then(JSON.parse) }, this } function b(t, e) { var r, o, n = (e = e || {}).body; if (t instanceof b) { if (t.bodyUsed) throw new TypeError("Already read"); this.url = t.url, this.credentials = t.credentials, e.headers || (this.headers = new f(t.headers)), this.method = t.method, this.mode = t.mode, n || null == t._bodyInit || (n = t._bodyInit, t.bodyUsed = !0) } else this.url = String(t); if (this.credentials = e.credentials || this.credentials || "omit", !e.headers && this.headers || (this.headers = new f(e.headers)), this.method = (r = e.method || this.method || "GET", o = r.toUpperCase(), -1 < i.indexOf(o) ? o : r), this.mode = e.mode || this.mode || null, this.referrer = null, ("GET" === this.method || "HEAD" === this.method) && n) throw new TypeError("Body not allowed for GET or HEAD requests"); this._initBody(n) } function m(t) { var n = new FormData; return t.trim().split("&").forEach(function (t) { if (t) { var e = t.split("="), r = e.shift().replace(/\+/g, " "), o = e.join("=").replace(/\+/g, " "); n.append(decodeURIComponent(r), decodeURIComponent(o)) } }), n } function w(t, e) { e || (e = {}), this.type = "default", this.status = void 0 === e.status ? 200 : e.status, this.ok = 200 <= this.status && this.status < 300, this.statusText = "statusText" in e ? e.statusText : "OK", this.headers = new f(e.headers), this.url = e.url || "", this._initBody(t) } }("undefined" != typeof self ? self : this);

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
    fetchHeaders: function (response, isMerge) {
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
    fetchJson: function (response) {
        if (!response.ok) {
            console.log(response);
        }
        return response.json();
    },
    fetchError: function (error) {
        console.log(error);
    },
    searchPeople: function (keyword) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/search/query?querytext='" + keyword + "'&selectproperties='UserName,Title,JobTitle,WorkPhone'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&clienttype='PeopleResultsQuery'", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
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
            .catch(self.fetchError);
    },
    search: function (keyword, selectproperties) {
        var self = this;
        return this.auth()
            .then(function (response) {
                var apiUrl = self.url + "/_api/search/query?querytext='" + keyword + "'";
                if (selectproperties) {
                    apiUrl += "&selectproperties='" + selectproperties + "'";
                }
                return fetch(apiUrl, {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                var result = response.PrimaryQueryResult.RelevantResults.Table.Rows;
                console.log(result);
                return Promise.resolve(result);
            })
            .catch(self.fetchError);
    },
    getUser: function (email) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + encodeURIComponent("i:0#.f|membership|" + email) + "'", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    me: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    getWeb: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    getSite: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    getWebRegionalSettings: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/regionalsettings", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    lists: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists?$expand=RootFolder", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response.value);
                return Promise.resolve(response.value);
            })
            .catch(self.fetchError);
    },
    getList: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    listsTitles: function () {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists?$expand=RootFolder", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                var result = [];
                var i = response.value.length;
                while (i--) {
                    result.push(response.value[i].Title);
                    console.log(response.value[i].Title);
                }
                return Promise.resolve(result);
            })
            .catch(self.fetchError);
    },
    getListFields: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/fields", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response.value);
                return Promise.resolve(response.value);
            })
            .catch(self.fetchError);
    },
    getListFieldsTitles: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/fields", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
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
            .catch(self.fetchError);
    },
    addList: function (title, baseTemplate) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists", {
                    headers: self.fetchHeaders(response),
                    method: "POST",
                    body: JSON.stringify({
                        "Title": title,
                        "BaseTemplate": baseTemplate || 100, // GenericList = 100, DocumentLibrary = 101, Events = 106, Tasks = 107
                        "ContentTypesEnabled": true,
                        "AllowContentTypes": true,
                        "EnableVersioning": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    addLibrary: function (title) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists", {
                    headers: self.fetchHeaders(response),
                    method: "POST",
                    body: JSON.stringify({
                        "Title": title,
                        "BaseTemplate": 101,
                        "ContentTypesEnabled": true,
                        "AllowContentTypes": true,
                        "EnableVersioning": true,
                        "EnableFolderCreation": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    hideList: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "Hidden": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    unhideList: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "Hidden": false
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    setListTitle: function (listCurrentTitle, listNewTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listCurrentTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "Title": listNewTitle
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    enableModeration: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableModeration": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    disableModeration: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableModeration": false
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    enableVersioning: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableVersioning": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    disableVersioning: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableVersioning": false
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    enableFolderCreation: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableFolderCreation": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    disableFolderCreation: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "EnableFolderCreation": false
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    enableContentTypes: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "AllowContentTypes": true,
                        "ContentTypesEnabled": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    views: function (listTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/lists/getByTitle('" + listTitle + "')/views", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response.value);
                return Promise.resolve(response.value);
            })
            .catch(self.fetchError);
    },
    getView: function (listTitle, viewTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/views/GetByTitle('" + viewTitle + "')", {
                    headers: self.fetchHeaders(response)
                });
            })
            .then(self.fetchJson)
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    hideView: function (listTitle, viewTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/views/GetByTitle('" + viewTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "Hidden": true
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    unhideView: function (listTitle, viewTitle) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/views/GetByTitle('" + viewTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "Hidden": false
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    setViewQuery: function (listTitle, viewTitle, camlQuery) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/views/GetByTitle('" + viewTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "ViewQuery": camlQuery // "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>"
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    },
    setViewRowLimit: function (listTitle, viewTitle, rowLimit) {
        var self = this;
        return this.auth()
            .then(function (response) {
                return fetch(self.url + "/_api/web/lists/GetByTitle('" + listTitle + "')/views/GetByTitle('" + viewTitle + "')", {
                    headers: self.fetchHeaders(response, true),
                    method: "POST",
                    body: JSON.stringify({
                        "RowLimit": rowLimit // 30
                    })
                });
            })
            .then(function (response) {
                console.log(response);
                return Promise.resolve(response);
            })
            .catch(self.fetchError);
    }
}