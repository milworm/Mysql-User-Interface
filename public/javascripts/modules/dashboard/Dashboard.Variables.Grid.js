Ext.ns('Dbms.Dashboard.Variables');

Dbms.Dashboard.Variables.Grid = Ext.extend(Ext.grid.GridPanel,{
	constructor : function() {
		Dbms.Dashboard.Variables.Grid.superclass.constructor.call(this,{
			tbar       : this.getTopToolbar(),
			columns    : this.getColumns(),
			store      : this.getStore(),
			viewConfig : {
				forceFit : true
			}
		});
	},
	getColumns : function() {
		return [new Ext.grid.RowNumberer({
			width  : 30,
			header : '№' 
		}),{
			header    : 'Variable Name',
			dataIndex : 'VARIABLE_NAME',
			sortable  : true,
			width     : 400,
			renderer  : this.renderer
		},{
			header    : 'Value',
			dataIndex : 'VARIABLE_VALUE',
			sortable  : true,
			width     : 300,
			renderer  : this.renderer
		}];
	},
	getStore : function() {
		return Ext.StoreMgr.get('Dashboard.Variables.Store');
	},
	getTopToolbar : function(){
		return new Ext.Toolbar({
			layout : 'form',
			items : [{
				fieldLabel  : ' Variable name ',
				labelStyle  : 'margin-left:5px',
				xtype       : 'combo',
				defaultText : "Start typing variable name"
			}]
		});
	},
	renderer : function (v, metaData, record, rowIndex, colIndex, store){
        if(rowIndex%2 == 0){
            metaData.attr = 'style="background-color:#E6EBF2";';
            
        }
        
        return v;
    
    } 
});

Ext.reg('Dbms.Dashboard.Variables.Grid', Dbms.Dashboard.Variables.Grid);