Dbms.SqlWidget.GridPanelFactory = Ext.extend(function(){}, {
	getGridPanel : function(config) {
		var grid = {
			html : "No data to diplay"
		};
		
		if(config.json.rows.length > 0) {
			grid = new Dbms.SqlWidget.GridPanel(config);
            Dbms.Core.MessageBus.fireEvent('Dbms.SqlWidget.UpdateWindowContent_'+config.uniqueId, {
                grid : grid
            });
			
			return grid;
        }
		
        Dbms.Core.MessageBus.fireEvent('Dbms.SqlWidget.UpdateWindowContent_'+config.uniqueId, {
            grid : {
				html : "No data to diplay"
			}
        });
			
		return grid;
	}
});