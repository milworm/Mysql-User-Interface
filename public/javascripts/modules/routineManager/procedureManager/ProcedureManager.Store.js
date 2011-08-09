Dbms.RoutineManagement.ProcedureManager.Store = Ext.extend(Dbms.RoutineManagement.BaseManager.Store, {
	constructor : function(config) {
		Dbms.RoutineManagement.ProcedureManager.Store.superclass.constructor.call(this, Ext.applyIf({
			idProperty : 'ROUTINE_DEFINITION',
			baseParams : {
				procedure_name : config.name,
				type           : 'procedure',
				database_name  : config.databaseName
			}
		}, config));
	},
	getFields : function() {
		return ['ROUTINE_DEFINITION'];
	},
	getProxyUrl : function() {
		return Dbms.Actions.procedure.content;
	},
	getProxyMethod : function() {
		return "POST";
	},
	onLoadEventHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.RoutineStore.load' + this.storeId, this);
	}
});