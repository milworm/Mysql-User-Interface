Ext.ns('Dbms.ContextMenu');

Dbms.ContextMenu.Menu = Ext.extend(Ext.menu.Menu, {
	constructor : function(config) {
		Ext.apply(this, config, {
			deleteNodeMsg : 'Are you sure you want to delete {itemname}'
		});
		
		Dbms.ContextMenu.Menu.superclass.constructor.call(this, config);
		
		this.attachHandlers();
		this.on('beforeshow', this.onBeforeShow, this);
	},
	reloadTreeStore : function() {
	    Ext.apply(this.tree.loader, this.getParams().refresh);
		this.tree.loader.load(this.tree.selectedNode);
	},
	getParams : function() {
		return {}
	},
	getDatabaseName : function(node) {
		while(!node.isRoot) {
			if(node.attributes.desc.type == 'database'){
				return node.attributes.desc.key
			}
			
			node = node.parentNode;
		}
		
		return '';
	},
	onBeforeShow : function() {
		if(!this.tree.selectedNode.isRoot){
			this.database = this.getDatabaseName(this.tree.selectedNode);
		}
	},
	deleteNode : function() {
		
	},
	onDropFailure : function() {
		return null;
	},
	onDropSuccess : function() {
		return null;
	},
	onDropConfirm : function(result) {
		if(result != 'yes') {
			return false;
		}
		
		var params = this.getParams().drop;
		Ext.Ajax.request({
			url     : params.url,
			method  : 'post',
			params  : params.baseParams,
			success : this.onDropSuccess,
			failure : this.onDropFailure,
			scope   : this
		});
		
		return true;
	},
});