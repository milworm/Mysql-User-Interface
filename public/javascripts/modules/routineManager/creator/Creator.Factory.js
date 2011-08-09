Dbms.RoutineManagement.Creator.Factory = Ext.extend(function(){}, {
	constructor : function(){
		this.windows = {};
	},
	getWindow : function(database) {
		 if(this.windows[database] === undefined) {
			this.windows[database] = new Dbms.RoutineManagement.Creator.Window({
				database : database,
				uniqueId : Ext.id()
			});
		 }
		 
		 return this.windows[database];
	}
});