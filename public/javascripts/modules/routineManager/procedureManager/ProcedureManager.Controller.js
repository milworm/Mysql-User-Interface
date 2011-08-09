Dbms.RoutineManagement.ProcedureManager.Controller = Ext.extend(Dbms.RoutineManagement.BaseManager.Controller, {
	constructor : function(config) {
		Dbms.RoutineManagement.ProcedureManager.Controller.superclass.constructor.call(this, Ext.applyIf({
			type   : "procedure",
			url    : Dbms.Actions.procedure.content,
			method : "POST"
		}, config));
	},
	initFactories : function() {
		this.storeFactory = Dbms.RoutineManagement.ProcedureManager.StoreFactory;
		this.viewFactory = Dbms.RoutineManagement.ProcedureManager.ViewFactory;
		this.windowFactory = Dbms.RoutineManagement.ProcedureManager.WindowFactory;
	},
	processNodeClick : function(params) {
		var config = {
			name        : params.node.attributes.desc.key,
			databaseName: params.databaseName,
			type        : 'procedure',
			routineView : this.viewFactory.getPanel({
				uniqueKey : params.uniqueKey,
				url       : Dbms.Actions.procedure.create
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