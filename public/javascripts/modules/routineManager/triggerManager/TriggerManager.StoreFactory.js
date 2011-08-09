Dbms.RoutineManagement.TriggerManager.StoreFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.StoreFactory,{
	getStore : function(config) {
		return new Dbms.RoutineManagement.TriggerManager.Store(config);
	}
});