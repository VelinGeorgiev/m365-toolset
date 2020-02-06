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
    },
    user: {
        search: function (keyword) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/search/query?querytext='" + encodeURIComponent(keyword) + "'&selectproperties='UserName,Title,JobTitle,WorkPhone'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&clienttype='PeopleResultsQuery'", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
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
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + encodeURIComponent("i:0#.f|membership|" + email) + "'", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
        me: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
    },
    search: function (keyword, selectproperties) {
        return s.auth()
            .then(function (response) {
                var apiUrl = s.url + "/_api/search/query?querytext='" + encodeURIComponent(keyword) + "'";
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
    web: {
        get: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
        getRegionalSettings: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/regionalsettings", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
    },
    site: {
        get: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
    },
    list: {
        addList: function (title, baseTemplate) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists", {
                        headers: s.def.headers(response),
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
                .then(s.def.success)
                .catch(s.def.error);
        },
        addLibrary: function (title) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists", {
                        headers: s.def.headers(response),
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
                .then(s.def.success)
                .catch(s.def.error);
        },
        all: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists?$expand=RootFolder", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(function (response) {
                    console.log(response.value);
                    return Promise.resolve(response.value);
                })
                .catch(s.def.error);
        },
        allTitles: function () {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists?$expand=RootFolder", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
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
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
        getFields: function (listTitle) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/fields", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(function (response) {
                    console.log(response.value);
                    return Promise.resolve(response.value);
                })
                .catch(s.def.error);
        },
        getFieldsTitles: function (listTitle) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/fields", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
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
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "Hidden": isHidden
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setTitle: function (listCurrentTitle, listNewTitle) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listCurrentTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "Title": listNewTitle
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setModeration: function (listTitle, isEnabled) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "EnableModeration": isEnabled
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setVersioning: function (listTitle, isEnabled) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "EnableVersioning": isEnabled
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setFolderCreation: function (listTitle, isEnabled) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "EnableFolderCreation": isEnabled
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setContentTypes: function (listTitle, isEnabled) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "AllowContentTypes": isEnabled,
                            "ContentTypesEnabled": isEnabled
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
    },
    view: {
        all: function (listTitle) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/lists/getByTitle('" + encodeURIComponent(listTitle) + "')/views", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(function (response) {
                    console.log(response.value);
                    return Promise.resolve(response.value);
                })
                .catch(s.def.error);
        },
        get: function (listTitle, viewTitle) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/views/GetByTitle('" + encodeURIComponent(viewTitle) + "')", {
                        headers: s.def.headers(response)
                    });
                })
                .then(s.def.json)
                .then(s.def.success)
                .catch(s.def.error);
        },
        setHidden: function (listTitle, viewTitle, isHidden) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/views/GetByTitle('" + encodeURIComponent(viewTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "Hidden": isHidden
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setViewQuery: function (listTitle, viewTitle, camlQuery) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/views/GetByTitle('" + encodeURIComponent(viewTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "ViewQuery": camlQuery // "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>"
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setRowLimit: function (listTitle, viewTitle, rowLimit) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/views/GetByTitle('" + encodeURIComponent(viewTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "RowLimit": rowLimit // 30
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
        setFormatter: function (listTitle, viewTitle, json) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/views/GetByTitle('" + encodeURIComponent(viewTitle) + "')", {
                        headers: s.def.headers(response, true),
                        method: "POST",
                        body: JSON.stringify({
                            "CustomFormatter": JSON.stringify(json)
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        },
    },
    field: {
        setFormatter: function (listTitle, fieldTitle, json) {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + "/_api/web/lists/GetByTitle('" + encodeURIComponent(listTitle) + "')/Fields/GetByInternalNameOrTitle('" + encodeURIComponent(fieldTitle) + "')", {
                        headers: s.def.headers(response),
                        method: "MERGE",
                        body: JSON.stringify({
                            "CustomFormatter": JSON.stringify(json)
                        })
                    });
                })
                .then(s.def.success)
                .catch(s.def.error);
        }
    }
}
if(window) {
    window.s = s;
}