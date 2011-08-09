Ext.ns('Dbms.Help');

Dbms.Help.SearchFieldStore = Ext.extend(Ext.data.JsonStore, {
	constructor : function(){
		Dbms.Help.SearchFieldStore.superclass.constructor.call(this, {
			storeId : 'SearchFieldStore',
			fields  : ['name', 'description', 'example'],
			root    : 'rows',
			storeId : 'Help.SearchFieldStore',
			proxy   : new Ext.data.HttpProxy({
				url    : Dbms.Actions.help.search,
				method : "post"
			})
		});
		
		this.on('beforeload', function(){
			this.setBaseParam('selected', this.isItemSelected);
		}, this);
		
		this.on('load', function() {
			Dbms.Core.MessageBus.fireEvent('Dbms.Help.SearchFieldStore.Load', this);
		}, this)
	}
});

Ext.reg('Dbms.Help.SearchFieldStore', Dbms.Help.SearchFieldStore);