/*
 * @namespace Dbms.Taskbar
 * @class Panel
 * class represents taskbar-view,
 * contains all buttons for windows
 */
Dbms.Taskbar.Panel = Ext.extend(Ext.Panel,{
	/*
	 * @constructor
	 */
	constructor : function() {
		Dbms.Taskbar.Panel.superclass.constructor.call(this,{
			layout : 'hbox',
			// setup the default button (clearAllButton)
			items     : [{
				xtype   : 'button',
				icon    : '/images/icons/hide_all.png',
				handler : function(){
					Ext.WindowMgr.each(function(item){
						item.minimize && item.minimize();
					});
				}
			}]
		});
	},
	initComponent : function(){
		this.superclass().initComponent.call(this);
		this.clearAllButton = this.items.get(0);
	},
	clear : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.Clear');
	}
});