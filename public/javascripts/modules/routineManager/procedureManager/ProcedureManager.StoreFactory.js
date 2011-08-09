Dbms.RoutineManagement.ProcedureManager.StoreFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.StoreFactory,{
	getStore : function(config) {
		return new Dbms.RoutineManagement.ProcedureManager.Store(config);
	}
});