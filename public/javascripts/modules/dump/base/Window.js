Ext.ns('Dbms.Dump.Base');

Dbms.Dump.Base.Window = Ext.extend(Dbms.Taskbar.Window, {
	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config, {
			width  : 500,
			height : 400
		});
		
		Dbms.Dump.Base.Window.superclass.constructor.call(this, config);
	}
});