Ext.ns('Dbms.ContextMenu');

Dbms.ContextMenu.Root = Ext.extend(Dbms.ContextMenu.Menu, {
	constructor : function(config) {
		Dbms.ContextMenu.Root.superclass.constructor.call(this, Ext.apply({
			items : [{
				text : 'Refresh All',
				ref  : 'refreshBtn',
				icon : '/images/icons/database_refresh.png'
			},{
				text : 'Create new database',
				ref  : 'createDatabaseBtn',
				icon : '/images/icons/database_add.png'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/server_go.png'
			}, {
				text : 'Import SQL',
				ref  : 'importBtn',
				icon : '/images/icons/server_go.png'
			}, {
				text : 'Delete all databases',
				ref  : 'deleteAllBtn',
				icon : '/images/icons/database_delete.png'
			}]
		}, config));
		
		Dbms.Core.MessageBus.on('Dbms.Database.CreateDatabase', this.onCreateDatabasePromptCallback, this);
		Dbms.Core.MessageBus.on('Dbms.Database.Creator.Success', this.onCreationSuccess, this);
		Dbms.Core.MessageBus.on('Dbms.Database.Creator.Failure', this.onCreationFailure, this);
	},
	getParams : function(){
		return {
			refresh : {
				url 	   : Dbms.Actions.database.index,
				baseParams : {}
			},
			create : {
				url        : Dbms.Actions.database.create,
				baseParams : {}
			},
			drop : {
				url 	   : Dbms.Actions.database.drop,
				baseParams : {
					all : true
				}
			}
		}
	},
	attachHandlers : function() {
		this.refreshBtn.on('click', this.reloadTreeStore, this);
		this.createDatabaseBtn.on('click', this.showPrompt, this);
		this.createDumpBtn.on('click', this.createDump, this);
		this.importBtn.on('click', this.onImportClick, this);
		this.deleteAllBtn.on('click', this.onDeleteAllBtnClick, this);
	},
	reloadTreeStore : function() {
	    Ext.apply(this.tree.loader, this.getParams().refresh);
		this.tree.loader.load(this.tree.selectedNode);
	},
	showPrompt : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Tree.Database.Creator.Window.open');
	},
	createDump : function() {
		
	},
	onCreationFailure : function() {
		delete this.tree.loader.newDatabaseName;
		Dbms.Core.MessageBus.fireEvent('AjaxError');
	},
	onCreationSuccess : function(result) {
		var jn = Ext.decode(result.responseText, true);
					
		if(jn === false){
			return this.onCreateDatabaseFailureCb();
		}
					
		switch(jn.success){
			case true  : {
				this.tree.loader.newDatabaseName = jn.database_name;
				this.tree.loader.load(this.tree.selectedNode);
				Ext.ux.Toast.msg('Success', "Database " + jn.database_name + " was successfully created");
				break;
			}
			
			case false : {
				delete this.tree.loader.newDatabaseName;
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError', {
					msg : jn.message
				});
				break;
			}
		}
					
		return true;
	},
	onDeleteAllBtnClick : function() {
		Ext.Msg.confirm("Confirm", "Are you shure you want to remove all databases", this.onDropConfirm, this);
	},
	onImportClick : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Importer.open', {
			database : false
		});
	}
});