Ext.ns('Dbms.Help');

Dbms.Help.StoreBuilder = function(){};
Dbms.Help.StoreBuilder.prototype = {
	build : function(categoryId, categoryName){
		this.storeCfg = {};
		
		Ext.apply(this.storeCfg, {
			storeId : 'Help.'+categoryId,
			root    : 'rows',
			proxy   : new Ext.data.HttpProxy({
				url    : Dbms.Actions.help.content,
				method : 'post'
			}),
			baseParams :  {
				category_id : categoryId
			},	
			fields : ['name', 'description', 'example'],
			autoLoad : true
		});
		
		return new Ext.data.JsonStore(this.storeCfg);
	}
}