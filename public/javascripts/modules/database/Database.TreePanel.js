Ext.ns('Dbms.Database.Tree');

/**
 * Controls all operation with west-region
 * tree-panel, witch are
 * 
 * @shows avaible databases for current server
 * @displays all context menus for any type of item (database,table etc)
 * and so on
*/
Dbms.Database.Tree.TreePanel = Ext.extend(Ext.tree.TreePanel,{
	/**
	 * initialize context-menus
	 * call loader load-method
	 * and apply required listeners
	*/
    constructor : function() {
		Dbms.Database.Tree.TreePanel.superclass.constructor.call(this,{
			animate : true,
			border  : false,
			useArrows: true,
			ref     : 'databaseList',
			loader  : new Dbms.Database.Tree.TreeLoader,
			root    : this.createRootNode(),
			ctxMenus : [
				'RootCtx',
				'DatabaseCtx',
				'TableCtx',
				'TableRootCtx',
				'TriggerRootCtx',
				'RoutineRootCtx',
				'ProcedureRootCtx',
				'FunctionRootCtx',
				'ProcedureCtx',
				'FunctionCtx',
				'TriggerCtx',
				'TriggerTableStageCtx',
				'ViewRootCtx'
			]
		});
		//this.getContextMenusConfig();
		//initialize context-menus
		this.treeContextMenuInit();
		this.rootNodeTypes = ['tableRoot','triggerRoot','viewRoot','routineRoot'];
		this.rootNodeTypesDesc = ['table','trigger','view','routine'];
		//apply listeners
		this.on('click',this.onNodeClickedEventHandler,this);
		this.on('contextmenu',this.onNodeContextMenuEventHandler,this);
		
		Dbms.Core.MessageBus.on('Dbms.Database.Tree.TopToolbar.expandAll',this.expandAll,this);
		Dbms.Core.MessageBus.on('Dbms.Database.Tree.TopToolbar.collapseAll',this.collapseAll,this);
		Dbms.Core.MessageBus.on('Dbms.Database.Tree.AddListenerToScrollTree', this.addListenerToScrollTree,this);
		Dbms.Core.MessageBus.on('Dbms.System.VariableStore.loaded',this.updateRootQTip,this);
		Dbms.Core.MessageBus.on('Dbms.TreePanel.Filter',function(config) {
			clearTimeout(this.timeOut);
			this.timeOut = setTimeout(function(){
				this.filterTree(config);
			}.createDelegate(this), 500)
			
		}, this);
		//load tree
		this.loader.load(this.getRootNode());
    },
	beforeFilterTree : function(config) {
		var query = config.query;
		
		if(query.length == 0) {
			this.showAll();
			return false;
		}
		
		if(query.length < 3) {
			return false;
		}
		
		return true;
	},
	filterTree : function(config) {
		if(!this.beforeFilterTree(config)){
			return false;
		}
		
		var databaseName = config.databaseName;
		var query = config.query;
		var queryNode = config.node;
		
		var lookDb = query.substr(0,3) == 'db:';
		
		if(lookDb) {
			query = query.substring(3);
			
			if(query == ""){
				this.showAll(queryNode);
				return false;
			}
		}
		
		queryNode.cascade(function(node, d) {
			var attrs = node.attributes;
			
			if(node.isRoot) return
			
			if(lookDb) {
				this.filterByDatabase(node, query);
				return ;
			}
			
			//root node was selected
			if(databaseName === false) { 
				if(attrs.desc.key.toLowerCase().indexOf(query.toLowerCase()) != -1) {
					var parent = node.parentNode;
					node.ui.show();
					while(parent) {
						parent.ui.show();
						parent = parent.parentNode;
						
						if(parent) {
							parent.expand(true);
						}
					}
				} else {
					node.collapse();
					node.ui.hide();
				}
			}
			
			if(this.isNodeChildOf(node, queryNode)) {
				if(attrs.desc.key.toLowerCase().indexOf(query.toLowerCase()) != -1) {
					var parent = node.parentNode;
					while(parent) {
						parent.ui.show();
						parent = parent.parentNode;
						
						if(parent && parent !== this.root) {
							parent.expand(true);
							parent.ui.show();
						}
					}
					
					return node.ui.show();
				}
				
				node.collapse();
				return node.ui.hide();
			}
			
			return node.ui.show();
		}, this);
		
		if(databaseName !== false) queryNode.expand(true);
	},
	filterByDatabase : function(node, query){
		var attrs = node.attributes;
		
		if(attrs.desc.type.toLowerCase() == 'database'){
			if(attrs.desc.key.toLowerCase().indexOf(query.toLowerCase()) != -1) {
				node.collapse();
				node.ui.show();
						
				if(!node.isLeaf()) {
					node.cascade(function(n){
						n.collapse();
						n.ui.show();
					});	
				}
			} else {
				node.collapse();
				node.ui.hide();
			}
		}
	},
	isNodeChildOf : function(node, parent) {
		while(node) {
			if(parent.childNodes.indexOf(node) !== -1){
				return true;
			}
			
			node = node.parentNode;
		}
		
		return false;
	},
	createRootNode : function(){
		return new Ext.tree.AsyncTreeNode({
			text 	  : 'Server',
			expanded  : true,
			loaded    : true,
			icon      : '/images/icons/server.png',
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					var rootEl = Ext.get(node.ui.wrap).query('a:first')[0];
					rootEl.onkeypress = this.loader.onNodeKeyPress(node);
					rootEl.onkeydown = this.loader.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	addListenerToScrollTree : function(){
		this.on('expandnode',this.scrollNodeDown,this);
		this.on('collapsednode',this.scrollNodeTop,this);
	},
	/**
	 * update root-node qtip
	*/
	updateRootQTip : function(o){
		this.root.ui.elNode.innerHTML = this.root.ui.elNode.innerHTML.replace('{tip}',
			'<b>Hostname</b> : '+o.store.getByName('hostname').get('value')+"</br>"+
			'<b>Server Version</b> : '+o.store.getByName('version').get('value')+"</br>"+
			'<b>Protocol Version</b> : '+o.store.getByName('protocol_version').get('value')
		);
	},
	scrollNodeDown : function(n) {
		var nodeAbsolutePosition = this.absolutePostion(n.ui.getEl());
		
		if(nodeAbsolutePosition.top <= window.innerHeight/2){
			return ;
		}
		
		//get database node
		var el = Dbms.Core.Viewport.items.items[0].items.items[0].getEl().parent();
		el.scroll('b',n.ui.getEl().offsetTop - el.dom.scrollTop-47, {
			//easing : 'easeBothStrong',
			duration: .3
		});
	},
	scrollNodeTop : function(n){
		//get database node
		var el = Dbms.Core.Viewport.items.items[0].items.items[0].getEl().parent();
		el.scroll('b',n.ui.getEl().offsetDown + el.dom.scrollDown, {
			easing : 'backOut',
			duration: .2
		});
	},
    /**
     * initialize all-context-menus
    */
    treeContextMenuInit : function(){
		var menus = {
			root        : Dbms.ContextMenu.Root,
			database    : Dbms.ContextMenu.Database,
			tableRoot   : Dbms.ContextMenu.TableRoot,
			triggerRoot : Dbms.ContextMenu.TriggerRoot
		};
		
		this.menus = [];
		for(var i=0 in menus) {
			var menu = menus[i];
			this.menus[i] = new menu({tree:this})
		}
		
		this.initTableCtx();
		this.initRoutineRootMenuCtx();
		
		this.initFunctionRootMenuCtx();
		this.initProcedureRootMenuCtx();
		
		this.initFunctionMenuCtx();
		this.initProcedureMenuCtx();
		
		this.initTriggerRootMenuCtx();
		this.initTriggerMenuCtx();
		
		this.initTriggerTableStageMenuCtx();
		this.initViewMenuCtx();
		this.initViewRootMenuCtx();
    },
    /**
     * initialize context menu for root node
    */
    initRootCtx : function() {
		this.rootCtxMenu = new Ext.menu.Menu({
			items     : [{
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
			}]
		});
		//set listeners
		this.rootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.rootCtxMenu.createDatabaseBtn.on('click',this.createDatabase,this);
		this.rootCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	/**
     * initialize context menu for database node
    */
    initDatabaseCtx : function(){
		this.databaseCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Table',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Create New Stored Routine',
				icon : '/images/icons/table_add.png',
				ref  : 'createStoredRoutineBtn'
			},{
				text : 'Drop Database',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropDatabaseBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			},{
				text : 'Import from file',
				ref  : 'fileImportButton'
			},{
				text : 'Import from text',
				ref  : 'textImportButton'
			}]
		});
		//set listeners
		this.databaseCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.databaseCtxMenu.createStoredRoutineBtn.on('click',this.reloadTreeStore,this);
		this.databaseCtxMenu.dropDatabaseBtn.on('click',this.deleteNode,this);
		this.databaseCtxMenu.createDumpBtn.on('click',this.createDump,this);
		//this.databaseCtxMenu.fileImportButton.on('click',this.loadAutocompleteStructure,this);
		//this.databaseCtxMenu.execSqlBnt.on('click', this.execSql, this);
    },
	execSql : function(node) {
		var selectedNode = node || this.selectedNode;
		//this.loadAutocompleteStructure({
		//	node   : selectedNode,
		//	shadow : false
		//});
		
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Tree.TopToolbar.ExecSql',{
			dbName : selectedNode.attributes.desc.key
		});
	},
    /**
     * initialize context menu for table node
    */
    initTableCtx : function(){
		this.tableCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Alter Table',
				icon : '/images/icons/table_edit.png',
				ref  : 'alterTableBtn'
			},{	
				text : 'Drop Table',
				icon : '/images/icons/table_delete.png',
				ref  : 'deleteTableBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/table_go.png'
			}]
		});
		
		//set listeners
		this.tableCtxMenu.alterTableBtn.on('click',this.reloadTreeStore,this);
		this.tableCtxMenu.deleteTableBtn.on('click',this.deleteNode,this);
		this.tableCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	/**
     * initialize context menu for table-root node
    */
    initTableRootMenuCtx : function(){
		this.tableRootCtxMenu = new Ext.menu.Menu({
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
		});
		//set listeners
		this.tableRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.tableRootCtxMenu.createTableBtn.on('click',this.reloadTreeStore,this);
		this.tableRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
		this.tableRootCtxMenu.deleteTableBtn.on('click',this.deleteNode,this);
    },
	/**
     * initialize context menu for trigger-root node
    */
    initTriggerRootMenuCtx : function(){
		this.triggerRootCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Trigger',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Drop All Triggers',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropTriggerBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.triggerRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.triggerRootCtxMenu.createTableBtn.on('click',this.reloadTreeStore,this);
		this.triggerRootCtxMenu.dropTriggerBtn.on('click',this.deleteNode,this);
		this.triggerRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	/**
     * initialize context menu for routine-root node
    */
    initRoutineRootMenuCtx : function(){
		this.routineRootCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Stored Routine',
				icon : '/images/icons/table_add.png',
				ref  : 'createStoredRoutineBtn'
			},{
				text : 'Delete All Routines',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropAllRoutinesBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.routineRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.routineRootCtxMenu.createStoredRoutineBtn.on('click',this.reloadTreeStore,this);
		this.routineRootCtxMenu.dropAllRoutinesBtn.on('click',this.deleteNode,this);
		this.routineRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	/**
     * initialize context menu for routine node
    */
    initRoutineMenuCtx : function(){
		this.routineCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Table',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Create New Stored Routine',
				icon : '/images/icons/table_add.png',
				ref  : 'createTableBtn'
			},{
				text : 'Drop Database',
				icon : '/images/icons/database_delete.png',
				ref  : 'deleteDatabase'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.routineCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.routineCtxMenu.createTableBtn.on('click',this.reloadTreeStore,this);
		this.routineCtxMenu.deleteDatabase.on('click',this.deleteNode,this);
		this.routineCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	initFunctionRootMenuCtx : function(){
		this.functionRootCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Stored Function',
				icon : '/images/icons/table_add.png',
				ref  : 'createFunctionBtn'
			},{
				text : 'Drop All Functions',
				icon : '/images/icons/database_delete.png',
				ref  : 'deleteFunctions'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.functionRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.functionRootCtxMenu.createFunctionBtn.on('click',this.reloadTreeStore,this);
		this.functionRootCtxMenu.deleteFunctions.on('click',this.deleteNode,this);
		this.functionRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
	},
	initProcedureRootMenuCtx : function(){
		this.procedureRootCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New Stored Procedure',
				icon : '/images/icons/table_add.png',
				ref  : 'createFunctionBtn'
			},{
				text : 'Drop All Procedures',
				icon : '/images/icons/database_delete.png',
				ref  : 'deleteProcedure'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		//this.procedureRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		//this.procedureRootCtxMenu.createTableBtn.on('click',this.reloadTreeStore,this);
		//this.procedureRootCtxMenu.deleteDatabase.on('click',this.deleteNode,this);
		//this.procedureRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
	},
	initFunctionMenuCtx : function(){
		this.functionCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Drop Function',
				icon : '/images/icons/database_delete.png',
				ref  : 'deleteProcedure'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
	},
	initProcedureMenuCtx : function(){
		this.procedureCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Drop Procedure',
				icon : '/images/icons/database_delete.png',
				ref  : 'deleteProcedure'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
	},
	/**
     * initialize context menu for trigger node
    */
    initTriggerMenuCtx : function(){
		this.triggerCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Drop Trigger',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropTrigger'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		
		//set listeners
		this.triggerCtxMenu.dropTrigger.on('click',this.deleteNode,this);
		this.triggerCtxMenu.createDumpBtn.on('click',this.createDump,this);
    },
	initTriggerTableStageMenuCtx : function(){
		this.triggerTableStageCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Drop All Triggers',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropTrigger'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.triggerTableStageCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.triggerTableStageCtxMenu.dropTrigger.on('click',this.deleteNode,this);
		this.triggerTableStageCtxMenu.createDumpBtn.on('click',this.createDump,this);
	},
    initViewRootMenuCtx : function(){
		this.viewRootCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Refresh',
				icon : '/images/icons/database_refresh.png',
				ref  : 'refreshBtn'
			},{
				text : 'Create New View',
				icon : '/images/icons/table_add.png',
				ref  : 'createViewBtn'
			},{
				text : 'Delete All Views',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropAllViewsBtn'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		//set listeners
		this.viewRootCtxMenu.refreshBtn.on('click',this.reloadTreeStore,this);
		this.viewRootCtxMenu.createViewBtn.on('click',this.reloadTreeStore,this);
		this.viewRootCtxMenu.dropAllViewsBtn.on('click',this.deleteNode,this);
		this.viewRootCtxMenu.createDumpBtn.on('click',this.createDump,this);
	},
    initViewMenuCtx : function(){
		this.viewCtxMenu = new Ext.menu.Menu({
			items : [{
				text : 'Drop View',
				icon : '/images/icons/database_delete.png',
				ref  : 'dropView'
			},{
				text : 'Create dump',
				ref  : 'createDumpBtn',
				icon : '/images/icons/database_go.png'
			}]
		});
		
		this.viewCtxMenu.dropView.on('click',this.deleteNode,this);
		this.viewCtxMenu.createDumpBtn.on('click',this.createDump,this);
	},
	getClickedElementHandler : function(e){
		var method = '';
		switch (e.target.className){
			case 'dbms-exec-sql-logo' : {
				method = 'onExecSqlHandler';
				break;
			}
			
			default : {
				method = false;
			}
		}
		
		return method == false ? false : this[method].createDelegate(this);
	},
	/*
	 * handle clicking event to execute sql-query on database-node
	 * @param node {Object}
	 * @returns {void}
	 */
	onExecSqlHandler : function(node) {
		this.execSql(node);
	},
	/**
     * if node is leaf call onLeafNodeClicked
     * else collapsed or expand node depends on situation
    */
    onNodeClickedEventHandler : function(node,e) {
		Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
		var handler = this.getClickedElementHandler(e);
		
		if(handler) {
			handler(node);
			return false;
		}
		
		//if node is expanded and it has children collapse it
		if(node.leaf) {
			this.onLeafNodeClicked(node);
		} else {
			if(e.ctrlKey){
				node.select();
			} else {
				node.toggle();
			}
		}
		
		node.select();
		return false;
    }
    /**
     * expand all nodes
    */
    ,expandAll : function(){
		this.getRootNode().eachChild(function(node){
			node.expand(true);
		},this);
    }
    /**
     * collapse all nodes
    */
    ,collapseAll : function(node){
		node = node || this.getRootNode();
	    node.collapseChildNodes(2);
    },
    /**
     * reload the whole tree store
    */
    reloadTreeStore : function(){
	    this.loader.baseParams = {}
	    var params = this.getLoaderLoadParams();
		this.loader.url = params.url;
		this.loader.baseParams = params.request;
		
	    if(!this.selectedNode.isRoot){
		    this.loader.load(this.selectedNode);
	    } else {
		    this.loader.load(this.getRootNode());
	    }
    },
	/**
	 * @returns {array} of params
	 * of url, desc
	*/
	getLoaderLoadParams : function(){
		if(this.selectedNode.isRoot){
			return {
				url : Dbms.Actions.database.index
			}
		}
		var nodeDesc = this.selectedNode.attributes.desc;
		
		switch(nodeDesc.type){
			//case 'table' : return {
			//	url     : Actions.table.content,
			//	request : {
			//		table_name    : this.selectedNode.attributes.desc.key,
			//		database_name : this.getDatabaseName(this.selectedNode)
			//	}
			//}
			case 'tableRoot' : return {
				url     : Dbms.Actions.table.index,
				request : {
					database_name : this.getDatabaseName(this.selectedNode)
				}
			}
			case 'database' : return {
				url     : Dbms.Actions.database.index,
				request : { 
					database_name : this.getDatabaseName(this.selectedNode)
				}
			}
			//case 'routine' : return {
			//	url     : Actions.routine.content,
			//	request : {
			//		database_name : this.getDatabaseName(this.selectedNode)
			//	}
			//}
			case 'routineRoot' : return {
				url     : Dbms.Actions.routine.index,
				request : {
					database_name : this.getDatabaseName(this.selectedNode)
				}
			}
			//case 'trigger' : return {
			//	url     : Actions.trigger.content,
			//	request : {
			//		database_name : this.getDatabaseName(this.selectedNode),
			//		trigger_name  : this.selectedNode.attributes.desc.key
			//	}
			//}
			case 'triggerRoot' : return {
				url     : Dbms.Actions.trigger.index,
				request : {
					database_name : this.getDatabaseName(this.selectedNode)
				}
			}
			case 'viewRoot' : return {
				url     : Dbms.Actions.view.index,
				request : {
					database_name : this.getDatabaseName(this.selectedNode)
				}
			}
		}
	},
	/**
	 * @returns name of database for
	 * witch current node is
	*/
	getDatabaseName : function(node){
		while(!node.isRoot){
			if(node.attributes.desc.type == 'database'){
				return node.attributes.desc.key
			}
			
			node = node.parentNode;
		}
	},
    /*
     * process node-context-click-event
     * show valid context-menu depends on node-type
     * 
     * @param node {object}, clicked node
     * @param e {object} event
     */
    onNodeContextMenuEventHandler : function(node,e){
		node.select(); //make node selected
		var ctxMenu = node.isRoot ? this.menus.root : false;
	
		if(ctxMenu === false){
		    //check if property-desc exists
		    if(typeof node.attributes.desc == 'undefined'){
				return;
		    }
			
			ctxMenu = this.menus[node.attributes.desc.type];
		}
		
		e.target.contextMenu = ctxMenu;
		this.selectedNode = node;
		e.target.contextMenu.showAt(e.xy);
		this.selectedNode.contextMenu = ctxMenu;
    },
    /**
     * delete database or table with node
     * @param type {string} type of node needed to be deleted "table" or "db"
    */
    deleteNode : function(){
		var node = this.selectedNode;
		var nodeType = node.attributes.desc.type;
		var msg = 'Are you sure you want to delete ';
		var config = {
			node : node
		};
		var params = {
			db_name    : this.getDatabaseName(node),
			remove_all : this.rootNodeTypes.indexOf(nodeType) == -1 ? false : true,
			key 	   : node.attributes.desc.key
		}
		
		if(params.remove_all){
			params.type = this.rootNodeTypesDesc[this.rootNodeTypes.indexOf(nodeType)];
			msg += 'All '+params.type+'s';
		} else {
			params.type = nodeType;
			msg += params.type+' '+params.key;
		}
		
		switch(params.type) {
			case 'database' : {
				//remove database node
				config.link = Dbms.Actions.database.drop;
				break;
			}
			case 'table'    : {
				//remove table
				config.link = Dbms.Actions.table.drop;
				break;
			}
			case 'routine'    : {
				//remove routine
				config.link = Dbms.Actions.routine.drop;
				break;
			}
			case 'view' : {
				//remove view
				config.link = Dbms.Actions.view.drop;
				break;
			}
			case 'trigger' : {
				//remove trigger
				config.link = Dbms.Actions.trigger.drop;
				break;
			}
		}
		
		Ext.Msg.confirm('Confirm',msg, this.dropConfirm({
			config : config,
			params : params
		}).createDelegate(this));
    },
    /*
     * process clicked on leaf-node
     * @param node {object}, node which was clicked
     */
    onLeafNodeClicked : function(node) {
		var databaseName = this.getDatabaseName(node);
		var nodeType = node.attributes.desc.type;
		
		if(['database','table','trigger','func','procedure', 'view'].indexOf(nodeType) != -1){
			Dbms.Core.MessageBus.fireEvent('Dbms.Database.TreePanel.'+Ext.util.Format.capitalize(nodeType)+'NodeClick', {
				node 		 : node,
				databaseName : databaseName,
				uniqueKey    : Ext.id()
			});
		}
    },
    /*
     * //TODO
     */
    onTableNodeClickedEventHandler : function(node){
	//    //var structureNeeded = typeof Ext.StoreMgr.get(node.Database+'.'+node.tableName) == 'undefined'?true:false;
	//    var tableName = node.attributes.tableName;
	//    var databaseName = node.parentNode.attributes.databaseName;
	//    
	//    if(Ext.StoreMgr.get(databaseName+'.'+tableName)){
	//	    Dbms.Core.MessageBus.fireEvent('TreePanel.RestoreOpenedWindow',{
	//		    key : databaseName+'.'+tableName
	//	    });
	//    } else {
	//	    Ext.Ajax.request({
	//		    url    : Actions.table.structure,
	//		    method : 'post',
	//		    params : {
	//			    table_name    : tableName,
	//			    database_name : databaseName
	//		    },
	//		    success : function(response){
	//			    var o = Ext.decode(response.responseText);
	//			    Dbms.Core.MessageBus.fireEvent('Database.tableInfoLoaded',o);
	//		    },
	//		    failure : function(response){
	//			    var c = {title : 'Error',
	//					     text  : 'Sorry, an error occured while loading...'};
	//			    Dbms.Core.MessageBus.fireEvent('showPopUpDialog',c);
	//		    }
	//	    });
	//    }
    },
    /**
     * removes item from server
     * item specified in config
    */
    dropConfirm : function(c){
		c;
	    return function(result) {
		    if(result != 'yes') return false;
			
			Ext.Ajax.request({
				url     : c.config.link,
				method  : 'post',
				params  : c.params,
				success : function(response) {
					var jn = Ext.decode(response.responseText, true);
					    
					if(jn === false) {
						Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
							msg : response.responseText
						});
						
						return false;
					} else {
						if(jn.success === true) {
							this.removeDeletedNode(c);
							
							//Dbms.Core.MessageBus.fireEvent('Dbms.Garbage.Collector.collect', {
							//	databaseName : databaseName,
							//	type         : jn.type,
							//	itemNameList : jn.deleted
							//});
					    } else {
							Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
								msg : jn.message
							});
						}
				    }
					return true;
				},
				failure : function(response){
					var o = {
						msg : response.responseText
					}
					Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',o);
				},
				scope : this
			});
			return true;
	    }
    },
	removeDeletedNode : function(o){
		var n = o.config.node;
		while(n.attributes.desc.type != 'database'){
			n = n.parentNode;
		}
			
		var databaseName = n.attributes.desc.key;
		
		if(o.params.remove_all) {
			var startText = n.text.substring(0, o.config.node.text.indexOf('('));
				n.setText(startText+'(0)');
				n.removeAll();
		} else {
			var parentNode = o.config.node.parentNode;
			var startText = parentNode.text.substring(0,parentNode.text.indexOf('('));
			parentNode.setText(startText+'('+(parentNode.childNodes.length-1)+')');
			n.destroy(false);
		}
	},
    createDump : function(){
	    Dbms.Core.MessageBus.fireEvent('Dbms.Database.CreateDump');
    },
	/**
	 * shows dialog to create new database
	*/
    createDatabase : function(){
		Ext.Msg.prompt('Create new database','Plese, enter the database name',function(res,txt){
		    if(res != 'ok'){
				return false;
			}
			
			this.loader.newDatabaseName = txt;
			Ext.Ajax.request({
				params  : {
					db_name : txt
				},
				scope   : this,
				url     : Dbms.Actions.database.create,
				success : function(res){
					var jn = Ext.decode(res.responseText, true);
					
					if(jn === false){
						delete this.loader.newDatabaseName;
						Dbms.Core.MessageBus.fireEvent('AjaxError',{msg : res.responseText});
						return false; 
					}
					
					switch(jn.success){
						case true  : {
							this.loader.load(this.getRootNode());
							break;
						}
						case false : {
							delete this.loader.newDatabaseName;
							Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError', {msg : jn.message});
						}
					}
					
					return true;
				},
				failure : function(res){
				    delete this.newDatabaseName;
				    Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{msg : res.responseText});
				}
			});
			
			return true;
	    },this);
    },
    /*
     * get the node type [table,root,database]
     * and call specific function to perform dump operation
     */
    createDump : function(){
		alert('s');
    },
	absolutePostion : function(obj,offsetLeft, offsetTop){
        var orig = obj;
        var left = 0;
        var top = 0;
        if(offsetLeft) left = offsetLeft;
        if(offsetTop) top = offsetTop;
		
        if(obj.offsetParent){
                left += obj.offsetLeft;
                top += obj.offsetTop;
				
                while (obj = obj.offsetParent) {
                        left += (obj.offsetLeft-obj.scrollLeft+obj.clientLeft);
                        top += (obj.offsetTop-obj.scrollTop+obj.clientTop);
                }
        }
		
        return {left:left, top:top, width: orig.offsetWidth, height: orig.offsetHeight};
	},
	showAll : function(node) {
		node = node || this.root;
		this.collapseAll(node);
		node.cascade(function(n, d) {
			n.attributes.desc && n.ui.show();
		}, this);
	}
});

Ext.reg('Dbms.Database.Tree.TreePanel', Dbms.Database.Tree.TreePanel);
