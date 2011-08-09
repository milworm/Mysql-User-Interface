Dbms.RoutineManagement.RoutineTypeStore = Ext.extend(Ext.data.JsonStore, {
	constructor : function(config) {
		Dbms.RoutineManagement.RoutineTypeStore.superclass.constructor.call(this, Ext.applyIf({
			storeId : 'routineType',
			fields  : ["type", 'id'],
			root   : "items",
			data   : {
				items : [{
					type : "Procedure",
					id   : "procedure"
				}, {
					type : "Function",
					id   : "func"
				}, {
					type : 'Trigger',
					id   : "trigger"
				}]
			},
			autoLoad : true
		}, config));
	}
});