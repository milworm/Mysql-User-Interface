Dbms.RoutineManagement.BaseManager.StoreFactory = Ext.extend(function(){}, {
	/**
	 * create new store and add it to Dbms.TableMgr
	 * @param o {object}
	*/
	getStore : function(config) {
		return new Dbms.RoutineManagement.BaseManager.Store(config);
	}
});