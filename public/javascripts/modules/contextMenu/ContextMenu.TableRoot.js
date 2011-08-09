Ext.ns('Dbms.ContextMenu');

Dbms.ContextMenu.TableRoot = Ext.extend(Dbms.ContextMenu.Menu, {
	constructor : function(config) {
		Dbms.ContextMenu.TableRoot.superclass.constructor.call(this, Ext.apply({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/table_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Delete All Tables',
				icon : '/images/icons/table_add.png',
				ref  : 'deleteTableBtn'
			},{
				text : 'Create New Table',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/table_go.png'
			}]
		}, config));
	},
	getParams : function(){
		return {
			refresh : {
				url 	   : Dbms.Actions.table.index,
				baseParams : {
					database_name : this.database
				}
			},
			drop : {
				url		   : Dbms.Actions.table.drop,
				baseParams : {
					db_name    : this.database,
					remove_all : true
				}
			}
		}
	},
	attachHandlers : function() {
		this.refreshBtn.on('click', this.reloadTreeStore, this);
		this.deleteTableBtn.on('click', this.onDropTablesClick, this);
		this.createDumpBtn.on('click', this.createDump, this);
	},
	onDropTablesClick : function() {
		this.showConfirmDialog();
	},
	showConfirmDialog : function() {
		var noticeText = this.deleteNodeMsg.replace('{itemname}', ' all tables from '+this.database);
		
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
	onDropFailure : function(response){
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
	},
	destroyNodes : function() {
		this.tree.selectedNode.setText('Tables (0)');
		this.tree.selectedNode.eachChild(function(node){
			node.destroy();
		});
	}
});