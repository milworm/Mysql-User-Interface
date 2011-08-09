Dbms.DataManagement.ViewManager.StoreController = Ext.extend(Dbms.DataManagement.BaseManager.StoreController, {
	constructor : function() {
		Dbms.DataManagement.ViewManager.StoreController.superclass.constructor.call(this);
	},
	init : function(conf) {
		Dbms.Core.MessageBus.addListener('Dbms.DataManagement.ViewManager.structureload', this.buildStore, this);
		
		this.databaseName = conf.params.database_name;
		this.viewName = conf.params.name;
		this.proxy =  {
			url    : Dbms.Actions.view.content,
			method : "POST"
		};
		
		this.uniqueKey = conf.uniqueKey;
		
		// view description
		this.desc = conf.viewDesc;
		
		// store base load params
		this.baseParams = {
			view_name     : this.viewName,
			database_name : this.databaseName,
			start   	  : 0,
			limit   	  : Dbms.Constants.DEFAULT_PAGE_SIZE
		}
		
		return this;
	}
});