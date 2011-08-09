Dbms.RoutineManagement.ProcedureManager.WindowFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.WindowFactory, {
	createWindow : function(config) {
		config.attrs = config.attrs || {};
		Ext.applyIf(config.attrs, {
			type         : 'procedure',
			itemName     : config.name,
			databaseName : config.databaseName
		});
		
		return new Dbms.RoutineManagement.ProcedureManager.Window(config);
	}
});