/**
 * @class Import.BaseImporter
 * controller responses for showing import-window
 * or creation new
 */
Ext.ns('Dbms.Database.Importer');

Dbms.Database.Importer.BaseImporter = Ext.extend(Ext.util.MixedCollection, {
    constructor : function() {
        Dbms.Database.Importer.BaseImporter.superclass.constructor.call(this);		
		Dbms.Core.MessageBus.on('Dbms.Database.Importer.open', this.open, this);
    },
	/*
	 * function performs showing the window with tree and form,
	 * to show directory structure
	 * @returns {undefined}
	 */
	open : function(config) {
		var databaseName = config.database;
		var wnd = this.get(databaseName);
		
		wnd ? wnd.show()
			: this.add(databaseName, Dbms.Database.Importer.Factory.getWindow(databaseName)).show();
	}
});