Dbms.TableStructure.Store = Ext.extend(Ext.data.JsonStore,{
	constructor : function(c) {
		Dbms.TableStructure.Store.superclass.constructor.call(this, {
			fields : [{
				 name : "COLUMN_NAME",
				 type : 'string'
			}, {
				name : 'COLUMN_TYPE',
				type : 'string'
			}],
			proxy : new Ext.data.HttpProxy({
				url    : c.url,
				method : 'POST'
			}),
			root          : "desc",
			remoteSort 	  : false,
			autoLoad   	  : true,
			baseParams    : c.baseParams,
			storeId	 	  : c.storeId
		});
	}
})