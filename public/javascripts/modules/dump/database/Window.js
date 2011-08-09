Ext.ns('Dbms.Dump.Database');

Dbms.Dump.Database.Window = Ext.extend(Dbms.Dump.Base.Window, {
	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
		
		Dbms.Dump.Database.Window.superclass.constructor.call(this, config);
	}
});