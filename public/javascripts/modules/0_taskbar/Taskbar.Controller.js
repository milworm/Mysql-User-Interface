/*
 * @class Dbms.Taskbar.Controller
 * Class takes care of connecting buttons,windows and taskbar together
 */
Dbms.Taskbar.Controller = Ext.extend(function(){}, {
	/*
	 * intializes taskbar-panel
	 * and button-builder
	 */
	constructor : function() {
		this.panel = new Dbms.Taskbar.Panel();
		this.factory = new Dbms.Taskbar.ButtonFactory();
		
		this.initListeners();
	},
	/*
	 * attaches event-listeners for required events
	 */
	initListeners : function() {
		Dbms.Core.MessageBus.on('Dbms.Taskbar.Window.Close', this.onWindowClosed, this);
		Dbms.Core.MessageBus.on('Dbms.Taskbar.Window.Minimize', this.onWindowMinimized, this);
		Dbms.Core.MessageBus.on('Dbms.Taskbar.Panel.ButtonPress', this.onButtonPressed, this);
		Dbms.Core.MessageBus.on('Dbms.Taskbar.ActiveWindowChange', this.onActiveWindowChanged, this);
		Dbms.Core.MessageBus.on('Dbms.Taskbar.DestroyWindow', this.onWindowDestroyed, this);
		Dbms.Core.MessageBus.on('Dbms.Taskbar.Clear', this.unToggle , this);
	},
	/*
	 * makes all buttons unToggled
	 */
	unToggleAll : function() {
		for(var i=this.panel.items.length-1;i>0;i--) {
			this.panel.items.get(i).toggle(false);
		}
	},
	/*
	 * fires when active window is changed,
	 * if window has button, makes it it toggled,
	 * overwise adds new button to taskbar
	 * @param {Ext.Window} win The new active window
	 */
	onActiveWindowChanged : function(win) {
		var button = this.getButtonFor(win);
		this.unToggleAll();
		
		if(button) {
			button.show().toggle(true);
			this.panel.doLayout();
			
			return ;
		}
		
		this.addButton(win);
	},
	/*
	 * function creates new button,
	 * adds it to the panel
	 * @param {Ext.Window} win The window, for which button will be created
	 */
	addButton : function(win) {
		this.panel.add(this.factory.getButton(win));
		this.panel.doLayout();
	},
	/*
	 * @param {Ext.Window} win
	 * @returns {Ext.Button|null} null will returned if window doesn't have button,
	 * 							  overwise instance of Ext.Button will returned
	 */
	getButtonFor : function(win) {
		for(var i=this.panel.items.length-1;i>0;i--){
			var button = this.panel.items.get(i);
			
			if(button.window == win){
				return button;
			}
		}
		
		return null
	},
	/**
	 * function shows window if button's previous state was untoggled,
	 * overwise minimizes window
	 * @param {Ext.Button} button The clicked button
	*/
	onButtonPressed : function(button) {
		button.window === Ext.WindowMgr.getActive() ? button.window.minimize() : button.window.show();
	},
	/*
	 * function fires when user clicks to close window,
	 * hides button in taskbar
	 * @param {Ext.Window} win
	 */
	onWindowClosed : function(win){
		win.button.hide();
		this.panel.doLayout();
	},
	/*
	 * function fires when after user clicks to minimize window,
	 * changes taskbar-button state to untoggled
	 * @param {Ext.Window} win
	 */
	onWindowMinimized : function(win) {
		win.button && win.button.toggle(false);
	},
	/*
	 * fires before window will be destoyed,
	 * this event will fired only by DBMS.Garbage.Collector,
	 * destoryes taskbar-button
	 * @param {Ext.Window} win The window that will be destoyed
	 */
	onWindowDestroyed : function(win) {
		win.button.destroy();
		this.panel.doLayout();
	}
});