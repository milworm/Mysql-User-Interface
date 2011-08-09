Dbms.SqlWidget.Factory = Ext.extend(function(){}, {
   constructor : function() {
      this.viewBuilder = new Dbms.SqlWidget.ViewFactory();
      this.windowBuilder = new Dbms.SqlWidget.WindowFactory();
      this.storeBuilder = new Dbms.SqlWidget.StoreFactory();
	  this.gridPanelBuilder = new Dbms.SqlWidget.GridPanelFactory();
   },
   beforeFactory : function(config) {
      //Dbms.Core.Viewport.east.collapse(true);
      return true;
   },
   factory : function(config) {
      if(!this.beforeFactory(config)) {
		 return false;
	  }
	  
      var view = this.viewBuilder.build(config); // create panel
      var wnd = this.windowBuilder.build({
         uniqueId : config.uniqueId,
         dbName   : config.dbName,
         view     : view
      }); // create window
	  
	  return wnd;
   }
});