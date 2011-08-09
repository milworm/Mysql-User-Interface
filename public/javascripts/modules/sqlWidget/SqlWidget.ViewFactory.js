Dbms.SqlWidget.ViewFactory = Ext.extend(function(){}, {
    build : function(config) {
		return new Dbms.SqlWidget.View(config);
    }
});