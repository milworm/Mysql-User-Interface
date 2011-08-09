Ext.ns('Dbms.Help');

Dbms.Help.TreePanel = Ext.extend(Ext.tree.TreePanel,{
	constructor : function(){
		Dbms.Help.TreePanel.superclass.constructor.call(this, {
			root : new Ext.tree.AsyncTreeNode({
				text 	 : 'Topics',
				expanded : true,
				loaded   : true,
				icon     : '/images/icons/server.png'
			}),
			loader : new Dbms.Help.TreeLoader
		});
		this.loader.load(this.getRootNode());
		this.on('click', this.nodeClickEventHandler, this);
	},
	/**
	 * fires event for creation new panel unless exists
	 * else set panel as active
	 *
	 * @param node {object}, node that was selected
	*/
	nodeClickEventHandler : function(node){
		// user clicks on root node so return
		if(!node.leaf){
			return;
		}
		
		var categoryName = node.text;
		//if(Ext.StoreMgr.get('Help.'+node.attributes.categoryId)){
		//	// store is already exsits
		//	Dbms.Core.MessageBus.fireEvent('Dbms.Help.SetActiveTab', node.attributes.categoryId);
		//	return;
		//} 
		// fire event to create new panel
		Dbms.Core.MessageBus.fireEvent('Dbms.Help.NodeClick', {
			categoryId   : node.attributes.categoryId,
			categoryName : categoryName
		});
	}
});

Ext.reg('Dbms.Help.TreePanel',Dbms.Help.TreePanel);