Dbms.DataManagement.TableManager.WindowController = Ext.extend(Dbms.DataManagement.BaseManager.WindowController,{
	constructor : function() {
		Dbms.DataManagement.TableManager.WindowController.superclass.constructor.call(this);
		//Dbms.Core.MessageBus.addListener('TableMgr.BuildWindow', this.buildWindow,this);
	},
	init : function(conf) {
		this.uniqueKey = conf.uniqueKey;
		this.databaseName = conf.params.database_name;
		this.tableName = conf.params.name;
		this.title = 'Table '+ Ext.util.Format.capitalize(this.databaseName)+'.'+Ext.util.Format.capitalize(this.tableName);
		
		this.store = conf.store;
		this.view = conf.view;
		
		this.attrs = {
			itemName     : this.tableName,
			databaseName : this.databaseName,
			type         : 'table',
			store        : this.store
		}
	},
	getTopToolbar : function(){
		return new Dbms.DataManagement.TableManager.TopToolbar({
			store : this.getStore()
		});
	},
	getBottomToolbar : function(){
		return new Dbms.DataManagement.TableManager.BottomToolbar({
			store : this.getStore()
		});
	},
	getStore : function(){
		return this.store;
	}
});