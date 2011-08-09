Dbms.Garbage.Collector = Ext.extend(Ext.util.Observable, {
	constructor : function(){
		Dbms.Garbage.Collector.superclass.constructor.call(this);
		Dbms.Core.MessageBus.on('Dbms.Garbage.Collector.collect', this.collect, this);
	},
	collect : function(config) {
		this.config = config;
		
		this.closeWindows();
		this.cleanStores();
		this.cleanStructurePanel();
	},
	closeWindows : function() {
		Ext.WindowMgr.each(function(wnd) {
			for(var i=0;i<this.config.deleted.length; i++){
				if(wnd.attrs &&
				   wnd.attrs.type == this.config.type &&
				   wnd.attrs.databaseName == this.config.databaseName && 
				   wnd.attrs.itemName == this.config.deleted[i]) {
						wnd.close();
						wnd.button.destroy();
				}
			}
		},this)
	},
	cleanStores : function(){
		Ext.StoreMgr.each(function(st) {
			for(var i=0;i<config.deleted.length; i++) {
				if(st.storeId == '#'+Ext.util.Format.capitalize(this.config.type)+this.config.databaseName+'.'+this.config.deleted[i]){
					st.destroy();
				}
			}
		},this);
	},
	cleanStructurePanel : function(){
		
	},
	collectFor : function(databaseName) {
		Ext.WindowMgr.each(function(wnd){
			if(wnd.attrs && wnd.attrs.databaseName && wnd.attrs.databaseName == databaseName){
				wnd.close();
				wnd.destroy();
			}
		},this);
		
		Ext.StoreMgr.each(function(store){
			if(store.baseParams.database_name && store.baseParams.database_name == databaseName){
				store.removeAll();
				store.destroy();
			}
		},this);
		
		Dbms.TableStructure.Controller.changeTitle("System Information");
	}
});