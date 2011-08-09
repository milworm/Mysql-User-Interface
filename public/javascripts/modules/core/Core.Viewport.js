Ext.ns('Dbms.Core');
/**
 * Main Application Viewport
*/
Dbms.Core.Viewport = Ext.extend(Ext.Viewport, {
	constructor : function(){
		Dbms.Core.Viewport.superclass.constructor.call(this,{
			layout : 'border',
			items  : [
				this.getWestRegion(),
				this.getCenterRegion(),
				this.getEastRegion(),
				this.getSouthRegion()
		]});
		
		this.on('resize', this.viewportResized, this);
		this.east.on('resize', this.eastPanelResized, this);
		
		this.east.on('collapse',this.regionCollapsed,this.center);
		this.east.on('expand',this.regionExpanded,this.center);
		
		this.west.on('collapse',this.regionCollapsed,this.center);
		this.west.on('expand',this.regionExpanded,this.center);
		
		Dbms.Core.MessageBus.fireEvent('Dbms.Database.Tree.AddListenerToScrollTree');
	},
	eastPanelResized : function(){
		var layoutWidth = Dbms.Core.Viewport.center.getWidth();
		
		Ext.WindowMgr.each(function(wnd) {
			if(wnd.getWidth() > layoutWidth)
				wnd.setWidth(layoutWidth+10);
		},this);
		
		this.doLayout();
	},
	/**
	 * provides viewport re-render
	 * after window-size is changed
	*/
	viewportResized : function() {
		var layoutWidth = Dbms.Core.Viewport.center.getWidth();
		var eastWidth   = Dbms.Core.Viewport.east.getWidth();
		
		Ext.WindowMgr.each(function(wnd){
			wnd.setWidth(layoutWidth+eastWidth+10);
		},this);
		
		this.doLayout();
	},
	/**
	 * make re-render for each maximised window
	*/
	regionCollapsed : function(){
		Ext.WindowMgr.each(function(window,index,allWindows){
			if(window.maximized){
				window.setWidth(Dbms.Core.Viewport.center.getWidth());
			}
		},this);
	},
	/**
	 * make re-render for each maximised window
	*/
	regionExpanded : function(){
		var layoutWidth = Dbms.Core.Viewport.center.getWidth();
		
		Ext.WindowMgr.each(function(window,index,allWindows){
			if(window.maximized) {
				window.setWidth(layoutWidth);
			}
		},this);
	},
	/**
	 * @returns {object} west-region
	 *
	 * included database-tree-panel
	*/
	getWestRegion : function(){
		return {
			title    	: 'Avaible Databases',
			region   	: 'west',
			ref         : 'west',
			minWidth 	: 260,
			width    	: 260,
			collapsible : true,
			split    	: true,
			autoScroll  : true,
			tbar    	: {
				xtype : 'Dbms.Database.Tree.TopToolbar'
			},
			items       : [{
				xtype : 'Dbms.Database.Tree.TreePanel'
			}],
			bbar : {
				xtype : 'Dbms.Database.Tree.BottomToolbar'
			}
		}
	},
	/**
	 * @returns {object} east-region
	*/
	getEastRegion : function(){
		return {
			title    	: 'System Information',
			region   	: 'east',
			split   	: true,
			collapsible : true,
			ref         : 'east',
			width    	: 250,
			layout      : 'fit',
			minWidth 	: 250,
			collapsed   : true,
			listeners   : {
				expand : function() {
					Dbms.Core.MessageBus.fireEvent('Dbms.Core.Viewport.east.expand');
				}
			}
		}
	},
	/**
	 * @returns {object} south-region
	*/
	getSouthRegion : function(){
		return {
			region : 'south',
			ref    : 'south',
			height : 30,
			items  : [Dbms.Taskbar.Controller.panel]
		}
	},
	/**
	 * @returns {object} center-region
	*/
	getCenterRegion : function(){
		return {
			title  	  : 'center',
			region 	  : 'center',
			ref    	  : 'center',
			xtype  	  : 'tabpanel',
			activeTab : 0,
			defaults  : {
				closable : false
			},
			items : [{
				title : 'Server Information',
				xtype : "panel",
				items : [new Dbms.Dashboard.StatView],
				listeners : {
					show : function(){
						if(Dbms.Core.Viewport.rendered){
							Dbms.Core.Viewport.west.expand(true);
						}
					}
				}
			},{
				xtype  	  : 'panel',
				layout 	  : 'fit',
				title  	  : 'System Variables',
				items     : [{
					xtype : 'Dbms.Dashboard.Variables.Grid'
				}]
				//tbar   	  : this.getTopToolbar(),
				//activeTab : 0,
				//items  	  : [{
				//	flex    : .3,
				//	width   : '100%',
				//	xtype   : 'textarea',
				//	value   : "Type your sql-query here...",
				//	listeners : {
				//		click : function(btn){
				//			alert('ss');
				//		}
				//	}
				//},{
				//	flex  : .7,
				//	width : '100%',
				//	ref   : ''
				//}],
				//listeners : {
				//	show : function(){
				//			Dbms.Core.Viewport.west.expand(true);
				//		}
				//}
			},{
				xtype  : "panel",
				ref    : 'mysqlhelp',
				title  : "Mysql Help",
				layout : 'fit',
				listeners : {
					afterrender : function(){
						this.createMysqlHelpViewport();
					},
					show : function(){
						Dbms.Core.Viewport.east.collapse(true);
					},
					scope : this
				}
			}]
		}
	},
	/**
	 * @returns {object} west-region
	*/
	getTopToolbar : function(){
		return {
			xtype  : "toolbar",
			items  : [{
				xtype : "button",
				text  : 'Sql Patters',
				menu  : {
					xtype    : "menu",
					defaults : {
						minWindth : 100
					},
					items : [{
						text    : 'SELECT ...',
						//handler : this.sqlManagementClicked('select'),
						scope   : this
					},{
						text    : 'INSERT ...',
						//handler : this.sqlManagementClicked('insert'),
						scope   : this
					},{
						text    : 'UPDATE ...',
						//handler : this.sqlManagementClicked('update'),
						scope   : this
					},{
						text    : 'DELETE ...',
						//handler : this.sqlManagementClicked('delete'),
						scope   : this
					}]
				}
			}]
		}
	},
	/**
	 * create viewport for mysql-help
	*/
	createMysqlHelpViewport : function(){
		this.center.mysqlhelp.add(new Dbms.Help.Viewport());
	}
});