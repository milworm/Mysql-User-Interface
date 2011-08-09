Ext.ns('Dbms.System');

Dbms.System.VariablesView = Ext.extend(Ext.Panel,{
	constructor : function(){
		Dbms.System.VariablesView.superclass.constructor.call(this,{
			border : false,
			frame  : false,
			store  : Dbms.System.VariableStore
		});
		Dbms.Core.MessageBus.on('Dbms.System.variables.loaded',this.setVariables,this);
		
	},
	setVariables : function(){
		this.add({
			xtype : "container",
			items : [{
				html : 'Hostname : ' + this.store.getByName('hostname').get('value')+"</br>"+
					   'Server Version : ' + this.store.getByName('version').get('value')+"</br>"+
					   'Protocol Version : ' + this.store.getByName('protocol_version').get('value')
			}]
		});
		
		Dbms.Core.Viewport.doLayout();
	}
});

Ext.reg('Dbms.System.VariablesView', Dbms.System.VariablesView);