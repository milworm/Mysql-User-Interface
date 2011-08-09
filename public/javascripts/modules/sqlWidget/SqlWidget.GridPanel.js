Dbms.SqlWidget.GridPanel = Ext.extend(Ext.grid.GridPanel, {
	constructor : function(config) {
		Dbms.SqlWidget.GridPanel.superclass.constructor.call(this, Ext.applyIf({
            columns : this.getColumns(config.store)
        }, config));
	},
	getColumns : function(store) {
		var headers = [];
        
        store.fields.each(function(i,all,idx){
            headers.push({
				header    : i.name,
				dataIndex : i.name,
				sortable  : true
			});
        },this);
        
        return headers;
	}
});