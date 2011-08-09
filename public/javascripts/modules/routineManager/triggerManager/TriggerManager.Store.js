Dbms.RoutineManagement.TriggerManager.Store = Ext.extend(Dbms.RoutineManagement.BaseManager.Store, {
	constructor : function(config) {
		Dbms.RoutineManagement.TriggerManager.Store.superclass.constructor.call(this, Ext.applyIf({
			idProperty : 'ACTION_STATEMENT',
			baseParams : {
				trigger_name : config.name,
				type           : 'trigger',
				database_name  : config.databaseName
			}
		}, config));
	},
	getFields : function() {
		return ['ACTION_STATEMENT'];
	},
	getProxyUrl : function() {
		return Dbms.Actions.trigger.content;
	},
	getProxyMethod : function() {
		return "POST";
	},
	onLoadEventHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.RoutineStore.load' + this.storeId, this);
	}
});