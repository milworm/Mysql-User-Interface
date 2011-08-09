Dbms.DataManagement.TableManager.TopToolbar = Ext.extend(Dbms.DataManagement.BaseManager.TopToolbar,{
	constructor : function(config){
		Dbms.DataManagement.TableManager.TopToolbar.superclass.constructor.call(this, config);
		//Dbms.Core.MessageBus.addListener('Dbms.TableMgr.ChangePageSize', this.select, this);
	}
});

Ext.reg('Dbms.DataManagement.TableManager.TopToolbar', Dbms.DataManagement.TableManager.TopToolbar);