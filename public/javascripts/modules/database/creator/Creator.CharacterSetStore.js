Dbms.Database.Creator.CharacterSetStore = Ext.extend(Ext.data.JsonStore, {
	constructor : function() {
		Dbms.Database.Creator.CharacterSetStore.superclass.constructor.call(this, {
			fields   : ['name','collation','description','maxlen'],
			proxy    : new Ext.data.HttpProxy({
				url    : Dbms.Actions.database.charlist,
				method : 'POST'
			}),
			root : 'items'
		});
	}
})