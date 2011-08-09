Dbms.DataManagement.TableManager.StoreController = Ext.extend(Dbms.DataManagement.BaseManager.StoreController, {
	constructor : function() {
		Dbms.DataManagement.TableManager.StoreController.superclass.constructor.call(this);
	},
	init : function(conf) {
		Dbms.Core.MessageBus.addListener('Dbms.DataManagement.TableManager.structureload', this.buildStore, this);
		
		this.databaseName = conf.params.database_name;
		this.tableName = conf.params.name;
		this.proxy =  {
			url    : Dbms.Actions.table.content,
			method : "POST"
		};
		this.uniqueKey = conf.uniqueKey;
		
		// view description
		this.desc = conf.tableDesc;
		
		// store base load params
		this.baseParams = {
			table_name    : this.tableName,
			database_name : this.databaseName,
			start   	  : 0,
			limit   	  : Dbms.Constants.DEFAULT_PAGE_SIZE
		}
		
		return this;
	}
});