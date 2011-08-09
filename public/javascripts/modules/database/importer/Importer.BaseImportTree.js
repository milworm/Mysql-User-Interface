Ext.ns('Dbms.Database.Importer');

Dbms.Database.Importer.BaseImportTree = Ext.extend(Ext.tree.TreePanel, {
	constructor : function(config) {
		Dbms.Database.Importer.BaseImportTree.superclass.constructor.call(this,Ext.applyIf({
			loader   : new Dbms.Database.Importer.TreeLoader(),
			animate  : true,
			tbar     : this.getTopToolbar(),
			ref      : 'tree',
			idf      : config.idf,
			border   : false,
			region   : 'west',
			split    : true,
			width    : 300,
			autoScroll: true,
			useArrows: true,
			root     : this.createRootNode()
		}, config));
		
		this.on('beforeclick', this.onNodeBeforeClick, this);
		this.on('contextmenu', this.onNodeConextMenuClick, this);
		this.initContextMenu();
		this.root.reload();
	},
	getTopToolbar : function() {
		return {
			xtype : "toolbar",
			items : ['->', {
				xtype   : 'button',
				icon    : '/images/icons/database_refresh.png',
				text    : 'Refresh',
				handler : this.onTreeRefresh,
				scope   : this
			}]
		}
	},
	createRootNode : function() {
		return new Ext.tree.AsyncTreeNode({
			text 	  : '/',
			expanded  : false,
			loaded    : false,
			icon      : '/images/icons/server.png'
		});
	},
	initContextMenu : function() {
		this.contextMenu = new Ext.ComponentMgr.create({
			items : [{
				text    : 'import',
				icon    : '/images/icons/database_go.png',
				handler : this.onImportButtonClick,
				scope   : this
			}]
		},"menu");
	},
	onImportButtonClick : function() {
		var fullFileName = this.selectedNode.attributes.text;
		
		Ext.Ajax.request({
			url    : Dbms.Actions.database.entry,
			params : {
				databaseName : this.database,
				fileName     : fullFileName
			},
			success : this.onImportSuccessCb,
			failure : this.onImportFailureCb
		})
	},
	onNodeBeforeClick : function(node) {
		node.select();
		
		if(node.isLeaf()) {
			Dbms.Core.MessageBus.fireEvent('system.store.beforeshowfilecontent', this.idf);
			
			Ext.Ajax.request({
				url     : Dbms.Actions.system.dir,
				params  : {
					pathName : node.attributes.text
				},
				success : this.onSuccessCb,
				failure : this.onFailureCb,
				scope   : this
			});
			
			return false;
		}
		
		return true;
	},
	onNodeConextMenuClick : function(node, e) {
		node.select();
		
		if(node.isRoot) {
			return false;
		}
		
		e.target.contextMenu = this.contextMenu;
		e.target.contextMenu.showAt(e.xy);
		
		this.selectedNode = node;
		this.selectedNode.contextMenu = this.contextMenu;
		
		return true;
	},
	onSuccessCb : function(response) {
		var jn = Ext.decode(response.responseText, true);
	    /**
		 * responseText convert to json inpossible
		*/
		if(jn === false) {
			Ext.ux.Toast.msg('Error', Dbms.Constants.AJAX_COMUNICATION_ERROR);
			
		    return false;
		}
		
		switch(jn.success){
		    case true : {
				Dbms.Core.MessageBus.fireEvent('system.store.showfilecontent', {
					text     : jn.rows,
					overflow : jn.overflow,
					idf      : this.idf
				});
				
				break;
			}
			case false : {
				Dbms.Core.MessageBus.fireEvent('system.store.showfilecontenterror', this.idf);
				Ext.ux.Toast.msg('Error', jn.message);
				
				break;
			}
		}
		
		return true;
	},
	onFailureCb : function() {
		Dbms.Core.MessageBus.fireEvent('system.store.showfilecontenterror', this.idf);
		
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
		    msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
		});
	},
	onImportSuccessCb : function(response) {
		response = Ext.decode(response.responseText, true);
		
		if(response == null){
			return this.onImportFailureCb();
		}
		
		if(response.success) {
			return Ext.ux.Toast.msg('Success', 'Data have been successfully imported');
		}
		
		Ext.ux.Toast.msg('Error', response.msg);
		return true;
	},
	onImportFailureCb : function() {
		Ext.ux.Toast.msg('Error', Dbms.Constants.AJAX_COMUNICATION_ERROR);
	},
	onTreeRefresh: function() {
		this.root.reload();
	}
});

Ext.reg('database.import.tree', Dbms.Database.Importer.BaseImportTree);