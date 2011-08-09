Dbms.DataManagement.BaseManager.WindowController = function(){
}

Dbms.DataManagement.BaseManager.WindowController.prototype = {
	init : function(conf) {
		
	},
	/**
	 * @param o {object}, decoded server-response
	*/
	buildWindow : function(){
		var sqlQueryUnqiueId = Ext.id();
		
		this.wnd = new Dbms.Taskbar.Window({
			uniqueKey : this.uniqueKey,
			title     : this.title,
			layout    : 'fit',
			tools     : [{
				id 		: 'gear',
				handler : function(e){
					alert('Hm... :)');
				}
			}],
			items     : [{
				xtype  : 'container',
				layout : 'border',
				items  : [{
					region : 'center',
					xtype  : "container",
					layout : 'fit',
					items  : [this.view]
				}]
			}],
			tbar 	    : this.getTopToolbar(),
			bbar 	    : this.getBottomToolbar(),
			height      : 550,
			width       : 800,
			maximizable : true,
			minimizable : true,
			maximized   : true,
			constrain   : true,
			renderTo    : Dbms.Core.Viewport.center.getEl(),
			scope       : this,
			attrs       : this.attrs,
			listeners   : {
				'afterlayout' : this.resetSortFilters,
				scope         : this.wnd
			}
		});
		
		this.wnd.show();
	},
	resetSortFilters : function(){
		var grid = this.items.items[0].gridPanel;
		
		var toolbar = grid.getTopToolbar();
		
		for(var i=0;i<toolbar.items.items.length;i++){
			var button = toolbar.items.items[i];
			toolbar.plugins[0].onMovedLeft(button, i, i);
		}
	},
	/*
	 * @private
	 * should be implemented in child-class
	 * @returns {Object} contains field with BottomToolbar-xtype
	 */
	getBottomToolbar : function() {
		throw "Dbms.DataManagement.BaseManager.getBottomToolbar must be implemented in child-class";
	},
	/*
	 * @private
	 * should be implemented in child-class
	 * @returns {Object} contains field with TopToolbar-xtype
	 */
	getTopToolbar : function(){
		throw "Dbms.DataManagement.BaseManager.getTopToolbar must be implemented in child-class";
	}
}