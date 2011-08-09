Ext.ns('Dbms.RoutineManagement');

Dbms.RoutineManagement.BaseManager.View = Ext.extend(Ext.Panel, {
	/**
	 * @param o {object}, decoded server-response
	*/
	constructor : function(config) {
		Dbms.RoutineManagement.BaseManager.View.superclass.constructor.call(this, Ext.applyIf({
			layout : 'fit',
			ref    : 'view',
			bbar   : {
				xtype : 'toolbar',
				items : ['->',{
					text : 'Debug'
				}, {
					text : 'Save',
					ref  : 'saveBtn'
				}, {
					text     : 'switch theme',
					disabled : true
				}]
			},
			listeners : {
				afterrender : this.onAfterRender,
				scope       : this
			}
		}, config));
		
		Dbms.Core.MessageBus.on('Dbms.RoutineStore.load'+config.uniqueKey, this.updateView, this);
	},
	onAfterRender : function() {
		this.getBottomToolbar().saveBtn.on('click', this.onSaveButtonClick, this);
	},
	updateView : function(store) {
		var sourceCode = store.getAt(0).get(store.idProperty);
		var databaseName = store.baseParams.database_name;
		
		this.autocomplete = new Dbms.Autocomplete.Controller(this.body.id, databaseName, sourceCode);
	},
	onSaveButtonClick : function() {
		var sourceCode = this.body.getAttribute('innerText');
		this.save(sourceCode);
	},
	save : function(sourceCode) {
		Ext.Ajax.request({
			url    : this.url,
			params : {
				source_code : sourceCode
			},
			success : this.onSaveSuccess,
			failure : this.onAjaxFailure,
			scope   : this
		})
	},
	onSaveSuccess : function(response) {
		var result = Ext.decode(response.responseText, true);
		
		if(result == null) {
			this.onAjaxFailure();
			return ;
		}
		
		result.success
			? Ext.ux.Toast.msg('Success', 'SQL-query was successfully performed')
			: Ext.ux.Toast.msg('Failure', result.msg);
	},
	onAjaxFailure : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
	}
});