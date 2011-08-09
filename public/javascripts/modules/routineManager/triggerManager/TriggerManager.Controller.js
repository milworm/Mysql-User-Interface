Dbms.RoutineManagement.TriggerManager.Controller = Ext.extend(Dbms.RoutineManagement.BaseManager.Controller, {
	constructor : function(config) {
		Dbms.RoutineManagement.TriggerManager.Controller.superclass.constructor.call(this, Ext.applyIf({
			type   : "trigger",
			url    : Dbms.Actions.trigger.content,
			method : "POST"
		}, config));
	},
	initFactories : function() {
		this.storeFactory = Dbms.RoutineManagement.TriggerManager.StoreFactory;
		this.viewFactory = Dbms.RoutineManagement.TriggerManager.ViewFactory;
		this.windowFactory = Dbms.RoutineManagement.TriggerManager.WindowFactory;
	},
	processNodeClick : function(params) {
		var config = {
			type        : 'trigger',
			name        : params.node.attributes.desc.key,
			databaseName: params.databaseName,
			routineView : this.viewFactory.getPanel({
				uniqueKey : params.uniqueKey,
				url       : Dbms.Actions.trigger.create
			}),
			uniqueKey : params.uniqueKey
		};
		
		var result = this.windowFactory.getWindow(config);
		result.exists ? result.wnd.show() : (function(me){
			me.storeFactory.getStore({
				name         : config.name,
				uniqueKey    : params.uniqueKey,
				databaseName : params.databaseName
			});
		})(this);
	}
});