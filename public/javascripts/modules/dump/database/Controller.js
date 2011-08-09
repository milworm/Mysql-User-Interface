Ext.ns('Dbms.Dump.Database');
Dbms.Dump.Database.Controller = Ext.extend(Dbms.Dump.Base.Controller, {
	constructor : function(config) {
		Dbms.Core.MessageBus.on('Dbms.Dump.Database.showWindow', this.show, this);
		Dbms.Dump.Database.Controller.superclass.constructor.call(this, config);
		
		this.windows = {};
	},
	initWindow : function() {
		this.windows[this.databaseName] = new Dbms.Dump.Database.Window({
			title : 'Database '+this.databaseName+' Dump',
			uniqueKey : 'dump.'+this.databaseName
		});
	}
});