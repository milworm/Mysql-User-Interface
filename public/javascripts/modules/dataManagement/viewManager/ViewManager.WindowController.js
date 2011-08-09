Dbms.DataManagement.ViewManager.WindowController = Ext.extend(Dbms.DataManagement.BaseManager.WindowController,{
	constructor : function(){
		Dbms.DataManagement.ViewManager.WindowController.superclass.constructor.call(this);
		Dbms.Core.MessageBus.addListener('Dbms.TableMgr.ChangePageSize', this.changePageSize,this);
	},
	init : function(conf) {
		this.uniqueKey = conf.uniqueKey;
		this.databaseName = conf.params.database_name;
		this.viewName = conf.params.name;
		this.title = 'View '+ Ext.util.Format.capitalize(this.databaseName)+'.'+Ext.util.Format.capitalize(this.viewName);
		
		this.store = conf.store;
		this.view = conf.view;
		
		this.attrs = {
			itemName     : this.viewName,
			databaseName : this.databaseName,
			type         : 'view',
			store        : this.getStore()
		}
	},
	getTopToolbar : function(){
		return new Dbms.DataManagement.ViewManager.TopToolbar({
			store : this.getStore()
		});
	},
	getBottomToolbar : function(){
		return new Dbms.DataManagement.ViewManager.BottomToolbar({
			store : this.getStore()
		});
	},
	getStore : function(){
		return this.store;
	}
});