Dbms.TableStructure.Controller = function(){
	Dbms.Core.MessageBus.on('Dbms.Taskbar.ActiveWindowChange', this.onActiveWindowChanger, this);
	Dbms.Core.MessageBus.on('Dbms.Taskbar.Window.Close', this.setEmptyStore, this);
	Dbms.Core.MessageBus.on('Dbms.Taskbar.Window.beforeMinimize', this.setEmptyStore, this);
	Dbms.Core.MessageBus.on('Dbms.Core.Viewport.east.expand', this.onPanelExpand, this);
}
/**
 * function load new data to store
*/
Dbms.TableStructure.Controller.prototype = {
	onPanelExpand : function() {
		this.onActiveWindowChanger();
	},
	beforeAction : function() {
		if(Dbms.Core.Viewport.east.collapsed) {
			return false;
		}
		
		return true;
	},
	onActiveWindowChanger : function(){
		if(!this.beforeAction()){
			return false;
		}
		
		var activeWindow = Ext.WindowMgr.getActive();
		
		if(activeWindow === null) {
			return false;
		}
		////get info about current active window
		var attrs = activeWindow.attrs;
		//// windows has attrs, so we can reconfigure our store
		if(attrs) {
			this.reRender({
				databaseName : attrs.databaseName,
				type         : attrs.type,
				name         : attrs.itemName
			});
			
			return false;
		}
		
		this.setEmptyStore();
		
		return true;
	},
	reRender : function(config) {
		if(!this.beforeAction()){
			return false;
		}
		
		var store = Ext.StoreMgr.get('Structure.'+config.type+'.'+config.databaseName+'.'+config.name);
		//if store exists
		if(!!store) {
			Dbms.Core.Viewport.east.setTitle(Ext.util.Format.capitalize(config.type) + ' '+ config.name+' information');
			return this.view.reconfigure(store, this.view.colModel);
		}
		
		var baseParams = {
			database_name : config.databaseName,
			name          : config.name
		}
			
		var store = new Dbms.TableStructure.Store({
			baseParams : baseParams,
			url        : Dbms.Actions[config.type.toLowerCase()].structure,
			storeId    : 'Structure.'+config.type+'.'+config.databaseName+'.'+config.name
		});
				
		if(!this.view) {
			this.view = new Dbms.TableStructure.View({
				store : store
			});
			
			Dbms.Core.Viewport.east.add(this.view);
			Dbms.Core.Viewport.east.doLayout();
		}  else {
			this.view.reconfigure(store, this.view.colModel);
		}
		
		this.changeTitle(Ext.util.Format.capitalize(config.type) + ' '+ config.name+' information');
		return true;
	},
	changeTitle : function(title) {
		Dbms.Core.Viewport.east.setTitle(title);
	},
	setEmptyStore : function() {
		if(!this.beforeAction()){
			return false;
		}
		
		if(!this.view){
			return false;
		}
		
		this.view.reconfigure(new Ext.data.Store({
			xtype  : 'store',
			fields : [{
				 name : "COLUMN_NAME"
			}, {
				name : 'COLUMN_TYPE'
			}]
		}), this.view.colModel);
		
		return true;
	}
}