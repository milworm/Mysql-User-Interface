Ext.ns('Dbms.ContextMenu');

Dbms.ContextMenu.Database = Ext.extend(Dbms.ContextMenu.Menu, {
	constructor : function(config) {
		Dbms.ContextMenu.Database.superclass.constructor.call(this, Ext.apply({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Alter Database',
				icon : '/images/icons/database_go.png',
				ref  : 'alterBtn'
			},{
				text : 'Create Table',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Drop Database',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropDatabaseBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			},{
				text : 'Import SQL',
				ref  : 'importBtn',
				icon : '/images/icons/database_go.png'//,
				//menu : {
				//	items : [{
				//		text : 'Find and Import',
				//		icon : '/images/icons/database_go.png',
				//		ref  : 'findImportBtn'
				//	}, {
				//		text : 'Upload and Import',
				//		icon : '/images/icons/database_go.png',
				//		ref  : 'uploadImportBtn'
				//	}]
				//}
			}, {
				text : 'Create Stored Routine',
				icon : '/images/icons/table_add.png',
				ref  : 'createRoutineBtn'//,
				//menu : {
				//	items : [{
				//		text : 'Procedure',
				//		icon : '/images/icons/table_add.png',
				//		ref  : 'createProcBtn',
				//		type : 'procedure'
				//	}, {
				//		text : 'Trigger',
				//		icon : '/images/icons/table_add.png',
				//		ref  : 'createTriggerBtn',
				//		type : 'trigger'
				//	}, {
				//		text : 'Function',
				//		icon : '/images/icons/table_add.png',
				//		ref  : "createFuncBtn",
				//		type : 'function'
				//	}]
				//}
			}]
		}, config));
	},
	getParams : function(){
		return {
			refresh : {
				url 	   : Dbms.Actions.database.index,
				baseParams : {
					database_name : this.database
				}
			},
			drop : {
				url		   : Dbms.Actions.database.drop,
				baseParams : {
					db_name    : this.database,
					remove_all : false,
					key 	   : this.database
				}
			}
		}
	},
	attachHandlers : function() {
		this.refreshBtn.on('click', this.reloadTreeStore, this);
		this.createTableBtn.on('click', this.onCreateTableClick, this);
		this.dropDatabaseBtn.on('click', this.onDropDatabaseClick, this);
		this.createDumpBtn.on('click', this.showCreateDumpWindow, this);
		this.alterBtn.on('click', this.onAlterButtonClick, this);
		this.importBtn.on('click', this.onImportClick, this);
		this.createRoutineBtn.on('click', this.onCreateRoutineClick, this);
		//this.routineMenu.menu.createFuncBtn.on('click', this.onCreateRoutineClick, this);
		//this.routineMenu.menu.createTriggerBtn.on('click', this.onCreateRoutineClick, this);
		//this.routineMenu.menu.createProcBtn.on('click', this.onCreateRoutineClick, this);
	},
	onCreateRoutineClick : function(config) {
		Dbms.Core.MessageBus.fireEvent('RoutineManagement.Create.show', {
			database : this.database
		});
	},
	onCreateTableClick : function() {
		alert('Dbms.Tree.ShowCreateTableDialog');
		
		Dbms.Core.MessageBus.fireEvent('Dbms.Tree.ShowCreateTableDialog', {
			database : this.database
		});
	},
	onDropDatabaseClick : function() {
		this.showConfirmDialog();
	},
	showConfirmDialog : function() {
		var noticeText = this.deleteNodeMsg.replace('{itemname}', 'database '+this.database);
		
		Ext.Msg.confirm('Confirm', noticeText, this.onDropConfirm, this);
    },
	onDropSuccess : function(response){
		var jn = Ext.decode(response.responseText, true);
		
		if(jn === false){			    
			Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
			return false;
		}
				
		if(jn.success === true) {
			this.destroyDatabaseNode();
			Dbms.Garbage.Collector.collectFor(this.database);
			Ext.ux.Toast.msg('Success', "Database " + this.database + " was successfully dropped");
		} else {
			Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
				msg : jn.message
			});
		}
		
		return true;
	},
	onDropFailure : function(response){
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
	},
	destroyDatabaseNode : function() {
		this.tree.selectedNode.destroy(false);
	},
	showCreateDumpWindow : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Dump.Database.showWindow', {
			databaseName : this.database
		});
	},
	onAlterButtonClick : function() {
		alert('alter database clicked');
	},
	onImportClick : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Importer.open', {
			database : this.database
		});
	}
});