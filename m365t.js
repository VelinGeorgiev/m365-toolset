var s = {
    url: 'https://clydeandco.sharepoint.com/sites/bau',
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
        headers: function (response, isMerge, isDelete) {
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
            if (isDelete) {
                headers["X-HTTP-Method"] = "DELETE";
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
        },
        remove: apiUrl => {
            return s.auth()
                .then(function (response) {
                    return fetch(s.url + apiUrl, {
                        headers: s.def.headers(response, false, true),
                        method: "POST"
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
        } 
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
    },
    file: {
        get: sitesRelativeUrl => {
            // sitesRelativeUrl = /sites/Test/Documents/Doc1.docx
             return s.def.get(`/_api/web/getFileByServerRelativeUrl('${sitesRelativeUrl}')`)
        },
        copy: (sourceFullUrl, targetFullUrl, overwrite) => {
            // usage s.file.copy('https://msyte.sharepoint.com/sites/s1/sitepages/Welcome.aspx', 'https://msyte.sharepoint.com/sites/s1/sitepages/Welcome1.aspx')
                
            return s.def.post(`/_api/SP.MoveCopyUtil.CopyFileByPath()`, {
                srcPath: { DecodedUrl: sourceFullUrl },
                destPath: { DecodedUrl: targetFullUrl },
                options: { ResetAuthorAndCreatedOnCopy: true, ShouldBypassSharedLocks: true },
                overwrite: overwrite || false
            })
        },
        remove: serverRelativeUrl => {
            // sitesRelativeUrl = /sites/Test/Documents/Doc1.docx
            return s.def.remove(`/_api/web/getfilebyserverrelativeurl('${serverRelativeUrl}')`)
        }
    },
    nav: {
        list: () => {
             return s.def.get(`/_api/web/navigation/quicklaunch`)
        },
         add: (title, url, isExternal) => {
             // more info https://github.com/pnp/cli-microsoft365/blob/6dee8b646f230c815e11cdc937b13c6c72810766/src/m365/spo/commands/navigation/navigation-node-add.ts
             return s.def.post(`/_api/web/navigation/quicklaunch`, {
                    "Title": title,
                    "Url": url,
                    "IsExternal": isExternal || false
          })
        },
         remove: async title => {
             // more info https://github.com/pnp/cli-microsoft365/blob/6dee8b646f230c815e11cdc937b13c6c72810766/src/m365/spo/commands/navigation/navigation-node-add.ts
             const {value} =  await s.def.get(`/_api/web/navigation/quicklaunch`)
             
             const navNodes = value.filter(x => x.Title === title)
             
             console.log('navNodes')
             console.log(navNodes)
             
             if(navNodes && navNodes.length > 0) {
                return s.def.remove(`/_api/web/navigation/quicklaunch/getbyid(${navNodes[0].Id})`)
             }
        }
    },
    page: {
        getAsItem: sitesRelativeUrl => {
            // sitesRelativeUrl = /sites/Test/Documents/Doc1.docx
            return s.def.get(`/_api/web/getFileByServerRelativeUrl('${sitesRelativeUrl}')?$expand=ListItemAllFields/ClientSideApplicationId,ListItemAllFields/PageLayoutType,ListItemAllFields/CommentsDisabled`)
        },
        getAsJson: pageName => {
            return s.def.get(`/_api/sitepages/pages/GetByUrl('sitepages/${pageName}')`)
        },
        getAsCanvasContent1AsString: async pageName => {
            
            const {CanvasContent1} = await s.def.get(`/_api/sitepages/pages/GetByUrl('sitepages/${pageName}')`)
            
            console.log('CanvasContent1')
            console.log(CanvasContent1)
            
            return CanvasContent1
        },
        setCanvasContent1AsString: async (serverRelativeFileUrl, canvasContent) => {
             // PromotedState: 2,
             // FirstPublishedDate: new Date().toISOString().replace('Z', '')
            
            // Usage s.page.setCanvasContent1AsString('/sites/s1/sitepages/Home.aspx', '"<div>....</div>"')
            
            return s.def.post(`/_api/web/getfilebyserverrelativeurl('${serverRelativeFileUrl}')/ListItemAllFields')`, {
              CanvasContent1: canvasContent
            }, true)
        },
        getAsCanvasContent1AsJson: async pageName => {
            
            const p = await s.def.get(`/_api/sitepages/pages/GetByUrl('sitepages/${pageName}')`)
            
            const result = JSON.parse(p.CanvasContent1)
            
            console.log('CanvasContent1')
            console.log(result)
            
            return result
        },
        list: async () => {
            
            return await s.def.get(`/_api/sitepages/pages`)
        }
    }
}
if(window) {
    window.s = s;
}
