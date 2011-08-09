Dbms.RoutineManagement.Creator.Window = Ext.extend(Dbms.Taskbar.Window, {
	constructor : function(config) {
		Dbms.RoutineManagement.Creator.Window.superclass.constructor.call(this, Ext.applyIf({
			title  		: 'Create Routine ' + Ext.id(),
			layout      : "fit",
			width  		: 400,
			height   	: 300,
			maximizable : false,
			items  	    : [{
				defaults : {
					anchor     : '-20'
				},
				padding    : 10,
				xtype      : 'form',
				labelWidth : 130,
				ref        : 'formPanel',
				items      : [{
					xtype 	   : 'textfield',
					fieldLabel : 'Routine name',
					allowBlank : false,
					ref        : 'nameField',
					name  	   : 'name'
				},{
					xtype  		 : 'RoutineTypeCombo',
					defaultValue : 'Choose the routine type',
					name         : 'type',
					ref          : 'routineTypeCombo',
					allowBlank   : false,
					uniqueId     : config.uniqueId
				}]
			}],
			buttons : [{
				text    : "Create",
				handler : this.onCreateBtnClick,
				scope   : this
			}, {
				text    : 'Close',
				handler : function(){
					this.hide();
				},
				scope   : this
			}],
			listeners : {
				show : function() {
					this.formPanel.form.reset();
					this.formPanel.nameField.focus('',100);
					this.beforeAction();
				}
			}
		}, config));
		
		Dbms.Core.MessageBus.on('RoutineManagement.Create.triggerTypeSelected#' + this.uniqueId, this.triggerTypeSelected, this);
		Dbms.Core.MessageBus.on('RoutineManagement.Create.procedureTypeSelected#' + this.uniqueId, this.procedureTypeSelected, this);
		Dbms.Core.MessageBus.on('RoutineManagement.Create.funcTypeSelected#' + this.uniqueId, this.functionTypeSelected, this);
		this.initTemplates();
	},
	initTemplates    : function() {
		this.triggerTpl = new Ext.Template(
			'CREATE TRIGGER `{database}`.`{name}` {triggerEventTime} {triggerEventName} ON `{table}`'+
			'\nFOR EACH ROW BEGIN'+
			'\n'+
			'\nEND;'
		);
		
		this.functionTpl = new Ext.Template(
			'CREATE FUNCTION `{database}`.`{name}`()'+
			'\nRETURNS {returnValue} DETERMINISTIC' +
			'\nBEGIN'+
			'\n\tRETURN 0;'+
			'\nEND;'
		);
		
		this.procedureTpl = new Ext.Template(
			'CREATE PROCEDURE `{database}`.`{name}`()'+
			'\nBEGIN'+
			'\n'+
			'\nEND;'
		);
	},
	onCreateBtnClick : function() {
		var form = this.formPanel.form;
		
		if(form.isValid()) {
			this.saveRoutine(form.getFieldValues());
		}
	},
	formRoutineSourceCode : function(params) {
		return this['create' + Ext.util.Format.capitalize(params.type)](params);
	},
	createFunc : function(params) {
		return this.functionTpl.apply(params);
	},
	createTrigger : function(params) {
		return this.triggerTpl.apply(params);
	},
	createProcedure : function(params) {
		return this.procedureTpl.apply(params);
	},
	saveRoutine : function(values) {
		values.database = this.database;
		var sql = this.formRoutineSourceCode(values);
		
		Ext.Ajax.request({
			url     : Dbms.Actions.sql.execute + this.database,
			params  : {
				query : sql
			},
			success : this.onSaveSuccess(values),
			failure : this.onSaveFailure,
			scope   : this
		});
	},
	onSaveSuccess      : function(values) {
		return function(response) {
			var result = Ext.decode(response.responseText, true);
			
			if(result == null) {
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
				return ;
			}
			
			if(result.success) {
				Ext.ux.Toast.msg('Success', 'Routine was successfully created');
				Dbms.Core.MessageBus.fireEvent('Dbms.Database.TreePanel.'+Ext.util.Format.capitalize(values.type)+'NodeClick', {
					databaseName : this.database,
					node         : {
						attributes : {
							desc : {
								key : values.name
							}
						}
					}
				});
			} else {
				Ext.ux.Toast.msg('Error', result.msg);
			}
		
			this.hide();
		}
	},
	beforeAction : function() {
		this.hideTriggerAdditionalPanel();
		this.hideFunctionAdditionalPanel();
		this.hideProcedureAdditionalPanel();
	},
	showFunctionAdditionalPanel : function() {
		this.formPanel.add({
			xtype      : 'textfield',
			fieldLabel : 'Return Value',
			name       : 'returnValue',
			ref        : 'functionReturnValRef'
		});
		
		this.formPanel.doLayout();
	},
	functionTypeSelected : function(value) {
		this.beforeAction();
		
		this.showFunctionAdditionalPanel();
	},
	procedureTypeSelected : function(value) {
		this.beforeAction();
		
		//this.formPanel.add([{
		//	xtype 	   : "textfield",
		//	fieldLabel : 'IN params',
		//	name  	   : 'inParams',
		//	ref        : 'procInParams'
		//}, {
		//	xtype 	   : 'textfield',
		//	fieldLabel : 'OUT params',
		//	name  	   : 'outParams',
		//	ref        : 'procOutParams'
		//}]);
		
		this.formPanel.doLayout();
	},
	triggerTypeSelect   : function() {
		this.formPanel.routineTypeCombo.setValue('trigger');
		this.triggerTypeSelected();
	},
	triggerTypeSelected : function() {
		this.beforeAction();
		
		this.showTriggerAdditionalPanel();
	},
	showTriggerAdditionalPanel : function() {
		this.formPanel.add([{
				xtype 		  : "combo",
				fieldLabel    : 'Trigger Event Name',
				name  		  : 'triggerEventName',
				ref           : 'triggerEventNameRef',
				mode  		  : 'local',
				triggerAction : 'all',
				allowBlank    : false,
				store 		  : ['INSERT', 'DELETE', 'UPDATE']
			}, {
				fieldLabel    : 'Trigger Event Time',
				ref           : 'triggerEventTimeRef',
				allowBlank    : false,
				xtype 	  	  : "combo",
				triggerAction : 'all',
				name  		  : 'triggerEventTime',
				mode  		  : 'local',
				store 		  : ['BEFORE', 'AFTER']
			}, {
				fieldLabel    : 'Table Name',
				ref           : 'triggerTableNameRef',
				typeAhead     : true,
				allowBlank    : false,
				xtype 	  	  : "combo",
				triggerAction : 'all',
				name  		  : 'table',
				mode  		  : 'local',
				store 		  : this.getTableNameList()
			}]);
		
		this.formPanel.doLayout();
	},
	hideTriggerAdditionalPanel : function() {
		var formPanel = this.formPanel;
			formPanel.remove(formPanel.triggerEventTimeRef);
			formPanel.remove(formPanel.triggerTableNameRef);
			formPanel.remove(formPanel.triggerEventNameRef);
	},
	hideProcedureAdditionalPanel : function() {
		var formPanel = this.formPanel;
		
		//formPanel.remove(formPanel.procInParams);
		//formPanel.remove(formPanel.procOutParams);
	},
	hideFunctionAdditionalPanel : function() {
		this.formPanel.remove(this.formPanel.functionReturnValRef);
	},
	getTableNameList : function() {
		var databaseTree = Dbms.Core.Viewport.west.databaseList;
		var tables = [];
		
		databaseTree.root.cascade(function(node) {
			if(node.attributes.desc) {
				if(node.attributes.desc.type == 'table' && node.attributes.desc.databaseName == this.database) {
					tables.push(node.attributes.desc.key);
				}
			}
		}, this);
		
		return tables;
	}
});