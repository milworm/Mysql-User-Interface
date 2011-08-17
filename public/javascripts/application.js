// overrides go here
Ext.decode = function(json, safe) {
	if(safe) {
		try {
		    result = Ext.decode(json);
		} catch(e) {
		    return false;
		}
		
		return result;
	} else {
		return Ext.util.JSON.decode(json);
	}
}

Ext.onReady(function(){
	Ext.QuickTips.init();
	Ext.override(Ext.data.JsonStore,{
		multiSort: function(sorters, direction) {
			this.hasMultiSort = true;
			direction = direction || "ASC";

			if (this.multiSortInfo && direction == this.multiSortInfo.direction) {
				direction = direction.toggle("ASC", "DESC");
			}
   
			this.multiSortInfo = {
				sorters  : sorters,
				direction: direction
			};
		   
			if (this.remoteSort) {
				var sortStr = '';
				for(var i=0;i<sorters.length;i++) {
					sortStr += '`'+sorters[i].field+'` '+sorters[i].direction;
					sortStr += i == sorters.length-1 ? ' ' : ',';
				}
				
				this.baseParams.sortOrder = sortStr;
				this.load();
			} else {
				this.applySort();
				this.fireEvent('datachanged', this);
			}
		}
	});
	
    for(var i=0; i<Dbms.Config.Classes.length; i++) {
		try{
			eval(Dbms.Config.Classes[i]+'= new '+Dbms.Config.Classes[i]);
		} catch (e) {
			console.log('Eval Error::'+Dbms.Config.Classes[i] + ' DESC::' + e.toString());
		}
    }
	
	Dbms.Core.MessageBus.on('Dbms.AjaxError', function(o){
		o = o || {}
		o.msg = o.msg || Dbms.Constants.AJAX_COMUNICATION_ERROR;
		Ext.ux.Toast.msg('Error', o.msg);
	},this);
});