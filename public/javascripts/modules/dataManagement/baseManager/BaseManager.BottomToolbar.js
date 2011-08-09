/*
 * Contains common logic for BottomToolvar in any
 * window that shows table or view data.
 *
 */
Dbms.DataManagement.BaseManager.BottomToolbar = Ext.extend(Ext.Toolbar, {
	constructor : function(config) {
		this.store = config.store;
		Dbms.DataManagement.BaseManager.BottomToolbar.superclass.constructor.call(this, {
			height : 30,
			items  : [{
				xtype 	    : 'paging',
				ref   	    : 'pagination',
				store 	    : this.store,
				displayInfo : true,
				pageSize    : Dbms.Constants.DEFAULT_PAGE_SIZE
			},{
				xtype : 'tbfill'
			},{
				xtype   : "button",
				text    : "Clear filters",
				handler : this.sendClearFilterMessage,
				scope   : this
			},{
				ref   		 : 'executedTime',
				xtype 	     : "button",
				enableToggle : false
			}]
		});
		
		this.on('afterrender', this.attachListeners, this);
	},
	attachListeners : function() {
		var uniqueKey = this.ownerCt.uniqueKey;
		Dbms.Core.MessageBus.addListener('Dbms.TableMgr.ChangePageSize'+uniqueKey, this.changePageSize, this);
	},
	changePageSize : function() {
		this.pagination.pageSize = Dbms.Constants.DEFAULT_PAGE_SIZE;
		this.pagination.moveFirst();
	},
	sendClearFilterMessage : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.DataManagement.ClearFilters'+this.ownerCt.uniqueKey);
	}
});