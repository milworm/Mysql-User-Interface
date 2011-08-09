Dbms.DataManagement.ViewManager.ViewController = Ext.extend(Dbms.DataManagement.BaseManager.ViewController,{
	constructor : function(){
		Dbms.DataManagement.ViewManager.ViewController.superclass.constructor.call(this);
	},
	init : function(conf, store){
		this.store = store;
		this.databaseName = conf.params.database_name;
		this.viewName = conf.params.name;
		this.uniqueKey = conf.uniqueKey;
		// view description
		this.desc = conf.viewDesc;
		this.viewColumns = [];
		this.filters = new Ext.util.MixedCollection;
		this.headerFilterPlugin = new Ext.ux.grid.GridHeaderFilters({
		    highlightOnFilter : true,
			applyMode 	      : 'enter',
		    highlightColor    : '#E2E2E2'
		});
		
		return this;
	},
	/**
	 * creates fields for store
	*/
	buildColumns : function(){
		for(var i=0;i<this.desc.columns.length;i++){
			var columnDesc = this.desc.columns[i];
			var column = {
				height : '10px',
				header : columnDesc['COLUMN_NAME'],
//				filter	  : new Ext.form.ComboBox({
//                    triggerAction : 'all',
//                    mode	      : 'local',
//                    store		  : new Ext.data.ArrayStore({
//						fields : ['id','name'],
//						data   : [[1,'some'],[2,'piton']]
//					}),
//                    valueField   : 'id',
//                    displayField : 'name'
//                }),
				filter : {
					xtype     : "textfield",
					listeners : {
						specialkey : function(){
							if(e.ENTER == e.keyCode){
								alert('enter');
							} else {
								alert(e.keyCode);
							}
						}
					}
				},
				dataIndex : columnDesc['COLUMN_NAME']
			};
			
			if(columnDesc.COLUMN_KEY == 'PRI'){
				column.id = 'columnPrimary columnPrimary-'+Ext.id();
			}
			
			this.viewColumns.push(column);
		}
	}
});

//TableMgr.BuildView