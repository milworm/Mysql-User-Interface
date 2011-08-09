Dbms.RoutineManagement.FunctionManager.Store = Ext.extend(Dbms.RoutineManagement.BaseManager.Store, {
	constructor : function(config) {
		Dbms.RoutineManagement.FunctionManager.Store.superclass.constructor.call(this, Ext.applyIf({
			idProperty : 'ROUTINE_DEFINITION',
			baseParams : {
				function_name : config.name,
				type           : 'Function',
				database_name  : config.databaseName
			}
		}, config));
	},
	getFields : function() {
		return ['ROUTINE_DEFINITION'];
	},
	getProxyUrl : function() {
		return Dbms.Actions.func.content;
	},
	getProxyMethod : function() {
		return "POST";
	},
	onLoadEventHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.RoutineStore.load' + this.storeId, this);
	}
});