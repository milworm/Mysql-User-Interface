Ext.ns('Dbms.Database.Tree');
/**
 * convert received data 
 * for Database.TreePanel
*/
Dbms.Database.Tree.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    constructor : function() {
		Dbms.Database.Tree.TreeLoader.superclass.constructor.call(this, {
			url : Dbms.Actions.database.index,
			/**
			 * @private
			*/
			databaseNodeTextTpl : new Ext.Template('<div class="dbms-database-title-wrap">'+
														'{sqlLogo}<span class="dbms-database-size">{size} Mb</span>'+
														'<span class="dbms-database-title">{databaseName}</span>'+
												   '</div>', {
													compiled : true
			})
		});
		
		this.on('loadexception', this.onLoadExceptionEventHandler, this);
    },
    /**
	 * @override
	 * 
     * @param response {object}, json-object response from server
     * @param node {Ext.tree.TreeNode}, node that should be updated
    */
    processResponse : function(response, node) {
		var jn = Ext.decode(response.responseText, true);
	    /**
		 * responseText convert to json inpossible
		*/
		if(jn === false) {
		    Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
		    return false;
		}
	
		switch(jn.success) {
		    case true : {
				this.receivedData = jn;
				this.incomeNodes = jn.rows;
				this.nodeToUpdate = node;
				this.updateNodes(jn);
				
				break;
			}
			case false : {
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
					msg : jn.message
				});
				
				break;
			}
		}
		
		return true;
    },
    /**
     * handle the load-exception
     * while loading
     *
    */
    onLoadExceptionEventHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError');
    },
    /*
	 *
     */
    updateNodes : function(jn) {
		var newDatabaseName = this.nodeToUpdate.getOwnerTree()['newDatabaseName'];
		var singleSelect = jn.single_request;
		this.nodeToUpdate.beginUpdate();
		
        for(var i=0;i<this.incomeNodes.length;i++){
			if(!singleSelect || (singleSelect && typeof jn.single_type == 'undefined')){
				this.databaseDesc = this.incomeNodes[i];
				
				if(singleSelect) {
					var rootUpdationNode = false;
				} else {
					var rootUpdationNode = this.createDatabaseNode(); //create node for current database
				}
				
				this.setTableNode();
				this.appendTables();
				
				this.setRoutineNode();
				this.appendRoutines();
				
				this.setTriggerNode();
				this.appendTriggers();
				
				this.setViewNode();
				this.appendViews();
						
				if(this.incomeNodes[i].db_name == this.newDatabaseName) {	
				    this.highlitNode = rootUpdationNode;
				}
				
				if(rootUpdationNode) {
					rootUpdationNode.appendChild( [this.tableNode,this.triggerNode,this.routineNode, this.viewNode] );
					this.nodeToUpdate.appendChild(rootUpdationNode);
				} else {
					var databaseName = this.incomeNodes[i].db_name;
					var totalSpace = this.receivedData.size[databaseName] || 0;
					
					this.nodeToUpdate.appendChild([this.tableNode, this.triggerNode, this.routineNode, this.viewNode]);
					this.nodeToUpdate.setText(this.databaseNodeTextTpl.apply({
						databaseName : databaseName,
						size         : totalSpace,
						sqlLogo      : '<img class="dbms-exec-sql-logo" src="/images/icons/execsql2.png" style="cursor:pointer;"/>'
					}));
				}
			} else {
				this.databaseDesc = this.incomeNodes[0];
				switch(jn.single_type){
					case 'triggerRoot' : {
						this.setTriggerNode();
						this.appendTriggers(this.nodeToUpdate);
						break;
					}
					case 'routineRoot' : {
						this.setRoutineNode();
						this.appendRoutines(this.nodeToUpdate);
						break;
					
					}
					case 'tableRoot' : {
						//this.setTableNode();
						this.appendTables(this.nodeToUpdate);
						break;
					}
					case 'viewRoot' : {
						this.setViewNode();
						this.appendViews(this.nodeToUpdate);
					}
				}
			}
		}
		this.nodeToUpdate.endUpdate();
		this.nodeToUpdate.expand(10,true,function(){
		    if(typeof this.highlitNode != 'undefined'){
				this.highlitNode.ui.highlight();
				delete this.newDatabaseName;
				delete this.highlitNode;
			}
		},this);
		
		return true;
    },
    /**
     * docs
    */
    createDatabaseNode : function(){
		var totalSpace = this.receivedData.size[this.databaseDesc.db_name] || '0';
		var onNodeKeyPress = this.onNodeKeyPress;
		var node = this.createNode({
			text   : this.databaseNodeTextTpl.apply({
				databaseName : this.databaseDesc.db_name,
				size 		 : totalSpace,
				sqlLogo      : '<img class="dbms-exec-sql-logo" src="/images/icons/execsql2.png" style="cursor:pointer;"/>'
			}),
			leaf    : false,
			loaded  : true,
			iconCls : 'dbms-webdatabase',
			icon    : '/images/icons/web_database.png',
			cls     : 'database-tree-item',
			desc    : {
				type 		 : 'database',
				key 		 : this.databaseDesc.db_name,
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
		
		return node;
    },
	createRootNode : function() {
		return new Ext.tree.AsyncTreeNode({
			text 	 : 'Server',
			expanded : true,
			loaded   : true,
			qtip     : '{tip}',
			icon     : '/images/icons/server.png',
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	onNodeKeyPress : function(selectedNode) {
		var node = selectedNode;
		return function(e) {
			// hack to avoid bubling event
			if(e.flag){
				return false
			}
			
			e.flag = true;
			var charCode = e.charCode;
			var target = e.target;
			
			var databaseTitle = false;
			
			if(node.attributes.desc) {
				var databaseTitle = node.attributes.desc.databaseName;
			}
			
			Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.Database.keypress', {
				databaseName : databaseTitle,
				charCode     : charCode,
				node         : node
			});
		}
	},
    /*
     *append table node
     **/
    setTableNode : function(){
		this.tableNode = this.createNode({
		    text   : 'Tables('+this.databaseDesc.tables.length+')',
		    leaf   : false,
		    loaded : true,
		    icon   : '/images/icons/node_db_desc.png',
		    desc   : {
				type 		 : 'tableRoot',
				key          : '',
				databaseName : this.databaseDesc.db_name
		    },
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	/*
     * append tables to table-node
     **/
	appendTables : function(node) {
		var tableNode = this.tableNode;
		
		if(typeof node !== 'undefined') {
			node.setText('Tables(' + this.databaseDesc.tables.length + ')');
			tableNode = node;
		}
		
		for(var i=0;i<this.databaseDesc.tables.length;i++){
		    var tableName = this.databaseDesc.tables[i];
			tableNode.appendChild(this.createNode({
				text   : tableName[0]+' (<span style="color:brown;">'+tableName[1]+'</span>)',
				leaf   : true,
				loaded : true,
				qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
				desc   : {
					type 		 : 'table',
					key  		 : tableName[0],
					databaseName : this.databaseDesc.db_name
				},
				icon : '/images/icons/table.png',
				listeners : {
					click : function(node) {
						Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
						Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
						Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
					}.createDelegate(this)
				}
			}));
		}
    },
    /*
     * append trigger-node
     **/
    setTriggerNode : function(){
		this.triggerNode = this.createNode({
			text   : 'Triggers',
			leaf   : false,
			loaded : true,
			icon   : '/images/icons/sql_trigger.png',
			desc  : {
				type : 'triggerRoot',
				key  : 'triggers',
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	/**
	 * appends triggers to trigger-node
	*/
	appendTriggers : function(node){
		var triggerNode = node || this.triggerNode;
		var triggerCount = 0; //total triggers count for current database
		
		for(var i in this.databaseDesc.triggers){
			var triggerDesc = this.databaseDesc.triggers[i];
			
			if(typeof triggerDesc != 'undefined'){
				triggerCount += triggerDesc.length;
				var triggerTableNode = this.createNode({
					text   : i,
					leaf   : false,
					loaded : true,
					icon   : '/images/icons/table.png',
					qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
					desc   : {
						type : 'triggerTableStage',
						key  : i,
						databaseName : this.databaseDesc.db_name
					},
					listeners : {
						click : function(node) {
							Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
							Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
							Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
						}.createDelegate(this)
					}
				});
				
				for(var j=0;j<triggerDesc.length;j++){
					var trigger = triggerDesc[j]
					triggerTableNode.appendChild(this.createNode({
						text   : trigger[0]+' (<span style="color:brown;">'+trigger[1]+'_'+trigger[2]+'</span>)',
						leaf   : true,
						loaded : true,
						desc   : {
							type : 'trigger',
							key  : trigger[0],
							databaseName : this.databaseDesc.db_name
						},
						listeners : {
							click : function(node) {
								Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
								Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
								Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
							}.createDelegate(this)
						}
					}));
				}
				
				triggerNode.appendChild(triggerTableNode);
			}
		}
		triggerNode.setText('Triggers ('+triggerCount+')');
    },
    /*
     *append routines node
     **/
    setRoutineNode : function(){
		this.routineNode = this.createNode({
			text   : 'Routines',
			leaf   : false,
			loaded : true,
			qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
			icon   : '/images/icons/sql2.png',
			desc   : {
				type 		 : 'routineRoot',
				key          : '',
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	/**
	 * append routines to routine-root node
	*/
	appendRoutines : function(node){
		var routineNode = node || this.routineNode;
		var routines = this.databaseDesc.routines;
		var j = routines.functions.length + routines.procedures.length;
		//first append function node
		var functionsRoutineNode = routineNode.appendChild(this.createNode({
			text   : 'Functions',
			leaf   : false,
			qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
			loaded : true,
			desc   : {
				type : 'functionRoot',
				key  : 'routineFunctionsRoot',
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		}));
		
		for(var i=0;i<this.databaseDesc.routines.functions.length;i++){
			var fn = this.databaseDesc.routines.functions[i];
			functionsRoutineNode.appendChild(this.createNode({
				text   : fn,
				leaf   : true,
				qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
				loaded : true,
				desc   : {
					type : 'func',
					key  : fn,
					databaseName : this.databaseDesc.db_name
				},
				listeners : {
					click : function(node) {
						Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
						Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
						Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
					}.createDelegate(this)
				}
			}));
		}
		
		var proceduresRoutineNode = routineNode.appendChild(this.createNode({
			text   : 'Procedures',
			leaf   : false,
			qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
			loaded : true,
			desc   : {
				type : 'procedureRoot',
				key  : 'routineProceduresRoot',
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		}));
		
		for(var i=0;i<this.databaseDesc.routines.procedures.length;i++){
			var proc = this.databaseDesc.routines.procedures[i];
			proceduresRoutineNode.appendChild(this.createNode({
				text   : proc,
				leaf   : true,
				qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
				loaded : true,
				desc   : {
					type : 'procedure',
					key  : proc,
					databaseName : this.databaseDesc.db_name
				},
				listeners : {
					click : function(node) {
						Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
						Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
						Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
					}.createDelegate(this)
				}
			}));
		}
		
		routineNode.setText('Routines('+j+')');
    },
	/*
     *append views node
     **/
    setViewNode : function(){
		this.viewNode = this.createNode({
			text   : 'Views',
			leaf   : false,
			loaded : true,
			icon   : '/images/icons/table_sql_view.png',
			desc   : {
				type : 'viewRoot',
				key          : '',
				databaseName : this.databaseDesc.db_name
			},
			listeners : {
				click : function(node) {
					Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
					Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
					Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
				}.createDelegate(this)
			}
		});
	},
	/**
	 * append routines to routine-root node
	*/
	appendViews : function(node){
		var viewNode = node || this.viewNode;
		var j = 0;
		
		for(var i=0,j=0;i<this.databaseDesc.views.length;i++){
			var viewName = this.databaseDesc.views[i];
			viewNode.appendChild(this.createNode({
						text   : viewName[0]+'<span style="color:blue;">('+viewName[1]+')</span>',
						leaf   : true,
						loaded : true,
						qtip   : '<b>Database</b> : '+this.databaseDesc.db_name,
						icon   : '/images/icons/sql_view_item.png',
						desc   : {
							type : 'view',
							key  : viewName[0],
							databaseName : this.databaseDesc.db_name
						},
						listeners : {
							click : function(node) {
								Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.BottomToolbar.hide');
								Ext.get(node.ui.getEl()).dom.onkeypress = this.onNodeKeyPress(node);
								Ext.get(node.ui.getEl()).dom.onkeydown = this.onNodeKeyDown(node);
							}.createDelegate(this)
						}
			}));
			j++;
		}
		viewNode.setText('Views('+j+')');
    },
	onNodeKeyDown : function(node){
		node;
		return function(e) {	
			if(e.keyCode == 8) {//backspace
				if(e.flag) {
					return false;
				}
			
				e.flag = true;
				e.preventDefault();
				Dbms.Core.MessageBus.fireEvent('Dbms.TreePanel.Database.backspace');
			}
			
			return true;
		}
	}
	
});

Ext.reg('Dbms.Database.Tree.TreeLoader',Dbms.Database.Tree.TreeLoader);
