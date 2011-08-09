Dbms.RoutineManagement.BaseManager.WindowFactory = Ext.extend(function(){}, {
	/**
	 * @param o {object}, decoded server-response
	*/
	getWindow : function(config) {
		var result = {
			exists : false
		};
		
		var wnd = this.findWindow(config.uniqueKey);
		
		if(wnd) {
			result.exists = true;
			result.wnd = wnd;
			return result;
		}
		
		result.wnd = this.createWindow(config);
		return result;
	},
	findWindow : function(uniqueKey) {
		return Ext.WindowMgr.getBy(function(w) {
			if(!!w.uniqueKey && w.uniqueKey == uniqueKey) {
				return true;
			}
			return false;
		})[0];
	}
});