Dbms.RoutineManagement.BaseManager.ViewFactory = Ext.extend(function(){}, {
	/**
	 * @param o {object}, decoded server-response
	*/
	getPanel : function(config) {
		return new Dbms.RoutineManagement.BaseManager.View(config);
	}
});