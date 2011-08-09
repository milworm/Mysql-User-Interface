/*
 * @class Dbms.Taskbar.ButtonFactory
 *
 * controls process of creation taskbar-button
 */
Dbms.Taskbar.ButtonFactory = Ext.extend(function(){},{
	/*
	 * initializes taskbar-button common
	 * configuration options
	 * @param {Object} config set of custom fields that will be
	 * 						  added to button
	 */
	constructor : function(config) {
		this.buttonCfg = Ext.apply({}, config || {}, {
			height       : 27,
			pressed      : true,
			enableToggle : true
		});
	},
	/*
	 * function creates new taskbar-button
	 * @param {Ext.Window} win The window for which button will be created
	 * @returns {Ext.Button}
	 */
	getButton : function(win) {
		var button = new Ext.Button(Ext.apply({
			xtype        : 'button',
			text         : win.title,
			window       : win,
			window       : win,
			uniqueKey    : win.uniqueKey
		}, this.buttonCfg));
		
		button.handler = this.clickHandler;
		this.makeRelations(button, win);
		return button;
	},
	/*
	 * function creates relation beetween button and window
	 * @param {Ext.Button} button
	 * @param {Ext.Window} win
	 */
	makeRelations : function(button, win) {
		button.window = win;
		win.button = button;
	},
	/*
	 * function is button-click-event handler,
	 * @event Dbms.Taskbar.Panel.ButtonPress
	 * @param {Ext.Button} button The clicked button
	 */
	clickHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Taskbar.Panel.ButtonPress', this);
	}
});