Ext.ns('Dbms.ContextMenu');

Dbms.ContextMenu.TriggerRoot = Ext.extend(Dbms.ContextMenu.Menu, {
	constructor : function(config) {
		Dbms.ContextMenu.TriggerRoot.superclass.constructor.call(this, Ext.apply({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Trigger',
				icon : '/images/icons/table_add.png',
				ref  : 'createTriggerBtn'
			},{
				text : 'Drop All Triggers',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropTriggerBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		}, config));
	},
	getParams : function(){
		return {
			refresh : {
				url 	   : Dbms.Actions.trigger.index,
				baseParams : {
					database_name : this.database
				}
			},
			drop : {
				url		   : Dbms.Actions.trigger.drop,
				baseParams : {
					db_name    : this.database,
					remove_all : true
				}
			}
		}
	},
	attachHandlers : function() {
		this.refreshBtn.on('click', this.reloadTreeStore, this);
		this.dropTriggerBtn.on('click', this.onDropTablesClick, this);
		this.createTriggerBtn.on('click', this.createTrigger, this);
		//this.createDumpBtn.on('click', this.createDump, this);
	},
	onDropTablesClick : function() {
		this.showConfirmDialog();
	},
	showConfirmDialog : function() {
		var noticeText = this.deleteNodeMsg.replace('{itemname}', ' all triggers from '+this.database);
		Ext.Msg.confirm('Confirm', noticeText, this.onDropConfirm, this);
    },
	onDropSuccess : function(response) {
		var jn = Ext.decode(response.responseText, true);
		
		if(jn === false) {			    
			Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
			return false;
		}
				
		if(jn.success === true) {
			this.destroyNodes();
		} else {
			Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
				msg : jn.message
			});
		}
				    
		return true;
	},
	onDropFailure : function(response) {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
	},
	destroyNodes : function() {
		this.tree.selectedNode.setText('Triggers (0)');
		this.tree.selectedNode.eachChild(function(node){
			node.destroy();
		});
	},
	createTrigger : function() {
		Dbms.Core.MessageBus.fireEvent('RoutineManagement.Create.show', {
			database : this.database,
			select   : 'trigger'
		});
	}
});