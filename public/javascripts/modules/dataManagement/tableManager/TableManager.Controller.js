Dbms.DataManagement.TableManager.Controller = Ext.extend(Dbms.DataManagement.BaseManager.Controller, {
	constructor : function(){
		Dbms.DataManagement.TableManager.Controller.superclass.constructor.call(this,{
			type 	 : "table",
			url      : Dbms.Actions.table.structure,
			method   : "POST"
		});
	},
	mvcSuccessHandler : function(jsObject) {
		var buildConfig = {
			uniqueKey : this.uniqueKey,
			params    : this.params,
			type      : this.config.type,
			tableDesc : jsObject
		}
		
		var store  = new Dbms.DataManagement.TableManager.StoreController().init(buildConfig).buildStore();
		var view   = new Dbms.DataManagement.TableManager.ViewController().init(buildConfig, store).buildView();
							   
		buildConfig.view = view;
		buildConfig.store = store;
		// build window
		var windowController = new Dbms.DataManagement.TableManager.WindowController();
		windowController.init(buildConfig);
		windowController.buildWindow();
	}
});