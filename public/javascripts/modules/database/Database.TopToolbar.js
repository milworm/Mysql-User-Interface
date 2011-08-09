Ext.ns('Dbms.Database.Tree');
Dbms.Database.Tree.TopToolbar = Ext.extend(Ext.Toolbar,{
	constructor : function(){
		Dbms.Database.Tree.TopToolbar.superclass.constructor.call(this,{
			items : [{
			    xtype : 'tbfill'
			},{
			    xtype : 'button',
			    ref   : 'expandAll',
			    text  : 'Expand All'
			},{
			    xtype : 'button',
			    ref   : 'collapseAll',
			    text  : 'Collapse All'
			}]
		});
		
		this.expandAll.on('click',this.expandAllClickEventHandler,this);
		this.collapseAll.on('click',this.collapseAllClickEventHandler,this);
	},
	expandAllClickEventHandler : function(){
	    Dbms.Core.MessageBus.fireEvent('Dbms.Database.Tree.TopToolbar.expandAll');
	},
	collapseAllClickEventHandler : function(){
	    Dbms.Core.MessageBus.fireEvent('Dbms.Database.Tree.TopToolbar.collapseAll');
	}
});

Ext.reg('Dbms.Database.Tree.TopToolbar', Dbms.Database.Tree.TopToolbar);