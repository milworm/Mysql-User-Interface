Ext.ns('Dbms.System');

Dbms.System.VariableStore = Ext.extend(Ext.data.JsonStore,{
	constructor : function(){
		Dbms.System.VariableStore.superclass.constructor.call(this,{
			fields : [{
				name : 'name'
			},{
				name :'value'
			}],
			root    : 'rows',
			storeId : 'System.VariableStore',
			proxy   : new Ext.data.HttpProxy({
				url    : Dbms.Actions.system.index,
				method : 'POST'
			}),
			autoLoad : true
		});
		this.on('load',this.onLoadEventHanlder,this);
	},
	/**
	 * return store-item where name == @param
	*/
	getByName : function(name){
		return this.getAt(this.findExact('name',name));
	},
	onLoadEventHanlder : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.System.VariableStore.loaded',{store : this});
	}
});