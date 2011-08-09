Ext.ns('Dbms.Dump.Base');
Dbms.Dump.Base.Controller = Ext.extend(function(){}, {
	/*
	 * renders the window, witch shows us a window, with preferences required to make
	 * dump
	 */
	show : function(config) {
		if(!this.beforeShow(config)) {
			return false;
		};
		
		if(typeof this.windows[this.databaseName] == 'undefined') {
			this.initWindow();
		}
		
		return this.windows[this.databaseName].show();
	},
	initWindow : function() {
		this.window = null;
	},
	beforeShow : function(config) {
		this.databaseName = config.databaseName;
		
		return true;
	}
});