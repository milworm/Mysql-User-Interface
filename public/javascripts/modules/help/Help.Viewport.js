Ext.ns('Dbms.Help');
/**
 * @class Help.Viewport
 *
 * build layout for help panel
 * west-region: Help.TreePanel
 * center-region: Help.Grid
*/
Dbms.Help.Viewport = Ext.extend(Ext.Panel, {
	constructor : function(){
		Dbms.Help.Viewport.superclass.constructor.call(this, {
			layout : 'border',
			defaults : {
				split       : true
			},
			items  : [{
				region 		: 'west',
				width  		: 300,
				minWidth 	: 300,
				collapsible : true,
				layout 		: 'fit',
				xtype  		: 'panel',
				title  		: 'Topics',
				items  		: {
					xtype : 'Dbms.Help.TreePanel'
				}
			},{
				region : 'center',
				xtype  : 'panel',
				title  : 'Description',
				layout : 'fit',
				items  : {
					xtype : 'Dbms.Help.TabPanel'
				}
			}]
		});
	}
});