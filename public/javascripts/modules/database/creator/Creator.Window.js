Ext.ns('Dbms.Database.Creator');
Dbms.Database.Creator.Window = Ext.extend(Dbms.Taskbar.Window, {
	constructor : function() {
		Dbms.Database.Creator.Window.superclass.constructor.call(this, {
			layout   	: 'fit',
			maximizable : false,
			title    	: 'Create Database',
			width    	: 350,
			height  	: 150,
			items       : {
				padding  : 10,
				defaults : {
					anchor   : '-20'
				},
				xtype   : 'form',
				ref     : 'form',
				items   : [{
					xtype 	   : 'textfield',
					name  	   : 'databaseName',
					fieldLabel : 'Database Name',
					ref        : './databaseName',
					allowBlank : false
				}, {
					xtype 	      : 'combo',
					name  	      : 'characterSet',
					fieldLabel    : 'Character Set',
					triggerAction : 'all',
					allowBlank    : false,
					displayField  : 'name',
					value         : 'utf8',
					mode          : 'local',
					valueField    : 'name',
					ref           : './characterSet',
					tpl           : '<tpl for=".">'+
										'<div class="x-combo-list-item" ext:qtip="{description}">'+
											'<div>{name}</div>'+
											'<div>Collation: {collation}</div>'+
											'<div>Desciption: {description}</div>'+
										'</div>'+
									'</tpl>',
					store          : Dbms.Database.Creator.CharacterSetStore,
					forceSelection : true,
					validator    : function(val) {
						return this.store.query(this.valueField, val).getCount() !== 0;
					}
				}]
			},
			buttons : [{
				text : 'Create',
				ref  : './createBtn'
			}, {
				text : "Cancel",
				ref  : './cancelBtn'
			}]
		});
		
		this.createBtn.on('click', this.onCreateClick, this);
		this.cancelBtn.on('click', this.onCancelClick, this);
		this.form.getForm().clearInvalid();
	},
	onBeforeCreateClick : function() {
		if(!this.form.getForm().isValid()){
			return false;
		}
		
		return true;
	},
	onCreateClick : function() {
		if(!this.onBeforeCreateClick()){
			return ;
		}
		
		Ext.Ajax.request({
			params  : {
				db_name  : this.databaseName.getValue(),
				char_set : this.characterSet.getValue()
			},
			scope   : this,
			url     : Dbms.Actions.database.create,
			success : this.onSuccessCb,
			failure : this.onFailureCb
	    });
		
		this.hide();
	},
	onFailureCb : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Creator.Failure');
	},
	onSuccessCb : function(result) {
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Creator.Success',result);
	},
	onCancelClick : function() {
		this.hide();
	},
	hide : function() {
		this.superclass().hide.call(this);
		
		this.form.getForm().reset();
		//this.characterSet.reset();
	}
});