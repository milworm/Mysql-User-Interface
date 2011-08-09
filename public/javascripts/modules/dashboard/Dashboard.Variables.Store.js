Ext.ns('Dbms.Dashboard.Variables');

Dbms.Dashboard.Variables.Store = Ext.extend(Ext.data.JsonStore, {
	constructor : function(){
		Dbms.Dashboard.Variables.Store.superclass.constructor.call(this, {
			storeId : 'Dashboard.Variables.Store',
			fields  : ['VARIABLE_NAME', 'VARIABLE_VALUE'],
			root    : 'rows',
			proxy   : new Ext.data.HttpProxy({
				url    : Dbms.Actions.system.variables,
				method : "POST"
			}),
			autoLoad : true
		})
	}
});