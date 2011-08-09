Dbms.DataManagement.ViewManager.BottomToolbar = Ext.extend(Dbms.DataManagement.BaseManager.BottomToolbar,{
	constructor : function(config){
		Dbms.DataManagement.ViewManager.BottomToolbar.superclass.constructor.call(this,config);
		Dbms.Core.MessageBus.addListener('Dbms.ViewMgr.ChangePageSize', this.changePageSize,this);
	}	
})