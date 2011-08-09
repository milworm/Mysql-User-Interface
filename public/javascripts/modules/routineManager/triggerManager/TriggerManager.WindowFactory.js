Dbms.RoutineManagement.TriggerManager.WindowFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.WindowFactory, {
	createWindow : function(config) {
		config.attrs = config.attrs || {};
		Ext.applyIf(config.attrs, {
			type         : 'trigger',
			itemName     : config.name,
			databaseName : config.databaseName
		});
		
		return new Dbms.RoutineManagement.TriggerManager.Window(config);
	}
});