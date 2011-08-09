/**
 * @class DataManagement.DataManagement.BaseManager.Controller
 * controls all operation linked with module
 * performs creation new Store Grid etc
*/
Dbms.DataManagement.BaseManager.Controller = Ext.extend(Ext.util.Observable, {
	constructor : function(config){
		Ext.apply(this,{
			config 		    : config,
			capitalizedType : Ext.util.Format.capitalize(config.type)
		});
		
		Dbms.DataManagement.BaseManager.Controller.superclass.constructor.call(this);
		Dbms.Core.MessageBus.addListener('Dbms.Database.TreePanel.'+this.capitalizedType+'NodeClick', this.nodeClickEventHandler, this);
	},
	setNode : function(node){
		this.node = node;
	},
	init : function(){
		// set database name
		//this.initDatabaseName();
		// load params
		this.params = {}
		this.params['database_name'] = this.databaseName;
		this.params['name'] = this.node.attributes.desc.key;
		// unique key
		this.uniqueKey = '#'+this.capitalizedType+this.params.database_name+'.'+this.node.attributes.desc.key;
	},
	/**
	 * process situation where table-left-node clicked
	 * @param o {object}  config contains node-witch was clicked
	*/
	nodeClickEventHandler : function(params) {
		var node = params.node;
		this.databaseName = params.databaseName;
		this.setNode(node);
		this.init();
		var store = this.findStore();
		
		if(store === false) {
			// store doesnt exists try to load it
			this.buildMVC(); // create new item with store, grid and window
		} else {
			// store already loaded
			var window = this.findWindow();
			
			if(window === false){
				// build grid and window
				this.buildVC({
					store 	  : store
				});
			} else {
				window.show();
			}
			
		}
	},
	/**
	 * @returns boolean true if store exists
	*/
	findStore : function(){
		return Ext.StoreMgr.get(this.uniqueKey) || false;
	},
	findWindow : function(){
		var result = false;
		Ext.WindowMgr.each(function(wnd){
			if(wnd.uniqueKey && wnd.uniqueKey == this.uniqueKey){
				return result = wnd;
			}
		},this);
		
		return result;
	},
	/**
	 * get table and database names from current-node
	 * @param n {object}, node to start search
	*/
	initDatabaseName : function(){
		var node = this.node;
		
		while(node.attributes.desc.type != 'database'){
			node = node.parentNode;
		}
		
		this.databaseName = node.attributes.desc.key;
	},
	/**
	 * create new instance of Store, Grid, Window
	*/
	buildMVC : function(uniqueKey){
		Ext.Ajax.request({
			url     : this.config.url,
			method  : this.config.method,
			params  : this.params,
			success : function(response){
				var jsObject = Ext.decode(response.responseText, true);
				
				if(jsObject === false) {
					Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
						msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
					});
			
					return;
				}
				
				this.mvcSuccessHandler(jsObject);
			},
			failure : function(response) {
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
					msg  : response.responseText
				});
			},
			scope : this
		});
	},
	mvcSuccessHandler : function(jsObject){
	    
	},
	buildVC : function(config){
		
	},
	/**
	 * make api-call to get table structure and 
	 * creates new window to handle table-information
	*/
	buildWindow : function(){
		Ext.Ajax.request({
			url     : this.structRequestUrl,
			method  : 'post',
			params  : this.params,
			success : function(response){
				var resp = Ext.decode(response.responseText, true);
				
				if(!resp){
					Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{msg : 'The response is invalid. Look!!!'+response.responseText});
					return;
				}
				
				resp.itemName = resp.name;
				
				var storeController  = new Dbms.DataManagement.BaseManager.StoreController(this.contentRequestUrl);
				var viewController   = new Dbms.DataManagement.BaseManager.ViewController();
				var windowController = new Dbms.DataManagement.BaseManager.WindowController();
				
				storeController.buildStore(resp);
				viewController.buildView(resp);
				
				resp.view = viewController.getView();
				resp.store = storeController.getStore();
				resp.store.load();
				
				windowController.buildWindow(resp);
			},
			failure : function(response){
				var c = {
					msg  : 'Sorry, an error occured while loading...</br>'+response.responseText
				}
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',c);
			},
			scope : this
		});
	}
});