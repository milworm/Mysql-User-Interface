Dbms.RoutineManagement.RoutineTypeCombo = Ext.extend(Ext.form.ComboBox, {
	constructor : function(config) {
		Dbms.RoutineManagement.RoutineTypeCombo.superclass.constructor.call(this, Ext.applyIf({
			store 		   : Ext.StoreMgr.get('routineType'),
			displayField   : 'type',
			fieldLabel     : 'Routine type',
			emptyText      : 'Choose the routine type',
			valueField     : 'id',
			forceSelection : true,
			triggerAction  : 'all',
			editable	   : false,
			mode           : 'local',
			triggerPanelState : false
		}, config));
		
		this.on('select', this.onValueChaged, this);
	},
	onValueChaged : function() {
		var value = this.getValue();
		Dbms.Core.MessageBus.fireEvent('RoutineManagement.Create.'+value+'TypeSelected#' + this.uniqueId, value);
	}
});

Ext.reg('RoutineTypeCombo', Dbms.RoutineManagement.RoutineTypeCombo);