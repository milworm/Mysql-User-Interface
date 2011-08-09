Dbms.TableStructure.View = Ext.extend(Ext.grid.GridPanel,{
	constructor : function(c){
		Ext.applyIf(c,{
			layout   : 'fit',
			loadMask : true,
			layoutConfig : {
				forceFit : true
			},
			columns : [{
				sortable : true,
				editor   : {
					xtype : "textfield"
				},
				header 	  : "Name",
				width     : 120,
				dataIndex : "COLUMN_NAME"
			},{
				sortable : true,
				editor   : {
					xtype  	  : "textfield"
				},
				header 	  : "Value",
				width     : 120,
				dataIndex : "COLUMN_TYPE"
			}]
		});
		
		Dbms.TableStructure.View.superclass.constructor.call(this,c);
	}
})