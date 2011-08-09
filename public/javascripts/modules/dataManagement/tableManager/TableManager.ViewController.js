Dbms.DataManagement.TableManager.ViewController = Ext.extend(Dbms.DataManagement.BaseManager.ViewController,{
	constructor : function(){
		Dbms.DataManagement.TableManager.ViewController.superclass.constructor.call(this);
	},
	init : function(conf, store){
		this.store = store;
		this.databaseName = conf.params.database_name;
		this.tableName = conf.params.table_name;
		this.uniqueKey = conf.uniqueKey;
		// view description
		this.desc = conf.tableDesc;
		this.viewColumns = [];
		this.filters = new Ext.util.MixedCollection;
		this.headerFilterPlugin = new Ext.ux.grid.GridHeaderFilters({
		    highlightOnFilter : true,
			applyMode 	      : 'enter',
		    highlightColor    : '#E2E2E2'
		});
		
		return this;
	}
});
