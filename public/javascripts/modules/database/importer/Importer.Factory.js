/*
 * defines namespace, just in case
 */
Ext.ns('Dbms.Database.Importer');
/*
 * @namespace Dbms.Database.Importer
 * @class Factory
 * 
 * this class responses for creation new import-windows,
 * or just make active window, if is was already opened
 */
Dbms.Database.Importer.Factory = Ext.extend(function(){},{
	constructor : function() {
		Ext.apply(this, {
			defaults : {
				title    : this.getWindowTitleTemplate()
			}
		});
	},
	/*
	 * @param {String} databaseName
	 */
	getWindow : function(databaseName) {
		var wnd = new Dbms.Database.Importer.BaseImportWindow({
			title : this.defaults.title.apply({
				database : databaseName ? databaseName : "Mysql-Server"
			}),
			database : databaseName
		});
		
		return wnd;
	},
	getWindowTitleTemplate : function() {
		return new Ext.Template('Import into {database}');
	}
});