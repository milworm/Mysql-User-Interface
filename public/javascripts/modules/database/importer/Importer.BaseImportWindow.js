Ext.ns('Dbms.Database.Importer');

Dbms.Database.Importer.BaseImportWindow = Ext.extend(Dbms.Taskbar.Window, {
	constructor  : function(config) {
		var id = Ext.id();
		Dbms.Database.Importer.BaseImportWindow.superclass.constructor.call(this, Ext.applyIf({
			idf         : id,
			width  		: 1000,
			minimizable : true,
			maximizable : true,
			height 		: 800,
			layout 		: 'border',
			items  : [{
				idf      : id,
				database : config.database,
				xtype    : 'database.import.tree'
			}, {
				idf	     : id,
				database : config.database,
				xtype    : 'database.import.view'
			}]
		}, config));
	}
});