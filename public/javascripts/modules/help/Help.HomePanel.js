Ext.ns('Dbms.Help');
/**
 * @class Help.HomePanel
 *
 * this is the home panel, in Help.TabPanel,
 * shows search-field (fast way to find info about mysql-func or statement),
 * panel is not closable
*/
Dbms.Help.HomePanel = Ext.extend(Ext.Panel, {
	constructor : function(){
		
		// call parent constructor in Help.TabPanel context
		Dbms.Help.HomePanel.superclass.constructor.call(this,{
			title    : 'Home',
			closable : false,
			layout   : "fit",
			items    : Dbms.Help.PanelBuilder.gridBuilder.build({
				store : Ext.StoreMgr.get('Help.SearchFieldStore')
			}),
			tbar     : {
				xtype : "Dbms.Help.PanelToolbar"
			}
		});
		
		Dbms.Core.MessageBus.on('Dbms.Help.SearchFieldStore.Load', this.renderLoadedItems, this);
		this.on('afterlayout', this.expandChildren, this);
	},
	renderLoadedItems : function(){
		this.doLayout();
	},
	expandChildren : function(){
		for(var i=0,expander = this.items.get(0).plugins;i < this.items.get(0).store.data.length;i++){
			expander.expandRow(i);
		}
	}
});

Ext.reg('Dbms.Help.HomePanel', Dbms.Help.HomePanel);