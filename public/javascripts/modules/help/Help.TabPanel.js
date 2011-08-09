Ext.ns('Dbms.Help');
/**
 * @class Help.TabPanel
 *
 * tabPanel using to show items from category,
 * that was selected in help-tree
*/
Dbms.Help.TabPanel = Ext.extend(Ext.TabPanel, {
	constructor : function(){
		// call parent constructor in Help.TabPanel context
		Dbms.Help.TabPanel.superclass.constructor.call(this,{
			activeTab : 0,
			items 	  : {
				xtype : "Dbms.Help.HomePanel"
			}
		});
		
		Dbms.Core.MessageBus.on('Dbms.Help.SetActiveTab', this.restorePanel, this);
		Dbms.Core.MessageBus.on('Dbms.Help.AttachPanel', this.attachPanel, this);
	},
	///**
	// * set active panel
	// * where category id is equal with param
	//*/
	//restorePanel : function(categoryId){
	//	//find panel
	//	var panel = Dbms.Help.CategoryCacheStore.get(categoryId);
	//	this.setActiveTab(panel);
	//},
	attachPanel : function(panel){
		this.add(panel);
		this.setActiveTab(panel);
		this.doLayout();
	}
});

Ext.reg('Dbms.Help.TabPanel', Dbms.Help.TabPanel);