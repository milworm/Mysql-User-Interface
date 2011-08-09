Dbms.RoutineManagement.FunctionManager.StoreFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.StoreFactory,{
	getStore : function(config) {
		return new Dbms.RoutineManagement.FunctionManager.Store(config);
	}
});