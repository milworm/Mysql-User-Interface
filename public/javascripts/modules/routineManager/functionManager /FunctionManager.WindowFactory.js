Dbms.RoutineManagement.FunctionManager.WindowFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.WindowFactory, {
	createWindow : function(config) {
		config.attrs = config.attrs || {};
		Ext.applyIf(config.attrs, {
			type         : 'func',
			itemName     : config.name,
			databaseName : config.databaseName
		});
		
		return new Dbms.RoutineManagement.FunctionManager.Window(config);
	}
});