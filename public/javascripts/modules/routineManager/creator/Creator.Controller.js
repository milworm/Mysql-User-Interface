Dbms.RoutineManagement.Creator.Controller = Ext.extend(function(){}, {
	constructor 	 : function() {
		Dbms.Core.MessageBus.on('RoutineManagement.Create.show', this.showCreateWindow, this);
	},
	showCreateWindow : function(config) {
		var wnd = Dbms.RoutineManagement.Creator.Factory.getWindow(config.database);
		wnd.show();
		
		if(config.select !== undefined) {
			wnd[config.select+'TypeSelect']();
		}
	}
});