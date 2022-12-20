

var s = {
    url: 'https://yoursite.sharepoint.com/sites/KnowledgeSiteTemplate',
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
                'user-agent': "NONISV|SharePointPnP|M365-Toolset/1.0.0",
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
	addAppCatalog: function(url) {
		// s must be tenant site yoursite-admin.sharepoint.com
		// url must be the site to enable the app catalog for
		return s.def.post("/_vti_bin/client.svc/ProcessQuery", '<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="m365-toolset" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="38" ObjectPathId="37" /><ObjectPath Id="40" ObjectPathId="39" /><ObjectPath Id="42" ObjectPathId="41" /><ObjectPath Id="44" ObjectPathId="43" /><ObjectPath Id="46" ObjectPathId="45" /><ObjectPath Id="48" ObjectPathId="47" /></Actions><ObjectPaths><Constructor Id="37" TypeId="{268004ae-ef6b-4e9b-8425-127220d84719}" /><Method Id="39" ParentId="37" Name="GetSiteByUrl"><Parameters><Parameter Type="String">'+url+'</Parameter></Parameters></Method><Property Id="41" ParentId="39" Name="RootWeb" /><Property Id="43" ParentId="41" Name="TenantAppCatalog" /><Property Id="45" ParentId="43" Name="SiteCollectionAppCatalogsSites" /><Method Id="47" ParentId="45" Name="Add"><Parameters><Parameter Type="String">'+url+'</Parameter></Parameters></Method></ObjectPaths></Request>');
	}
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
            // usage s.web.setHomePage('Welcome.aspx')
            
            return s.def.post("/_api/web/rootfolder", {
                "WelcomePage": `SitePages/${pageName}`
            }, true);
        },
        getHomePage: function () {
            return s.def.get("/_api/web/rootfolder?$select=WelcomePage");
        } 
    },
    docLib: {
      get: folderServerRelativeUrl => {
        // folderServerRelativeUrl = /sites/s1/sitepages
          return s.def.get(`/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl}')`)
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
                options: { ResetAuthorAndCreatedOnCopy: true, ShouldBypassSharedLocks: true, KeepBoth: false },
                overwrite: overwrite || false
            })
        },
        copy2: (sourceRelativeURl, targetRelativeUrl) => {
            // TODO: Does not work. Check why?
            // usage s.file.copy('https://msyte.sharepoint.com/sites/s1/sitepages/Welcome.aspx', 'https://msyte.sharepoint.com/sites/s1/sitepages/Welcome1.aspx')
                
            return s.def.post(`/_api/web/GetFileByServerRelativePath('${sourceRelativeURl}')/copyTo('${targetRelativeUrl}')`)
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
             
             // usage: s.nav.add('Welcome', 'SitePages/Welcome.aspx')
             
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
        getTemplates: () => {
          return s.def.get('/_api/sitepages/pages/templates')  
        },
        add: async (name, title, content, type)  => {
            
//            { 
//                "PageLayoutType": "Article", 
//                "Name": "Name123.aspx", 
//                "Title": "Title XXX", 
//                "CanvasContent1": "[{\"controlType\":4,\"id\":\"23551566-9b9a-4faa-a095-302faabfa5f1\",\"innerHTML\":\"<p><strong>ggg1</strong></p>\",\"position\":{\"layoutIndex\":1,\"zoneIndex\":2,\"sectionIndex\":1,\"controlIndex\":1,\"sectionFactor\":12},\"addedFromPersistedData\":true},{\"controlType\":0,\"pageSettingsSlice\":{\"isDefaultDescription\":true,\"isDefaultThumbnail\":true,\"isSpellCheckEnabled\":true}}]"
//            }
            
            const res = await s.def.post("/_api/sitepages/pages", 
              { 
                "PageLayoutType": type ? type : "Article",  // "Article", "Home"
                "Name": name, 
                "Title": title, 
                "CanvasContent1": content
             });
            
            const relativeUrl = s.url.substring(s.url.indexOf('/sites/'), s.url.length)
            
            console.log('relativeUrl')
            console.log(relativeUrl)
            
            const { ListItemAllFields } = await s.page.getAsItem(relativeUrl + '/sitepages/' + name)
            
            return s.def.post(`/_api/sitepages/pages/GetById(${ListItemAllFields.Id})/Publish`);
            
        },
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
        },
		changeLayout: async (serverRelativeFileUrl, layout) => {
			
			// layout = Home, Article
			
			await s.def.post(`/_api/web/GetFolderByServerRelativeUrl('${serverRelativeFileUrl}')/ListItemAllFields')`, 
			{
				"PageLayoutType": layout
			}, 
			true)
		}, 
		copy: async (sourceFullUrl, targetFolderUrl) => {
            // usage s.page.copy('https://msyte.sharepoint.com/sites/s1/sitepages/Welcome.aspx', 'https://msyte.sharepoint.com/sites/s1/sitepages/Welcome1.aspx')
                
            return s.def.post(`/_api/site/CreateCopyJobs`, 
				{  
				   "exportObjectUris":[  
					  sourceFullUrl
				   ],
				   "destinationUri": targetFolderUrl,
				   "options":{  
					  "IgnoreVersionHistory":true,
					  "IsMoveMode":false
				   }
				}
			)
        }
    },
	item: {
		list: async (listName) => {
			
			// listName = 'Title'
			
			let item = await s.def.get(`/_api/web/lists/GetByTitle('${listName}')/items`)
			
			console.log(item)
			
			return item
			
		},
		add: async (listName, json) => {
			// { "Title": "Test" }
			
			let item = await s.def.post(`/_api/web/lists/GetByTitle('${listName}')/items`, json)
			
			console.log(item)
			
			return item
		},
		set: async (listName, itemId, json) => {
			// { "Title": "Test" }
			
			let item = await s.def.post(`/_api/web/lists/GetByTitle('${listName}')/items('${itemId}')`, json, true)
			
			console.log(item)
			
			return item
		},
		get: async (listName, itemId) => {
			// listName = 'Title' or '/sites/s1' if folder
			
			let item = await s.def.get(`/_api/web/lists/GetByTitle('${listName}')/items('${itemId}')`)
			
			console.log(item)
			
			return item
		},
		listFiles: async (relativeFolderUrl) => {
			
			// listName = 'Title' or '/sites/s1' if folder
			
			let item = await s.def.get(`/_api/web/GetFolderByServerRelativeUrl('${relativeFolderUrl}')/Files`)
			
			console.log(item)
			
			return item
			
		},
		getFileItem: async (relativeFileUrl) => {
			// listName = 'Title' or '/sites/s1' if folder
			
			let item = await s.def.get(`/_api/web/GetFolderByServerRelativeUrl('${relativeFileUrl}')/ListItemAllFields?&expand=PageLayoutType`)
			
			console.log(item)
			
			return item
		},
		setFileItem: async (serverRelativeFileUrl, json) => {
			// serverRelativeFileUrl = '/sites/s1/sitepages/home.aspx'
			
			await s.def.post(`/_api/web/GetFolderByServerRelativeUrl('${serverRelativeFileUrl}')/ListItemAllFields')`, json, true)
		}
	}
}
if(window) {
    window.s = s;
}
