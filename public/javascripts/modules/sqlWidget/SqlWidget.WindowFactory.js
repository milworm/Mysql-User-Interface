Dbms.SqlWidget.WindowFactory = Ext.extend(Ext.util.Observable, {
    generateUniqueId : function() {
        return Ext.id();
    },
    build : function(config) {
		return new Dbms.SqlWidget.SqlWindow(config);
    }//,
    //updateContent : function(config){
    //    this.ctr.removeAll(true);
    //    this.ctr.add(config.grid);
    //    this.ctr.doLayout();
    //}
});