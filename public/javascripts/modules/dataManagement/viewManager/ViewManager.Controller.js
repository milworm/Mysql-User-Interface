Dbms.DataManagement.ViewManager.Controller = Ext.extend(Dbms.DataManagement.BaseManager.Controller, {
	constructor : function(){
		Dbms.DataManagement.ViewManager.Controller.superclass.constructor.call(this,{
			type 	 : "view",
			url      : Dbms.Actions.view.structure,
			method   : "POST"
		});
	},
	mvcSuccessHandler : function(jsObject) {
		var buildConfig = { uniqueKey : this.uniqueKey,
							params    : this.params,
							type      : this.config.type,
							viewDesc  : jsObject}
		
		var store  = new Dbms.DataManagement.ViewManager.StoreController().
							   init(buildConfig).
							   buildStore();
							   
		var view   = new Dbms.DataManagement.ViewManager.ViewController().
							   init(buildConfig, store).
							   buildView();
							   
		buildConfig.view = view;
		buildConfig.store = store;
		// build window
		var windowController = new Dbms.DataManagement.ViewManager.WindowController();
			windowController.init(buildConfig);
			windowController.buildWindow();
	}
});