Ext.ns('Dbms.RoutineManagement.BaseManager');
/**
 * @class RoutineManagement.BaseManager.Controller
 * controls all operation linked with module
 * performs creation new Store Grid etc
*/
Dbms.RoutineManagement.BaseManager.Controller = Ext.extend(Ext.util.Observable, {
	constructor : function(config) {
		Ext.apply(this, {
			config 		    : config,
			capitalizedType : Ext.util.Format.capitalize(config.type)
		});
		
		this.initFactories();
		Dbms.RoutineManagement.BaseManager.Controller.superclass.constructor.call(this);
		Dbms.Core.MessageBus.on('Dbms.Database.TreePanel.'+this.capitalizedType+'NodeClick', this.nodeClickEventHandler, this);
	},
	initFactories : function() {
		
	},
	beforeNodeEventHandler : function(obj) {
		obj.uniqueKey = '#'+this.capitalizedType+obj.databaseName+'.'+obj.node.attributes.desc.key;
		return true;
	},
	/**
	 * process situation where table-left-node clicked
	 * @param o {object}  config contains node-witch was clicked
	*/
	nodeClickEventHandler : function(obj){
		if(!this.beforeNodeEventHandler(obj)){
			return ;
		}
		
		this.processNodeClick(obj);
	}
});