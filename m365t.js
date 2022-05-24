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
        setHomePage: function (pageName) {
            return s.def.post("/_api/web/rootfolder", {
                "WelcomePage": `SitePages/${pageName}`
            }, true);
        },
        getHomePage: function () {
            return s.def.get("/_api/web/rootfolder?$select=WelcomePage");
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
