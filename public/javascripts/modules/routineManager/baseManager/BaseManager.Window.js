Dbms.RoutineManagement.BaseManager.Window = Ext.extend(Dbms.Taskbar.Window, {
	/**
	 * @param o {object}, decoded server-response
	*/
	constructor : function(config) {
		Dbms.RoutineManagement.BaseManager.Window.superclass.constructor.call(this, Ext.applyIf({
			layout    : 'fit',
			height      : 900,
			width       : 600,
			maximizable : true,
			minimizable : true,
			maximized   : true,
			constrain   : true,
			renderTo    : Dbms.Core.Viewport.center.getEl(),
			scope       : this,
			listeners   : {
				beforerender : this.onBeforeRender,
				scope        : this
			}
		}, config));
		
		this.show();
	},
	attachAutocomplete : function() {
		var rootId = this.view.id;
		var autocmplete = new Dbms.Autocomplete.Controller(rootId, Ext.StoreMgr.get('Autocomplete.KeywordsStore').list());
	},
	onBeforeRender : function() {
		this.setTitle(Ext.util.Format.capitalize(this.type)+' ' + this.databaseName + '.' + this.name);
		this.add(this.routineView);
	}
});