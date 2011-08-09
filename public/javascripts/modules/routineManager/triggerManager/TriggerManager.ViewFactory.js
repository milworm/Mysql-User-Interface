Dbms.RoutineManagement.TriggerManager.ViewFactory = Ext.extend(Dbms.RoutineManagement.BaseManager.ViewFactory,{
	getPanel : function(config) {
		return new Dbms.RoutineManagement.BaseManager.View(config);
	}
});