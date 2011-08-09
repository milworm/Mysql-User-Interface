/*
 * @class Dbms.Taskbar.Window
 * Represents Window that will be connected
 * with taskbar button
 */
Dbms.Taskbar.Window = Ext.extend(Ext.Window, {
	/*
	 * attaches listeners for required listeners
	 * @param {Object} config Set of default-configuration options
	 */
	constructor : function(config) {
		config = Ext.applyIf(config || {}, {
			closeAction : 'hide',
			maximizable : true,
			minimizable : true,
			constrain   : true,
			renderTo    : Dbms.Core.Viewport.center.getEl()
		});
		
		Dbms.Taskbar.Window.superclass.constructor.call(this, config);
		
		this.on('beforehide', this.onBeforeClose, this);
		this.on('minimize', this.onAfterMinimize, this);
		this.on('activate', this.onActivate, this);
		this.on('beforedestroy', this.onBeforeDestroy, this);
	},
	/*
	 * fires before user clicks on close-icon
	 */
	onBeforeClose : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.Window.Close', this);
	},
	/*
	 * fires after user clicks on minimize-icon
	 */
	onAfterMinimize : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.Window.beforeMinimize', this);
		this.hideOnly();
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.Window.Minimize', this);
	},
	/*
	 * hides window without firing hide-event,
	 * requires to leave button in taskbar
	 */
	hideOnly   : function() {
		this.un('beforehide', this.onBeforeClose);
		this.hide();
		this.on('beforehide', this.onBeforeClose, this);
	},
	/*
	 * fires when active becomes active
	 */
	onActivate : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.ActiveWindowChange', this);
	},
	/*
	 * shows window without firing show event
	 */
	showOnly : function() {
		this.superclass().show.call(this);
	},
	/*
	 * fires befor window will be destroyed
	 */
	onBeforeDestroy : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.DestroyWindow', this);
	}
});