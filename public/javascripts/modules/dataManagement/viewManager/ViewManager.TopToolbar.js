Dbms.DataManagement.ViewManager.TopToolbar = Ext.extend(Dbms.DataManagement.BaseManager.TopToolbar,{
	constructor : function(config){
		Dbms.DataManagement.ViewManager.TopToolbar.superclass.constructor.call(this, config);
		Dbms.Core.MessageBus.on('Dbms.ViewMgr.ChangePageSize', this.select, this);
	}
})