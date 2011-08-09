Ext.ns('Dbms.Help');
/**
 * @class PanelBuilder
 *
 * create new panel for Help.TabPanel
*/
Dbms.Help.PanelBuilder = function(){
		Ext.apply(this,{
			storeBuilder : new Dbms.Help.StoreBuilder,
			gridBuilder  : new Dbms.Help.GridBuilder
		});
		
		Dbms.Core.MessageBus.on('Dbms.Help.NodeClick', this.createPanel, this);
}
Dbms.Help.PanelBuilder.prototype = {
	/**
	 * creates new panel
	 * and attach it to tab panel
	*/
	createPanel : function(o){
		this.categoryId = o.categoryId;
		this.categoryName = o.categoryName;
	
		this.store = this.storeBuilder.build(this.categoryId, this.categoryName);
		this.grid  = this.gridBuilder.build({
			store : this.store
		});
		
		this.buildPanel();
		this.attachPanel();
	},
	buildPanel : function(){
		this.panel = new Ext.Panel({
			title      : this.categoryName,
			categoryId : this.categoryId,
			closable   : true,
			layout     : 'fit',
			items      : this.grid
		});
	},
	attachPanel : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.Help.AttachPanel', this.panel);
	}
};