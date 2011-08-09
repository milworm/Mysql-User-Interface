Ext.ns('Dbms.Help');

Dbms.Help.PanelToolbar = Ext.extend(Ext.Toolbar, {
	constructor : function(){
		Dbms.Help.PanelToolbar.superclass.constructor.call(this, {
			items : [" ", {
				xtype : 'Dbms.Help.SearchField'
			}]
		});
	}
});

Ext.reg('Dbms.Help.PanelToolbar', Dbms.Help.PanelToolbar);