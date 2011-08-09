Dbms.RoutineManagement.FunctionManager.Controller = Ext.extend(Dbms.RoutineManagement.BaseManager.Controller, {
	constructor : function(config) {
		Dbms.RoutineManagement.FunctionManager.Controller.superclass.constructor.call(this, Ext.applyIf({
			type   : "func",
			url    : Dbms.Actions.func.content,
			method : "POST"
		}, config));
	},
	initFactories : function() {
		this.storeFactory = Dbms.RoutineManagement.FunctionManager.StoreFactory;
		this.viewFactory = Dbms.RoutineManagement.FunctionManager.ViewFactory;
		this.windowFactory = Dbms.RoutineManagement.FunctionManager.WindowFactory;
	},
	processNodeClick : function(params) {
		var config = {
			type        : 'function',
			name        : params.node.attributes.desc.key,
			databaseName: params.databaseName,
			routineView : this.viewFactory.getPanel({
				uniqueKey : params.uniqueKey,
				url       : Dbms.Actions.func.create
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